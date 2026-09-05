import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus, RoomType } from '@prisma/client';
import {
     IsArray,
     IsBoolean,
     IsEnum,
     IsInt,
     IsNotEmpty,
     IsNumber,
     IsObject,
     IsOptional,
     IsString,
     Min,
} from 'class-validator';

export class CreateRoomDto {
     @ApiProperty({ example: '101' })
     @IsString()
     @IsNotEmpty()
     roomId: string;

     @ApiProperty({ example: '101' })
     @IsString()
     @IsNotEmpty()
     roomNumber: string;

     @ApiPropertyOptional({ default: 1 })
     @IsOptional()
     @IsInt()
     @Min(1)
     floor?: number = 1;

     @ApiProperty({ example: 'Presidential Ocean Suite' })
     @IsString()
     @IsNotEmpty()
     title: string;

     @ApiPropertyOptional({ example: 'Luxury suite featuring panoramic ocean view...' })
     @IsOptional()
     @IsString()
     description?: string;

     @ApiPropertyOptional({ example: 'Oceanfront suite with private balcony & Jacuzzi' })
     @IsOptional()
     @IsString()
     shortDescription?: string;

     @ApiPropertyOptional({ enum: RoomType, default: RoomType.DELUXE })
     @IsOptional()
     @IsEnum(RoomType)
     type?: RoomType = RoomType.DELUXE;

     @ApiPropertyOptional({ enum: RoomStatus, default: RoomStatus.AVAILABLE })
     @IsOptional()
     @IsEnum(RoomStatus)
     status?: RoomStatus = RoomStatus.AVAILABLE;

     @ApiPropertyOptional({ default: true })
     @IsOptional()
     @IsBoolean()
     isAvailable?: boolean = true;

     @ApiPropertyOptional({ example: 'King' })
     @IsOptional()
     @IsString()
     bedType?: string = 'King';

     @ApiProperty({ example: 280.0 })
     @IsNumber()
     @Min(0)
     pricePerNight: number;

     @ApiPropertyOptional({ example: 'USD' })
     @IsOptional()
     @IsString()
     currency?: string = 'USD';

     @ApiPropertyOptional({ example: 2 })
     @IsOptional()
     @IsInt()
     @Min(1)
     maxGuests?: number = 2;

     @ApiPropertyOptional({ example: 550 })
     @IsOptional()
     @IsInt()
     @Min(50)
     roomSizeSqFt?: number = 350;

     @ApiPropertyOptional({ example: 'Ocean' })
     @IsOptional()
     @IsString()
     view?: string = 'Ocean';

     @ApiPropertyOptional({ example: ['WiFi', 'Smart TV', 'Coffee Maker', 'Jacuzzi', 'Room Service'] })
     @IsOptional()
     @IsArray()
     @IsString({ each: true })
     features?: string[] = [];

     @ApiPropertyOptional({ example: ['Smoke Detector', 'Fire Extinguisher', 'Safe Box'] })
     @IsOptional()
     @IsArray()
     @IsString({ each: true })
     safetyFeatures?: string[] = [];

     @ApiProperty({
          example: {
               main: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
               gallery: ['https://images.unsplash.com/photo-1590490360182-c33d57733427'],
          },
     })
     @IsNotEmpty()
     images: {
          main: string;
          gallery?: string[];
     };

     @ApiPropertyOptional({ default: false })
     @IsOptional()
     @IsBoolean()
     isFeatured?: boolean = false;
}
