import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
     @ApiProperty({ example: 'staff@innora.com' })
     @IsEmail()
     @IsNotEmpty()
     email: string;

     @ApiProperty({ example: 'Staff@123456' })
     @IsString()
     @IsNotEmpty()
     @MinLength(6)
     password: string;

     @ApiProperty({ example: 'David' })
     @IsString()
     @IsNotEmpty()
     firstName: string;

     @ApiProperty({ example: 'Miller' })
     @IsString()
     @IsNotEmpty()
     lastName: string;

     @ApiPropertyOptional({ example: '+1 (555) 987-6543' })
     @IsOptional()
     @IsString()
     phone?: string;

     @ApiPropertyOptional({ enum: UserRole, default: UserRole.STAFF })
     @IsOptional()
     @IsEnum(UserRole)
     role?: UserRole = UserRole.STAFF;

     @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.ACTIVE })
     @IsOptional()
     @IsEnum(UserStatus)
     status?: UserStatus = UserStatus.ACTIVE;
}
