import { UserRole, UserStatus } from '@prisma/client';
export declare class UserProfileDto {
    id: string;
    email: string;
    phone?: string | null;
    firstName: string;
    lastName: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string | null;
    bio?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    createdAt: Date;
}
export declare class AuthResponseDto {
    user: UserProfileDto;
    accessToken?: string;
}
export interface JwtPayload {
    sub: string;
    id?: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatarUrl?: string | null;
    iat?: number;
    exp?: number;
}
