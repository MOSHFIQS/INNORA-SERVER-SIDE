import { BookingStatus, PaymentStatus } from '@prisma/client';
export declare class UpdateBookingStatusDto {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    cancellationReason?: string;
}
