import { UserRole, UserStatus } from '@prisma/client';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
    avatarUrl?: string;
    bio?: string;
}
