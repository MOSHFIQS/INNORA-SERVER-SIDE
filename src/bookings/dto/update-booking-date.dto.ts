import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBookingDateDto {
     @ApiProperty({ example: '101' })
     @IsString()
     @IsNotEmpty()
     roomId: string;

     @ApiProperty({ example: '2026-09-15' })
     @IsString()
     @IsNotEmpty()
     oldDate: string;

     @ApiProperty({ example: '2026-09-20' })
     @IsString()
     @IsNotEmpty()
     newDate: string;

     @ApiPropertyOptional({ example: 'customer@innora.com' })
     @IsOptional()
     @IsString()
     email?: string;
}
