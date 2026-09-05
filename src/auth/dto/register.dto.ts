import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
     @ApiProperty({ example: 'guest@innora.com' })
     @IsEmail({}, { message: 'Please provide a valid email address' })
     @IsNotEmpty({ message: 'Email is required' })
     email: string;

     @ApiProperty({ example: 'Password@123' })
     @IsString()
     @IsNotEmpty({ message: 'Password is required' })
     @MinLength(6, { message: 'Password must be at least 6 characters long' })
     password: string;

     @ApiProperty({ example: 'Sarah' })
     @IsString()
     @IsNotEmpty({ message: 'First name is required' })
     firstName: string;

     @ApiProperty({ example: 'Jenkins' })
     @IsString()
     @IsNotEmpty({ message: 'Last name is required' })
     lastName: string;

     @ApiPropertyOptional({ example: '+1 (555) 234-5678' })
     @IsOptional()
     @IsString()
     phone?: string;

     @ApiPropertyOptional({ enum: UserRole, default: UserRole.CUSTOMER })
     @IsOptional()
     @IsEnum(UserRole)
     role?: UserRole = UserRole.CUSTOMER;
}
