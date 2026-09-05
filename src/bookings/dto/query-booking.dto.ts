import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryBookingDto extends PaginationDto {
     @ApiPropertyOptional({ enum: BookingStatus })
     @IsOptional()
     @IsEnum(BookingStatus)
     status?: BookingStatus;

     @ApiPropertyOptional({ enum: PaymentStatus })
     @IsOptional()
     @IsEnum(PaymentStatus)
     paymentStatus?: PaymentStatus;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     roomId?: string;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     userEmail?: string;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     email?: string;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     date?: string;
}
