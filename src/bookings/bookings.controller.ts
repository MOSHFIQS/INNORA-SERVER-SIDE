import {
     Body,
     Controller,
     Delete,
     Get,
     Param,
     Patch,
     Post,
     Query,
     Req,
     UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { UpdateBookingDateDto } from './dto/update-booking-date.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
     constructor(private readonly bookingsService: BookingsService) {}

     @Public()
     @Post()
     @ApiOperation({ summary: 'Create new booking' })
     create(@Body() dto: CreateBookingDto, @CurrentUser() user?: AuthUser) {
          return this.bookingsService.create(dto, user?.id);
     }

     @Public()
     @Get()
     @ApiOperation({ summary: 'Get bookings (for user email or list)' })
     async findBookings(@Query() query: QueryBookingDto, @CurrentUser() user?: AuthUser) {
          // If email is provided in query or user is logged in without admin role:
          const targetEmail = query.email || query.userEmail;
          if (targetEmail || (user && user.role === UserRole.CUSTOMER)) {
               return this.bookingsService.findMyBookings(user?.id, targetEmail);
          }
          const result = await this.bookingsService.findAll(query);
          return result.data;
     }

     @Get('my')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Get current user bookings' })
     findMyBookings(@CurrentUser() user: AuthUser) {
          return this.bookingsService.findMyBookings(user.id);
     }

     @Get('all')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Get all bookings with pagination (Admin/Staff)' })
     findAll(@Query() query: QueryBookingDto) {
          return this.bookingsService.findAll(query);
     }

     @Public()
     @Patch('update')
     @ApiOperation({ summary: 'Update/Reschedule booking date' })
     updateDateLegacy(@Body() dto: UpdateBookingDateDto, @CurrentUser() user?: AuthUser) {
          return this.bookingsService.updateBookingDate(dto, user?.id);
     }

     @Public()
     @Delete(':email')
     @ApiOperation({ summary: 'Cancel booking by email or ID' })
     cancelBooking(
          @Param('email') emailOrId: string,
          @Body() body: { roomId?: string; date?: string; reason?: string },
          @CurrentUser() user?: AuthUser,
     ) {
          // If param is a UUID or booking ID:
          if (emailOrId.includes('-') && !emailOrId.includes('@')) {
               return this.bookingsService.cancelBooking({
                    id: emailOrId,
                    reason: body.reason,
                    currentUserId: user?.id,
               });
          }

          // Legacy format with email param + roomId/date in body
          return this.bookingsService.cancelBooking({
               email: emailOrId,
               roomId: body.roomId,
               date: body.date,
               reason: body.reason,
               currentUserId: user?.id,
          });
     }

     @Get(':id')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Get single booking by ID or booking number' })
     findOne(@Param('id') id: string) {
          return this.bookingsService.findOne(id);
     }

     @Patch(':id/status')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Update booking status (Check-in, Check-out, Confirm, Cancel)' })
     updateStatus(
          @Param('id') id: string,
          @Body() dto: UpdateBookingStatusDto,
          @CurrentUser() user: AuthUser,
     ) {
          return this.bookingsService.updateStatus(id, dto, user.id);
     }

     @Patch(':id')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Update booking details and stay information' })
     update(
          @Param('id') id: string,
          @Body() dto: any,
          @CurrentUser() user: AuthUser,
     ) {
          return this.bookingsService.update(id, dto, user.id);
     }
}
