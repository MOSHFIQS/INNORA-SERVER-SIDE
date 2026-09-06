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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../common/prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(dto, meta) {
        const email = dto.email.toLowerCase().trim();
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    ...(dto.phone ? [{ phone: dto.phone }] : []),
                ],
            },
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('An account with this email already exists');
            }
            throw new common_1.ConflictException('An account with this phone number already exists');
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
                role: dto.role || client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                lastLoginAt: new Date(),
                lastLoginIp: meta?.ipAddress,
                lastDevice: meta?.device,
            },
        });
        await this.createAuditLog({
            userId: user.id,
            role: user.role,
            action: client_1.AuditAction.CREATE,
            entity: 'User',
            entityId: user.id,
            description: `User registered with email ${user.email}`,
            meta,
        });
        const accessToken = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            accessToken,
        };
    }
    async login(dto, meta) {
        const email = dto.email.toLowerCase().trim();
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.deletedAt) {
            throw new common_1.UnauthorizedException('Account has been deactivated. Please contact support.');
        }
        if (user.status === client_1.UserStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Account is suspended. Please contact management.');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: meta?.ipAddress,
                lastDevice: meta?.device,
            },
        });
        await this.createAuditLog({
            userId: user.id,
            role: user.role,
            action: client_1.AuditAction.LOGIN,
            entity: 'User',
            entityId: user.id,
            description: `User logged in from ${meta?.ipAddress || 'unknown IP'}`,
            meta,
        });
        const accessToken = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            accessToken,
        };
    }
    async logout(userId, meta) {
        await this.createAuditLog({
            userId,
            action: client_1.AuditAction.LOGOUT,
            entity: 'User',
            entityId: userId,
            description: 'User logged out',
            meta,
        });
        return { message: 'Logged out successfully' };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.deletedAt) {
            throw new common_1.UnauthorizedException('User profile not found');
        }
        return this.sanitizeUser(user);
    }
    async updateProfile(userId, dto, meta) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const firstName = dto.firstName?.trim() ?? user.firstName;
        const lastName = dto.lastName?.trim() ?? user.lastName;
        const fullName = `${firstName} ${lastName}`;
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                fullName,
                phone: dto.phone !== undefined ? dto.phone : user.phone,
                avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : user.avatarUrl,
                bio: dto.bio !== undefined ? dto.bio : user.bio,
                address: dto.address !== undefined ? dto.address : user.address,
                city: dto.city !== undefined ? dto.city : user.city,
                country: dto.country !== undefined ? dto.country : user.country,
                gender: dto.gender !== undefined ? dto.gender : user.gender,
            },
        });
        await this.createAuditLog({
            userId,
            role: updated.role,
            action: client_1.AuditAction.PROFILE_CHANGE,
            entity: 'User',
            entityId: userId,
            description: 'Updated user profile information',
            meta,
        });
        return this.sanitizeUser(updated);
    }
    async changePassword(userId, dto, meta) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.newPassword, salt);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        await this.createAuditLog({
            userId,
            role: user.role,
            action: client_1.AuditAction.UPDATE,
            entity: 'User',
            entityId: userId,
            description: 'Changed account password',
            meta,
        });
        return { message: 'Password updated successfully' };
    }
    async validateUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.deletedAt || user.status === client_1.UserStatus.SUSPENDED) {
            return null;
        }
        return user;
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            avatarUrl: user.avatarUrl,
        };
        return this.jwtService.sign(payload);
    }
    sanitizeUser(user) {
        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            address: user.address,
            city: user.city,
            country: user.country,
            createdAt: user.createdAt,
        };
    }
    async createAuditLog(params) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: params.userId,
                    role: params.role,
                    action: params.action,
                    entity: params.entity,
                    entityId: params.entityId,
                    description: params.description,
                    ipAddress: params.meta?.ipAddress,
                    device: params.meta?.device,
                    userAgent: params.meta?.userAgent,
                },
            });
        }
        catch (e) {
            this.logger.warn(`Failed to write audit log: ${e.message}`);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map