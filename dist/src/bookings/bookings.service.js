"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../common/prisma/prisma.service");
let BookingsService = BookingsService_1 = class BookingsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BookingsService_1.name);
    }
    async create(dto, currentUserId) {
        const room = await this.prisma.room.findFirst({
            where: {
                deletedAt: null,
                OR: [{ id: dto.roomId }, { roomId: dto.roomId }],
            },
        });
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        if (!room.isAvailable) {
            throw new common_1.BadRequestException('This room is currently not available for booking');
        }
        const targetDate = dto.date.trim();
        if (room.bookedDates && room.bookedDates.includes(targetDate)) {
            throw new common_1.BadRequestException('Room already booked for this date');
        }
        let user = null;
        if (currentUserId) {
            user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
        }
        else if (dto.userEmail) {
            user = await this.prisma.user.findUnique({ where: { email: dto.userEmail.toLowerCase().trim() } });
        }
        if (!user && dto.userEmail) {
            const email = dto.userEmail.toLowerCase().trim();
            const nameParts = (dto.userName || 'Guest User').trim().split(' ');
            const firstName = nameParts[0] || 'Guest';
            const lastName = nameParts.slice(1).join(' ') || 'User';
            user = await this.prisma.user.create({
                data: {
                    email,
                    password: '$2a$10$dummyguestpasswordhashforbookingautogen',
                    firstName,
                    lastName,
                    fullName: `${firstName} ${lastName}`,
                    phone: dto.userPhone || null,
                },
            });
        }
        if (!user) {
            throw new common_1.BadRequestException('User email or authentication is required to complete booking');
        }
        const existingUserBooking = await this.prisma.booking.findFirst({
            where: {
                userId: user.id,
                date: targetDate,
                status: { notIn: [client_1.BookingStatus.CANCELLED] },
                deletedAt: null,
            },
        });
        if (existingUserBooking) {
            throw new common_1.BadRequestException('User already booked for this date');
        }
        const bookingNumber = `INN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const price = dto.price || room.pricePerNight;
        const totalAmount = price;
        const image = dto.image || (room.images?.main || '/fallback.jpg');
        const title = dto.title || room.title;
        const booking = await this.prisma.booking.create({
            data: {
                bookingNumber,
                userId: user.id,
                roomId: room.id,
                userEmail: user.email,
                userName: user.fullName || `${user.firstName} ${user.lastName}`,
                userPhone: dto.userPhone || user.phone || null,
                title,
                image,
                date: targetDate,
                totalNights: 1,
                price,
                totalAmount,
                currency: room.currency,
                guests: dto.guests || 1,
                specialRequests: dto.specialRequests || null,
                status: client_1.BookingStatus.CONFIRMED,
                paymentStatus: client_1.PaymentStatus.PAID,
            },
            include: { room: true },
        });
        const updatedBookedDates = Array.from(new Set([...(room.bookedDates || []), targetDate]));
        await this.prisma.room.update({
            where: { id: room.id },
            data: { bookedDates: updatedBookedDates },
        });
        await this.prisma.notification.create({
            data: {
                userId: user.id,
                type: client_1.NotificationType.BOOKING,
                title: 'Booking Confirmed',
                message: `Your booking for ${room.title} (Room #${room.roomNumber}) on ${targetDate} is confirmed!`,
                data: { bookingId: booking.id, bookingNumber },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                role: user.role,
                action: client_1.AuditAction.BOOKING_CREATED,
                entity: 'Booking',
                entityId: booking.id,
                description: `Created booking #${bookingNumber} for room ${room.roomNumber} on ${targetDate}`,
            },
        });
        return this.formatBooking(booking);
    }
    async findMyBookings(userId, email) {
        const where = {
            deletedAt: null,
            status: { notIn: [client_1.BookingStatus.CANCELLED] },
        };
        if (userId) {
            where.userId = userId;
        }
        else if (email) {
            where.userEmail = email.toLowerCase().trim();
        }
        else {
            return [];
        }
        const bookings = await this.prisma.booking.findMany({
            where,
            include: { room: true },
            orderBy: { createdAt: 'desc' },
        });
        return bookings.map(this.formatBooking);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, status, paymentStatus, roomId, userEmail, email, date, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const where = {
            deletedAt: null,
        };
        if (status)
            where.status = status;
        if (paymentStatus)
            where.paymentStatus = paymentStatus;
        if (roomId)
            where.roomId = roomId;
        if (date)
            where.date = date;
        const targetEmail = userEmail || email;
        if (targetEmail) {
            where.userEmail = { contains: targetEmail, mode: 'insensitive' };
        }
        if (search) {
            where.OR = [
                { bookingNumber: { contains: search, mode: 'insensitive' } },
                { userEmail: { contains: search, mode: 'insensitive' } },
                { userName: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [total, bookings] = await Promise.all([
            this.prisma.booking.count({ where }),
            this.prisma.booking.findMany({
                where,
                include: { room: true, user: true },
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: bookings.map(this.formatBooking),
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id) {
        const booking = await this.prisma.booking.findFirst({
            where: {
                deletedAt: null,
                OR: [{ id }, { bookingNumber: id }],
            },
            include: { room: true, user: true },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return this.formatBooking(booking);
    }
    async updateBookingDate(dto, currentUserId) {
        const { roomId, oldDate, newDate, email } = dto;
        const room = await this.prisma.room.findFirst({
            where: {
                deletedAt: null,
                OR: [{ id: roomId }, { roomId }],
            },
        });
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        if (room.bookedDates && room.bookedDates.includes(newDate)) {
            throw new common_1.BadRequestException('This room is already booked');
        }
        const whereClause = {
            roomId: room.id,
            date: oldDate,
            deletedAt: null,
            status: { notIn: [client_1.BookingStatus.CANCELLED] },
        };
        if (currentUserId) {
            whereClause.userId = currentUserId;
        }
        else if (email) {
            whereClause.userEmail = email.toLowerCase().trim();
        }
        const booking = await this.prisma.booking.findFirst({
            where: whereClause,
        });
        if (!booking) {
            throw new common_1.NotFoundException('No active booking found to update for this room and date');
        }
        const updatedBooking = await this.prisma.booking.update({
            where: { id: booking.id },
            data: { date: newDate },
        });
        const currentDates = room.bookedDates || [];
        const updatedDates = currentDates.filter((d) => d !== oldDate);
        updatedDates.push(newDate);
        await this.prisma.room.update({
            where: { id: room.id },
            data: { bookedDates: Array.from(new Set(updatedDates)) },
        });
        await this.prisma.notification.create({
            data: {
                userId: booking.userId,
                type: client_1.NotificationType.INFO,
                title: 'Booking Rescheduled',
                message: `Your booking #${booking.bookingNumber} has been updated from ${oldDate} to ${newDate}.`,
                data: { bookingId: booking.id },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: booking.userId,
                action: client_1.AuditAction.BOOKING_UPDATED,
                entity: 'Booking',
                entityId: booking.id,
                description: `Rescheduled booking #${booking.bookingNumber} from ${oldDate} to ${newDate}`,
            },
        });
        return {
            success: true,
            message: 'Booking date updated successfully',
            result: {
                bookingUpdated: this.formatBooking(updatedBooking),
                oldDateRemoved: oldDate,
                newDateAdded: newDate,
            },
        };
    }
    async cancelBooking(params) {
        let booking = null;
        if (params.id) {
            booking = await this.prisma.booking.findUnique({
                where: { id: params.id },
                include: { room: true },
            });
        }
        else if (params.email && params.roomId && params.date) {
            const room = await this.prisma.room.findFirst({
                where: {
                    OR: [{ id: params.roomId }, { roomId: params.roomId }],
                },
            });
            if (room) {
                booking = await this.prisma.booking.findFirst({
                    where: {
                        roomId: room.id,
                        userEmail: params.email.toLowerCase().trim(),
                        date: params.date,
                        status: { notIn: [client_1.BookingStatus.CANCELLED] },
                    },
                    include: { room: true },
                });
            }
        }
        if (!booking || booking.deletedAt) {
            throw new common_1.NotFoundException('No active booking found to cancel');
        }
        const updatedBooking = await this.prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: client_1.BookingStatus.CANCELLED,
                cancelledAt: new Date(),
                cancellationReason: params.reason || 'Cancelled by guest/admin',
            },
        });
        if (booking.room) {
            const currentDates = booking.room.bookedDates || [];
            const updatedDates = currentDates.filter((d) => d !== booking.date);
            await this.prisma.room.update({
                where: { id: booking.room.id },
                data: { bookedDates: updatedDates },
            });
        }
        await this.prisma.notification.create({
            data: {
                userId: booking.userId,
                type: client_1.NotificationType.WARNING,
                title: 'Booking Cancelled',
                message: `Booking #${booking.bookingNumber} for ${booking.title} on ${booking.date} was cancelled.`,
                data: { bookingId: booking.id },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: booking.userId,
                action: client_1.AuditAction.BOOKING_CANCELLED,
                entity: 'Booking',
                entityId: booking.id,
                description: `Cancelled booking #${booking.bookingNumber} for date ${booking.date}`,
            },
        });
        return {
            success: true,
            message: 'Booking deleted successfully',
            booking: this.formatBooking(updatedBooking),
        };
    }
    async updateStatus(id, dto, adminUserId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: { room: true },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const updated = await this.prisma.booking.update({
            where: { id },
            data: {
                status: dto.status ?? booking.status,
                paymentStatus: dto.paymentStatus ?? booking.paymentStatus,
                cancellationReason: dto.cancellationReason ?? booking.cancellationReason,
                cancelledAt: dto.status === client_1.BookingStatus.CANCELLED ? new Date() : booking.cancelledAt,
            },
        });
        if (dto.status === client_1.BookingStatus.CANCELLED && booking.room) {
            const updatedDates = (booking.room.bookedDates || []).filter((d) => d !== booking.date);
            await this.prisma.room.update({
                where: { id: booking.room.id },
                data: { bookedDates: updatedDates },
            });
        }
        await this.prisma.auditLog.create({
            data: {
                userId: adminUserId,
                action: client_1.AuditAction.UPDATE,
                entity: 'Booking',
                entityId: booking.id,
                description: `Updated booking #${booking.bookingNumber} status to ${dto.status || booking.status}`,
            },
        });
        return this.formatBooking(updated);
    }
    async update(id, dto, currentUserId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: { room: true },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const updateData = {};
        if (dto.userName !== undefined)
            updateData.userName = dto.userName;
        if (dto.userEmail !== undefined)
            updateData.userEmail = dto.userEmail.toLowerCase().trim();
        if (dto.userPhone !== undefined)
            updateData.userPhone = dto.userPhone;
        if (dto.guests !== undefined)
            updateData.guests = Number(dto.guests);
        if (dto.specialRequests !== undefined)
            updateData.specialRequests = dto.specialRequests;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.paymentStatus !== undefined)
            updateData.paymentStatus = dto.paymentStatus;
        if (dto.price !== undefined)
            updateData.price = Number(dto.price);
        if (dto.totalAmount !== undefined)
            updateData.totalAmount = Number(dto.totalAmount);
        if (dto.cancellationReason !== undefined)
            updateData.cancellationReason = dto.cancellationReason;
        if (dto.date && dto.date !== booking.date) {
            updateData.date = dto.date;
            if (booking.room) {
                const currentDates = (booking.room.bookedDates || []).filter((d) => d !== booking.date);
                currentDates.push(dto.date);
                await this.prisma.room.update({
                    where: { id: booking.room.id },
                    data: { bookedDates: Array.from(new Set(currentDates)) },
                });
            }
        }
        if (dto.status === client_1.BookingStatus.CANCELLED && booking.status !== client_1.BookingStatus.CANCELLED) {
            updateData.cancelledAt = new Date();
            if (booking.room) {
                const updatedDates = (booking.room.bookedDates || []).filter((d) => d !== booking.date);
                await this.prisma.room.update({
                    where: { id: booking.room.id },
                    data: { bookedDates: updatedDates },
                });
            }
        }
        const updated = await this.prisma.booking.update({
            where: { id },
            data: updateData,
            include: { room: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: currentUserId || booking.userId,
                action: client_1.AuditAction.BOOKING_UPDATED,
                entity: 'Booking',
                entityId: booking.id,
                description: `Updated details for booking #${booking.bookingNumber}`,
            },
        });
        return this.formatBooking(updated);
    }
    formatBooking(booking) {
        return {
            ...booking,
            _id: booking.id,
            roomId: booking.room?.roomId || booking.roomId,
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map