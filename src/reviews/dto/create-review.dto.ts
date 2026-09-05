import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
     @ApiPropertyOptional({ example: '101' })
     @IsOptional()
     @IsString()
     roomId?: string;

     @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
     @IsInt()
     @Min(1)
     @Max(5)
     rating: number;

     @ApiProperty({ example: 'Exceptional stay! The ocean view and room service were beyond expectations.' })
     @IsString()
     @IsNotEmpty()
     comment: string;

     @ApiPropertyOptional({ example: 'Sarah Jenkins' })
     @IsOptional()
     @IsString()
     user_name?: string;

     @ApiPropertyOptional({ example: 'customer@innora.com' })
     @IsOptional()
     @IsEmail()
     user_email?: string;

     @ApiPropertyOptional({ example: 'Exceptional Luxury' })
     @IsOptional()
     @IsString()
     title?: string;
}
