import { ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryInquiryDto extends PaginationDto {
     @ApiPropertyOptional({ enum: InquiryStatus })
     @IsOptional()
     @IsEnum(InquiryStatus)
     status?: InquiryStatus;
}
