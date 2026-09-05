import { InquiryStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryInquiryDto extends PaginationDto {
    status?: InquiryStatus;
}
