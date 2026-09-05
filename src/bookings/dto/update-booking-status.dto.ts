import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateBookingStatusDto {
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
     cancellationReason?: string;
}
