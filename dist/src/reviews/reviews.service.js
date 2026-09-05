"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../common/prisma/prisma.service");
let ReviewsService = ReviewsService_1 = class ReviewsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReviewsService_1.name);
    }
    async create(targetRoomId, dto, currentUserId) {
        const room = await this.prisma.room.findFirst({
            where: {
                deletedAt: null,
                OR: [{ id: targetRoomId }, { roomId: targetRoomId }],
            },
        });
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        let user = null;
        if (currentUserId) {
            user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
        }
        else if (dto.user_email) {
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
            throw new common_1.BadRequestException('User identification (email or login) is required to leave a review');
        }
        const review = await this.prisma.review.create({
            data: {
                userId: user.id,
                roomId: room.id,
                userEmail: user.email,
                userName: dto.user_name || user.fullName || user.firstName,
                rating: dto.rating,
                comment: dto.comment,
                status: client_1.ReviewStatus.APPROVED,
            },
        });
        await this.recalculateRoomRating(room.id);
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: client_1.AuditAction.REVIEW_CREATED,
                entity: 'Review',
                entityId: review.id,
                description: `Submitted ${dto.rating}-star review for room ${room.roomNumber}`,
            },
        });
        const updatedRoom = await this.prisma.room.findUnique({ where: { id: room.id } });
        return updatedRoom;
    }
    async findByRoom(roomId, query) {
        const room = await this.prisma.room.findFirst({
            where: {
                deletedAt: null,
                OR: [{ id: roomId }, { roomId }],
            },
        });
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {
            roomId: room.id,
            deletedAt: null,
            status: client_1.ReviewStatus.APPROVED,
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
    async findAll(query) {
        const { page = 1, limit = 10, status, roomId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (status)
            where.status = status;
        if (roomId)
            where.roomId = roomId;
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
    async delete(id) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        await this.prisma.review.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await this.recalculateRoomRating(review.roomId);
        return { message: 'Review deleted successfully' };
    }
    async updateStatus(id, status) {
        const review = await this.prisma.review.update({
            where: { id },
            data: { status },
        });
        await this.recalculateRoomRating(review.roomId);
        return review;
    }
    async recalculateRoomRating(roomId) {
        const reviews = await this.prisma.review.findMany({
            where: {
                roomId,
                deletedAt: null,
                status: client_1.ReviewStatus.APPROVED,
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = ReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map