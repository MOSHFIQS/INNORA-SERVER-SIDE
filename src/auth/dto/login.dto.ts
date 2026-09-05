import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
     @ApiProperty({ example: 'admin@innora.com' })
     @IsEmail({}, { message: 'Please provide a valid email address' })
     @IsNotEmpty({ message: 'Email is required' })
     email: string;

     @ApiProperty({ example: 'Admin@123456' })
     @IsString()
     @IsNotEmpty({ message: 'Password is required' })
     @MinLength(6, { message: 'Password must be at least 6 characters long' })
     password: string;
}
