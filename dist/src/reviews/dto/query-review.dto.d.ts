import { ReviewStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryReviewDto extends PaginationDto {
    status?: ReviewStatus;
    roomId?: string;
}
