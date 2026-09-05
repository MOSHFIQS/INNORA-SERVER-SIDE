import {
     BadRequestException,
     Injectable,
     Logger,
     NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@Injectable()
export class ReviewsService {
     private readonly logger = new Logger(ReviewsService.name);

     constructor(private readonly prisma: PrismaService) {}

     async create(targetRoomId: string, dto: CreateReviewDto, currentUserId?: string) {
          const room = await this.prisma.room.findFirst({
               where: {
                    deletedAt: null,
                    OR: [{ id: targetRoomId }, { roomId: targetRoomId }],
               },
          });

          if (!room) {
               throw new NotFoundException('Room not found');
          }

          let user: any = null;
          if (currentUserId) {
               user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
          } else if (dto.user_email) {
               user = await this.prisma.user.findUnique({ where: { email: dto.user_email.toLowerCase().trim() } });
          }

          if (!user && dto.user_email) {
               const email = dto.user_email.toLowerCase().trim();
               const name = (dto.user_name || 'Anonymous Guest').trim();
               const [first, ...rest] = name.split(' ');
               user = await this.prisma.user.create({
                    data: {
                         email,
                         password: '$2a$10$dummyguestpasswordhashforreviewautogen',
                         firstName: first || 'Guest',
                         lastName: rest.join(' ') || 'User',
                         fullName: name,
                    },
               });
          }

          if (!user) {
               throw new BadRequestException('User identification (email or login) is required to leave a review');
          }

          const review = await this.prisma.review.create({
               data: {
                    userId: user.id,
                    roomId: room.id,
                    userEmail: user.email,
                    userName: dto.user_name || user.fullName || user.firstName,
                    rating: dto.rating,
                    comment: dto.comment,
                    status: ReviewStatus.APPROVED,
               },
          });

          // Recalculate room rating and review count
          await this.recalculateRoomRating(room.id);

          await this.prisma.auditLog.create({
               data: {
                    userId: user.id,
                    action: AuditAction.REVIEW_CREATED,
                    entity: 'Review',
                    entityId: review.id,
                    description: `Submitted ${dto.rating}-star review for room ${room.roomNumber}`,
               },
          });

          const updatedRoom = await this.prisma.room.findUnique({ where: { id: room.id } });
          return updatedRoom;
     }

     async findByRoom(roomId: string, query: QueryReviewDto) {
          const room = await this.prisma.room.findFirst({
               where: {
                    deletedAt: null,
                    OR: [{ id: roomId }, { roomId }],
               },
          });

          if (!room) {
               throw new NotFoundException('Room not found');
          }

          const { page = 1, limit = 10 } = query;
          const skip = (page - 1) * limit;

          const where: Prisma.ReviewWhereInput = {
               roomId: room.id,
               deletedAt: null,
               status: ReviewStatus.APPROVED,
          };

          const [total, reviews] = await Promise.all([
               this.prisma.review.count({ where }),
               this.prisma.review.findMany({
                    where,
                    include: { user: true },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
               }),
          ]);

          return {
               data: reviews,
               meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
               },
          };
     }

     async findAll(query: QueryReviewDto) {
          const { page = 1, limit = 10, status, roomId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
          const skip = (page - 1) * limit;

          const where: Prisma.ReviewWhereInput = {
               deletedAt: null,
          };

          if (status) where.status = status;
          if (roomId) where.roomId = roomId;

          const [total, reviews] = await Promise.all([
               this.prisma.review.count({ where }),
               this.prisma.review.findMany({
                    where,
                    include: { room: true, user: true },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
               }),
          ]);

          return {
               data: reviews,
               meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
               },
          };
     }

     async delete(id: string) {
          const review = await this.prisma.review.findUnique({ where: { id } });
          if (!review) throw new NotFoundException('Review not found');

          await this.prisma.review.update({
               where: { id },
               data: { deletedAt: new Date() },
          });

          await this.recalculateRoomRating(review.roomId);

          return { message: 'Review deleted successfully' };
     }

     async findMyReviews(userId: string) {
          return this.prisma.review.findMany({
               where: { userId, deletedAt: null },
               include: { room: true },
               orderBy: { createdAt: 'desc' },
          });
     }

     async findOne(id: string) {
          const review = await this.prisma.review.findFirst({
               where: { id, deletedAt: null },
               include: { room: true, user: true },
          });
          if (!review) throw new NotFoundException('Review not found');
          return review;
     }

     async update(id: string, data: any, userId?: string) {
          const review = await this.prisma.review.findUnique({ where: { id } });
          if (!review) throw new NotFoundException('Review not found');

          const updateData: any = {};
          if (data.rating !== undefined) updateData.rating = Number(data.rating);
          if (data.comment !== undefined) updateData.comment = data.comment;
          if (data.status !== undefined) updateData.status = data.status;

          const updated = await this.prisma.review.update({
               where: { id },
               data: updateData,
               include: { room: true },
          });

          await this.recalculateRoomRating(review.roomId);
          return updated;
     }

     async updateStatus(id: string, status: ReviewStatus) {
          const review = await this.prisma.review.update({
               where: { id },
               data: { status },
          });

          await this.recalculateRoomRating(review.roomId);
          return review;
     }

     private async recalculateRoomRating(roomId: string) {
          const reviews = await this.prisma.review.findMany({
               where: {
                    roomId,
                    deletedAt: null,
                    status: ReviewStatus.APPROVED,
               },
               select: { rating: true },
          });

          const count = reviews.length;
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const averageRating = count > 0 ? parseFloat((totalRating / count).toFixed(1)) : 0.0;

          await this.prisma.room.update({
               where: { id: roomId },
               data: {
                    rating: averageRating,
                    reviewsCount: count,
               },
          });
     }
}
