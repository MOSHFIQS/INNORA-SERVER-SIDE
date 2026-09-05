import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UserProfileDto {
     @ApiProperty()
     id: string;

     @ApiProperty()
     email: string;

     @ApiPropertyOptional()
     phone?: string | null;

     @ApiProperty()
     firstName: string;

     @ApiProperty()
     lastName: string;

     @ApiProperty()
     fullName: string;

     @ApiProperty({ enum: UserRole })
     role: UserRole;

     @ApiProperty({ enum: UserStatus })
     status: UserStatus;

     @ApiPropertyOptional()
     avatarUrl?: string | null;

     @ApiPropertyOptional()
     bio?: string | null;

     @ApiPropertyOptional()
     address?: string | null;

     @ApiPropertyOptional()
     city?: string | null;

     @ApiPropertyOptional()
     country?: string | null;

     @ApiProperty()
     createdAt: Date;
}

export class AuthResponseDto {
     @ApiProperty({ type: UserProfileDto })
     user: UserProfileDto;

     @ApiPropertyOptional({ description: 'JWT token provided for Bearer header authentication fallback' })
     accessToken?: string;
}

export interface JwtPayload {
     sub: string;
     email: string;
     role: UserRole;
     iat?: number;
     exp?: number;
}
