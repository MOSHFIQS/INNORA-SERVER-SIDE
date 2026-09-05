import { AuthUser } from '../auth/decorators/current-user.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { UpdateBookingDateDto } from './dto/update-booking-date.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(dto: CreateBookingDto, user?: AuthUser): Promise<any>;
    findBookings(query: QueryBookingDto, user?: AuthUser): Promise<any[]>;
    findMyBookings(user: AuthUser): Promise<any[]>;
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
    updateDateLegacy(dto: UpdateBookingDateDto, user?: AuthUser): Promise<{
        success: boolean;
        message: string;
        result: {
            bookingUpdated: any;
            oldDateRemoved: string;
            newDateAdded: string;
        };
    }>;
    cancelBooking(emailOrId: string, body: {
        roomId?: string;
        date?: string;
        reason?: string;
    }, user?: AuthUser): Promise<{
        success: boolean;
        message: string;
        booking: any;
    }>;
    findOne(id: string): Promise<any>;
    updateStatus(id: string, dto: UpdateBookingStatusDto, user: AuthUser): Promise<any>;
    update(id: string, dto: any, user: AuthUser): Promise<any>;
}
