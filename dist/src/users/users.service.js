"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../common/prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (role)
            where.role = role;
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [total, users] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    role: true,
                    status: true,
                    avatarUrl: true,
                    bio: true,
                    address: true,
                    city: true,
                    country: true,
                    lastLoginAt: true,
                    createdAt: true,
                    _count: {
                        select: {
                            bookings: true,
                            reviews: true,
                        },
                    },
                },
            }),
        ]);
        return {
            data: users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                bookings: {
                    where: { deletedAt: null },
                    include: { room: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                reviews: {
                    where: { deletedAt: null },
                    include: { room: true },
                    take: 5,
                },
            },
        });
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('User not found');
        }
        const { password, ...sanitized } = user;
        return sanitized;
    }
    async create(dto, creatorId) {
        const email = dto.email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`;
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: dto.firstName.trim(),
                lastName: dto.lastName.trim(),
                fullName,
                phone: dto.phone?.trim() || null,
                role: dto.role,
                status: dto.status ?? client_1.UserStatus.ACTIVE,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: creatorId,
                action: client_1.AuditAction.CREATE,
                entity: 'User',
                entityId: user.id,
                description: `Created account for ${user.email} with role ${user.role}`,
            },
        });
        const { password, ...sanitized } = user;
        return sanitized;
    }
    async update(id, dto, updaterId) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('User not found');
        }
        const firstName = dto.firstName ?? user.firstName;
        const lastName = dto.lastName ?? user.lastName;
        const fullName = `${firstName} ${lastName}`;
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                firstName,
                lastName,
                fullName,
                email: dto.email ? dto.email.toLowerCase().trim() : user.email,
                phone: dto.phone !== undefined ? dto.phone : user.phone,
                role: dto.role ?? user.role,
                status: dto.status ?? user.status,
                avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : user.avatarUrl,
                bio: dto.bio !== undefined ? dto.bio : user.bio,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: updaterId,
                action: client_1.AuditAction.UPDATE,
                entity: 'User',
                entityId: user.id,
                description: `Updated profile/role for user ${user.email}`,
            },
        });
        const { password, ...sanitized } = updated;
        return sanitized;
    }
    async delete(id, deleterId) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), status: client_1.UserStatus.INACTIVE },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: deleterId,
                action: client_1.AuditAction.DELETE,
                entity: 'User',
                entityId: id,
                description: `Soft deleted user account ${user.email}`,
            },
        });
        return { message: 'User account removed successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map