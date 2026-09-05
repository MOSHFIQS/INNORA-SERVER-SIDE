import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus, RoomType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryRoomDto extends PaginationDto {
     @ApiPropertyOptional({ enum: RoomType })
     @IsOptional()
     @IsEnum(RoomType)
     type?: RoomType;

     @ApiPropertyOptional({ enum: RoomStatus })
     @IsOptional()
     @IsEnum(RoomStatus)
     status?: RoomStatus;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     bedType?: string;

     @ApiPropertyOptional()
     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     minPrice?: number;

     @ApiPropertyOptional()
     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     maxPrice?: number;

     @ApiPropertyOptional()
     @IsOptional()
     @Type(() => Number)
     @IsNumber()
     guests?: number;

     @ApiPropertyOptional()
     @IsOptional()
     @Type(() => Boolean)
     @IsBoolean()
     isAvailable?: boolean;

     @ApiPropertyOptional()
     @IsOptional()
     @Type(() => Boolean)
     @IsBoolean()
     isFeatured?: boolean;

     @ApiPropertyOptional({ description: 'Legacy query parameter: user email' })
     @IsOptional()
     @IsString()
     email?: string;
}
