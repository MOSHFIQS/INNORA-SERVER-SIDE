import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookingDto {
     @ApiProperty({ example: '101', description: 'Room ID or Room UUID' })
     @IsString()
     @IsNotEmpty()
     roomId: string;

     @ApiProperty({ example: '2026-09-15', description: 'Booking date (YYYY-MM-DD)' })
     @IsString()
     @IsNotEmpty()
     date: string;

     @ApiPropertyOptional({ example: 'customer@innora.com' })
     @IsOptional()
     @IsEmail()
     userEmail?: string;

     @ApiPropertyOptional({ example: 'Sarah Jenkins' })
     @IsOptional()
     @IsString()
     userName?: string;

     @ApiPropertyOptional({ example: '+1 (555) 234-5678' })
     @IsOptional()
     @IsString()
     userPhone?: string;

     @ApiPropertyOptional({ example: 'Presidential Ocean Suite' })
     @IsOptional()
     @IsString()
     title?: string;

     @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b' })
     @IsOptional()
     @IsString()
     image?: string;

     @ApiPropertyOptional({ example: 280.0 })
     @IsOptional()
     @IsNumber()
     @Min(0)
     price?: number;

     @ApiPropertyOptional({ example: 2 })
     @IsOptional()
     @IsInt()
     @Min(1)
     guests?: number = 1;

     @ApiPropertyOptional({ example: 'High floor, extra pillows requested' })
     @IsOptional()
     @IsString()
     specialRequests?: string;
}
