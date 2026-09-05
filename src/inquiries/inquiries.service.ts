import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InquiryStatus, Prisma, UserRole } from '@prisma/client';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { QueryInquiryDto } from './dto/query-inquiry.dto';

@Injectable()
export class InquiriesService {
     constructor(private readonly prisma: PrismaService) {}

     async create(dto: CreateInquiryDto, userId?: string) {
          const normalizedEmail = dto.email.toLowerCase().trim();
          let resolvedUserId = userId;

          if (!resolvedUserId && normalizedEmail) {
               const matchedUser = await this.prisma.user.findUnique({
                    where: { email: normalizedEmail },
                    select: { id: true },
               });
               if (matchedUser) {
                    resolvedUserId = matchedUser.id;
               }
          }

          const inquiryNumber = `INQ-${Date.now().toString().slice(-6)}`;
          return this.prisma.inquiry.create({
               data: {
                    inquiryNumber,
                    userId: resolvedUserId,
                    name: dto.name.trim(),
                    email: normalizedEmail,
                    phone: dto.phone?.trim() || null,
                    subject: dto.subject?.trim() || null,
                    message: dto.message.trim(),
                    status: InquiryStatus.PENDING,
               },
          });
     }

     async findAll(query: QueryInquiryDto) {
          const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
          const skip = (page - 1) * limit;

          const where: Prisma.InquiryWhereInput = {
               deletedAt: null,
          };

          if (status) where.status = status;
          if (search) {
               where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { subject: { contains: search, mode: 'insensitive' } },
                    { message: { contains: search, mode: 'insensitive' } },
               ];
          }

          const [total, items] = await Promise.all([
               this.prisma.inquiry.count({ where }),
               this.prisma.inquiry.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
               }),
          ]);

          return {
               data: items,
               meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
               },
          };
     }

     async findMyInquiries(userId: string) {
          const user = await this.prisma.user.findUnique({
               where: { id: userId },
               select: { email: true },
          });
          const userEmail = user?.email?.toLowerCase().trim();

          return this.prisma.inquiry.findMany({
               where: {
                    deletedAt: null,
                    OR: [
                         { userId },
                         ...(userEmail ? [{ email: { equals: userEmail, mode: 'insensitive' as const } }] : []),
                    ],
               },
               orderBy: { createdAt: 'desc' },
          });
     }

     async findOne(id: string, user?: AuthUser) {
          const inquiry = await this.prisma.inquiry.findFirst({
               where: {
                    deletedAt: null,
                    OR: [{ id }, { inquiryNumber: id }],
               },
               include: { user: true },
          });
          if (!inquiry) throw new NotFoundException('Inquiry not found');

          if (user && user.role === UserRole.CUSTOMER) {
               const userEmail = user.email?.toLowerCase().trim();
               const isOwner =
                    inquiry.userId === user.id ||
                    (userEmail && inquiry.email.toLowerCase().trim() === userEmail);
               if (!isOwner) {
                    throw new ForbiddenException('You do not have permission to view this inquiry');
               }
          }

          return inquiry;
     }

     async updateStatus(id: string, status: InquiryStatus, adminNotes?: string) {
          const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
          if (!inquiry) throw new NotFoundException('Inquiry not found');

          return this.prisma.inquiry.update({
               where: { id },
               data: {
                    status,
                    adminNotes: adminNotes ?? inquiry.adminNotes,
                    repliedAt: status === InquiryStatus.CONTACTED || status === InquiryStatus.RESOLVED ? new Date() : inquiry.repliedAt,
               },
          });
     }

     async delete(id: string) {
          const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
          if (!inquiry) throw new NotFoundException('Inquiry not found');

          return this.prisma.inquiry.update({
               where: { id },
               data: { deletedAt: new Date() },
          });
     }
}
