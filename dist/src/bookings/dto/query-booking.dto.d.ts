import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryBookingDto extends PaginationDto {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    roomId?: string;
    userEmail?: string;
    email?: string;
    date?: string;
}
