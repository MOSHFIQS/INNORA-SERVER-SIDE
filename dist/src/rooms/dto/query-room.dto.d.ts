import { RoomStatus, RoomType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryRoomDto extends PaginationDto {
    type?: RoomType;
    status?: RoomStatus;
    bedType?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
    isAvailable?: boolean;
    isFeatured?: boolean;
    email?: string;
}
