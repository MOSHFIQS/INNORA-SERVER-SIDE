import {
     BadRequestException,
     Injectable,
     Logger,
     NotFoundException,
} from '@nestjs/common';
import { AuditAction, BookingStatus, NotificationType, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { UpdateBookingDateDto } from './dto/update-booking-date.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Injectable()
export class BookingsService {
     private readonly logger = new Logger(BookingsService.name);

     constructor(private readonly prisma: PrismaService) {}

     async create(dto: CreateBookingDto, currentUserId?: string) {
          // Resolve room by id or roomId
          const room = await this.prisma.room.findFirst({
               where: {
                    deletedAt: null,
                    OR: [{ id: dto.roomId }, { roomId: dto.roomId }],
               },
          });

          if (!room) {
               throw new NotFoundException('Room not found');
          }

          if (!room.isAvailable) {
               throw new BadRequestException('This room is currently not available for booking');
          }

          const targetDate = dto.date.trim();

          // 1. Check if room is already booked on this date
          if (room.bookedDates && room.bookedDates.includes(targetDate)) {
               throw new BadRequestException('Room already booked for this date');
          }

          // 2. Resolve user
          let user: any = null;
          if (currentUserId) {
               user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
          } else if (dto.userEmail) {
               user = await this.prisma.user.findUnique({ where: { email: dto.userEmail.toLowerCase().trim() } });
          }

          if (!user && dto.userEmail) {
               // Create guest/customer user account automatically if not registered
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
               throw new BadRequestException('User email or authentication is required to complete booking');
          }

          // 3. Check if user already has an active booking on this date
          const existingUserBooking = await this.prisma.booking.findFirst({
               where: {
                    userId: user.id,
                    date: targetDate,
                    status: { notIn: [BookingStatus.CANCELLED] },
                    deletedAt: null,
               },
          });

          if (existingUserBooking) {
               throw new BadRequestException('User already booked for this date');
          }

          const bookingNumber = `INN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          const price = dto.price || room.pricePerNight;
          const totalAmount = price;
          const image = dto.image || ((room.images as any)?.main || '/fallback.jpg');
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
                    status: BookingStatus.CONFIRMED,
                    paymentStatus: PaymentStatus.PAID,
               },
               include: { room: true },
          });

          // Update room's bookedDates
          const updatedBookedDates = Array.from(new Set([...(room.bookedDates || []), targetDate]));
          await this.prisma.room.update({
               where: { id: room.id },
               data: { bookedDates: updatedBookedDates },
          });

          // Create in-app notification
          await this.prisma.notification.create({
               data: {
                    userId: user.id,
                    type: NotificationType.BOOKING,
                    title: 'Booking Confirmed',
                    message: `Your booking for ${room.title} (Room #${room.roomNumber}) on ${targetDate} is confirmed!`,
                    data: { bookingId: booking.id, bookingNumber },
               },
          });

          // Audit log
          await this.prisma.auditLog.create({
               data: {
                    userId: user.id,
                    role: user.role,
                    action: AuditAction.BOOKING_CREATED,
                    entity: 'Booking',
                    entityId: booking.id,
                    description: `Created booking #${bookingNumber} for room ${room.roomNumber} on ${targetDate}`,
               },
          });

          return this.formatBooking(booking);
     }

     async findMyBookings(userId?: string, email?: string) {
          const where: Prisma.BookingWhereInput = {
               deletedAt: null,
               status: { notIn: [BookingStatus.CANCELLED] },
          };

          if (userId) {
               where.userId = userId;
          } else if (email) {
               where.userEmail = email.toLowerCase().trim();
          } else {
               return [];
          }

          const bookings = await this.prisma.booking.findMany({
               where,
               include: { room: true },
               orderBy: { createdAt: 'desc' },
          });

          return bookings.map(this.formatBooking);
     }

     async findAll(query: QueryBookingDto) {
          const {
               page = 1,
               limit = 10,
               search,
               status,
               paymentStatus,
               roomId,
               userEmail,
               email,
               date,
               sortBy = 'createdAt',
               sortOrder = 'desc',
          } = query;

          const where: Prisma.BookingWhereInput = {
               deletedAt: null,
          };

          if (status) where.status = status;
          if (paymentStatus) where.paymentStatus = paymentStatus;
          if (roomId) where.roomId = roomId;
          if (date) where.date = date;

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

     async findOne(id: string) {
          const booking = await this.prisma.booking.findFirst({
               where: {
                    deletedAt: null,
                    OR: [{ id }, { bookingNumber: id }],
               },
               include: { room: true, user: true },
          });

          if (!booking) {
               throw new NotFoundException('Booking not found');
          }

          return this.formatBooking(booking);
     }

     async updateBookingDate(dto: UpdateBookingDateDto, currentUserId?: string) {
          const { roomId, oldDate, newDate, email } = dto;

          const room = await this.prisma.room.findFirst({
               where: {
                    deletedAt: null,
                    OR: [{ id: roomId }, { roomId }],
               },
          });

          if (!room) {
               throw new NotFoundException('Room not found');
          }

          // Check if new date is already booked
          if (room.bookedDates && room.bookedDates.includes(newDate)) {
               throw new BadRequestException('This room is already booked');
          }

          const whereClause: Prisma.BookingWhereInput = {
               roomId: room.id,
               date: oldDate,
               deletedAt: null,
               status: { notIn: [BookingStatus.CANCELLED] },
          };

          if (currentUserId) {
               whereClause.userId = currentUserId;
          } else if (email) {
               whereClause.userEmail = email.toLowerCase().trim();
          }

          const booking = await this.prisma.booking.findFirst({
               where: whereClause,
          });

          if (!booking) {
               throw new NotFoundException('No active booking found to update for this room and date');
          }

          // Update booking date
          const updatedBooking = await this.prisma.booking.update({
               where: { id: booking.id },
               data: { date: newDate },
          });

          // Update room's bookedDates: remove oldDate, add newDate
          const currentDates = room.bookedDates || [];
          const updatedDates = currentDates.filter((d) => d !== oldDate);
          updatedDates.push(newDate);

          await this.prisma.room.update({
               where: { id: room.id },
               data: { bookedDates: Array.from(new Set(updatedDates)) },
          });

          // Notification & Audit
          await this.prisma.notification.create({
               data: {
                    userId: booking.userId,
                    type: NotificationType.INFO,
                    title: 'Booking Rescheduled',
                    message: `Your booking #${booking.bookingNumber} has been updated from ${oldDate} to ${newDate}.`,
                    data: { bookingId: booking.id },
               },
          });

          await this.prisma.auditLog.create({
               data: {
                    userId: booking.userId,
                    action: AuditAction.BOOKING_UPDATED,
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

     async cancelBooking(params: {
          id?: string;
          email?: string;
          roomId?: string;
          date?: string;
          reason?: string;
          currentUserId?: string;
     }) {
          let booking: any = null;

          if (params.id) {
               booking = await this.prisma.booking.findUnique({
                    where: { id: params.id },
                    include: { room: true },
               });
          } else if (params.email && params.roomId && params.date) {
               // Legacy format
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
                              status: { notIn: [BookingStatus.CANCELLED] },
                         },
                         include: { room: true },
                    });
               }
          }

          if (!booking || booking.deletedAt) {
               throw new NotFoundException('No active booking found to cancel');
          }

          // Mark as cancelled
          const updatedBooking = await this.prisma.booking.update({
               where: { id: booking.id },
               data: {
                    status: BookingStatus.CANCELLED,
                    cancelledAt: new Date(),
                    cancellationReason: params.reason || 'Cancelled by guest/admin',
               },
          });

          // Free up the room date
          if (booking.room) {
               const currentDates = booking.room.bookedDates || [];
               const updatedDates = currentDates.filter((d: string) => d !== booking.date);
               await this.prisma.room.update({
                    where: { id: booking.room.id },
                    data: { bookedDates: updatedDates },
               });
          }

          // In-app notification
          await this.prisma.notification.create({
               data: {
                    userId: booking.userId,
                    type: NotificationType.WARNING,
                    title: 'Booking Cancelled',
                    message: `Booking #${booking.bookingNumber} for ${booking.title} on ${booking.date} was cancelled.`,
                    data: { bookingId: booking.id },
               },
          });

          await this.prisma.auditLog.create({
               data: {
                    userId: booking.userId,
                    action: AuditAction.BOOKING_CANCELLED,
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

     async updateStatus(id: string, dto: UpdateBookingStatusDto, adminUserId?: string) {
          const booking = await this.prisma.booking.findUnique({
               where: { id },
               include: { room: true },
          });

          if (!booking) {
               throw new NotFoundException('Booking not found');
          }

          const updated = await this.prisma.booking.update({
               where: { id },
               data: {
                    status: dto.status ?? booking.status,
                    paymentStatus: dto.paymentStatus ?? booking.paymentStatus,
                    cancellationReason: dto.cancellationReason ?? booking.cancellationReason,
                    cancelledAt: dto.status === BookingStatus.CANCELLED ? new Date() : booking.cancelledAt,
               },
          });

          // If status set to CANCELLED, remove room booked date
          if (dto.status === BookingStatus.CANCELLED && booking.room) {
               const updatedDates = (booking.room.bookedDates || []).filter((d) => d !== booking.date);
               await this.prisma.room.update({
                    where: { id: booking.room.id },
                    data: { bookedDates: updatedDates },
               });
          }

          await this.prisma.auditLog.create({
               data: {
                    userId: adminUserId,
                    action: AuditAction.UPDATE,
                    entity: 'Booking',
                    entityId: booking.id,
                    description: `Updated booking #${booking.bookingNumber} status to ${dto.status || booking.status}`,
               },
          });

          return this.formatBooking(updated);
     }

     private formatBooking(booking: any) {
          return {
               ...booking,
               _id: booking.id, // For backwards compatibility with frontend code
               roomId: booking.room?.roomId || booking.roomId,
          };
     }
}
