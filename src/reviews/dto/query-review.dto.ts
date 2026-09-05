import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryReviewDto extends PaginationDto {
     @ApiPropertyOptional({ enum: ReviewStatus })
     @IsOptional()
     @IsEnum(ReviewStatus)
     status?: ReviewStatus;

     @ApiPropertyOptional()
     @IsOptional()
     @IsString()
     roomId?: string;
}
