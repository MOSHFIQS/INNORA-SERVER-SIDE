import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { UpdateBookingDateDto } from './dto/update-booking-date.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
export declare class BookingsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateBookingDto, currentUserId?: string): Promise<any>;
    findMyBookings(userId?: string, email?: string): Promise<any[]>;
    findAll(query: QueryBookingDto): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findOne(id: string): Promise<any>;
    updateBookingDate(dto: UpdateBookingDateDto, currentUserId?: string): Promise<{
        success: boolean;
        message: string;
        result: {
            bookingUpdated: any;
            oldDateRemoved: string;
            newDateAdded: string;
        };
    }>;
    cancelBooking(params: {
        id?: string;
        email?: string;
        roomId?: string;
        date?: string;
        reason?: string;
        currentUserId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        booking: any;
    }>;
    updateStatus(id: string, dto: UpdateBookingStatusDto, adminUserId?: string): Promise<any>;
    update(id: string, dto: any, currentUserId?: string): Promise<any>;
    private formatBooking;
}
