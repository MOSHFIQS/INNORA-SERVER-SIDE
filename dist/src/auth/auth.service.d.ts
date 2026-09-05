import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserProfileDto } from './dto/response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
interface RequestMeta {
    ipAddress?: string;
    device?: string;
    userAgent?: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto, meta?: RequestMeta): Promise<{
        user: UserProfileDto;
        accessToken: string;
    }>;
    login(dto: LoginDto, meta?: RequestMeta): Promise<{
        user: UserProfileDto;
        accessToken: string;
    }>;
    logout(userId: string, meta?: RequestMeta): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<UserProfileDto>;
    updateProfile(userId: string, dto: UpdateProfileDto, meta?: RequestMeta): Promise<UserProfileDto>;
    changePassword(userId: string, dto: ChangePasswordDto, meta?: RequestMeta): Promise<{
        message: string;
    }>;
    validateUserById(userId: string): Promise<{
        id: string;
        phone: string | null;
        email: string;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        password: string;
        firstName: string;
        lastName: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        bio: string | null;
        city: string | null;
        country: string | null;
        postalCode: string | null;
        dateOfBirth: Date | null;
        gender: string | null;
        emailVerified: boolean;
        phoneVerified: boolean;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        lastDevice: string | null;
        deletedAt: Date | null;
    }>;
    private generateToken;
    private sanitizeUser;
    private createAuditLog;
}
export {};
