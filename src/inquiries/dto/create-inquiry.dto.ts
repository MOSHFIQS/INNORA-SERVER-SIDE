import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInquiryDto {
     @ApiProperty({ example: 'David Miller' })
     @IsString()
     @IsNotEmpty()
     name: string;

     @ApiProperty({ example: 'david@example.com' })
     @IsEmail()
     @IsNotEmpty()
     email: string;

     @ApiPropertyOptional({ example: '+1 (555) 345-6789' })
     @IsOptional()
     @IsString()
     phone?: string;

     @ApiPropertyOptional({ example: 'Wedding Reception / Banquet Hall Inquiry' })
     @IsOptional()
     @IsString()
     subject?: string;

     @ApiProperty({ example: 'Hello, I would like to inquire about hosting a private event...' })
     @IsString()
     @IsNotEmpty()
     message: string;
}
