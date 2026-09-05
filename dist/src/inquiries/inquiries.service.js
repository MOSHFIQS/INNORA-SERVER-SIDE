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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../common/prisma/prisma.service");
let InquiriesService = class InquiriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
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
                status: client_1.InquiryStatus.PENDING,
            },
        });
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (status)
            where.status = status;
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
    async findMyInquiries(userId) {
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
                    ...(userEmail ? [{ email: { equals: userEmail, mode: 'insensitive' } }] : []),
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, user) {
        const inquiry = await this.prisma.inquiry.findFirst({
            where: {
                deletedAt: null,
                OR: [{ id }, { inquiryNumber: id }],
            },
            include: { user: true },
        });
        if (!inquiry)
            throw new common_1.NotFoundException('Inquiry not found');
        if (user && user.role === client_1.UserRole.CUSTOMER) {
            const userEmail = user.email?.toLowerCase().trim();
            const isOwner = inquiry.userId === user.id ||
                (userEmail && inquiry.email.toLowerCase().trim() === userEmail);
            if (!isOwner) {
                throw new common_1.ForbiddenException('You do not have permission to view this inquiry');
            }
        }
        return inquiry;
    }
    async updateStatus(id, status, adminNotes) {
        const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
        if (!inquiry)
            throw new common_1.NotFoundException('Inquiry not found');
        return this.prisma.inquiry.update({
            where: { id },
            data: {
                status,
                adminNotes: adminNotes ?? inquiry.adminNotes,
                repliedAt: status === client_1.InquiryStatus.CONTACTED || status === client_1.InquiryStatus.RESOLVED ? new Date() : inquiry.repliedAt,
            },
        });
    }
    async delete(id) {
        const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
        if (!inquiry)
            throw new common_1.NotFoundException('Inquiry not found');
        return this.prisma.inquiry.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.InquiriesService = InquiriesService;
exports.InquiriesService = InquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InquiriesService);
//# sourceMappingURL=inquiries.service.js.map