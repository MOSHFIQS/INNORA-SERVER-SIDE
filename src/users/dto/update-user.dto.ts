import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     firstName?: string;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     lastName?: string;

     @ApiPropertyOptional()
     @IsOptional()
     @IsEmail()
     email?: string;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     phone?: string;

     @ApiPropertyOptional({ enum: UserRole })
     @IsOptional()
     @IsEnum(UserRole)
     role?: UserRole;

     @ApiPropertyOptional({ enum: UserStatus })
     @IsOptional()
     @IsEnum(UserStatus)
     status?: UserStatus;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     avatarUrl?: string;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     bio?: string;
}
