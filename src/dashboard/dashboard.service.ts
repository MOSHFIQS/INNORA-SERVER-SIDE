import { Injectable } from '@nestjs/common';
import { BookingStatus, RoomStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
     constructor(private readonly prisma: PrismaService) {}

     async getAdminStats() {
          const [
               totalRooms,
               availableRooms,
               bookedRooms,
               maintenanceRooms,
               totalBookings,
               confirmedBookings,
               cancelledBookings,
               completedBookings,
               totalCustomers,
               totalReviews,
               pendingInquiries,
               allBookings,
               recentBookings,
               recentReviews,
          ] = await Promise.all([
               this.prisma.room.count({ where: { deletedAt: null } }),
               this.prisma.room.count({ where: { deletedAt: null, isAvailable: true, status: RoomStatus.AVAILABLE } }),
               this.prisma.room.count({ where: { deletedAt: null, status: RoomStatus.BOOKED } }),
               this.prisma.room.count({ where: { deletedAt: null, status: RoomStatus.MAINTENANCE } }),
               this.prisma.booking.count({ where: { deletedAt: null } }),
               this.prisma.booking.count({ where: { deletedAt: null, status: BookingStatus.CONFIRMED } }),
               this.prisma.booking.count({ where: { deletedAt: null, status: BookingStatus.CANCELLED } }),
               this.prisma.booking.count({ where: { deletedAt: null, status: BookingStatus.COMPLETED } }),
               this.prisma.user.count({ where: { deletedAt: null, role: UserRole.CUSTOMER } }),
               this.prisma.review.count({ where: { deletedAt: null } }),
               this.prisma.inquiry.count({ where: { deletedAt: null, status: 'PENDING' } }),
               this.prisma.booking.findMany({
                    where: { deletedAt: null, status: { not: BookingStatus.CANCELLED } },
                    select: { price: true, totalAmount: true, createdAt: true, date: true },
               }),
               this.prisma.booking.findMany({
                    where: { deletedAt: null },
                    include: { room: true },
                    orderBy: { createdAt: 'desc' },
                    take: 6,
               }),
               this.prisma.review.findMany({
                    where: { deletedAt: null },
                    include: { room: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
               }),
          ]);

          // Calculate total revenue
          const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalAmount || b.price || 0), 0);

          // Calculate occupancy rate
          const occupancyRate = totalRooms > 0 ? parseFloat(((bookedRooms / totalRooms) * 100).toFixed(1)) : 0;

          // Compute monthly revenue for last 6 months
          const monthsMap: Record<string, number> = {};
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
               const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
               const key = d.toLocaleString('default', { month: 'short' });
               monthsMap[key] = 0;
          }

          allBookings.forEach((b) => {
               const d = new Date(b.createdAt);
               const key = d.toLocaleString('default', { month: 'short' });
               if (monthsMap[key] !== undefined) {
                    monthsMap[key] += (b.totalAmount || b.price || 0);
               }
          });

          const revenueChartData = Object.keys(monthsMap).map((month) => ({
               month,
               revenue: monthsMap[month],
          }));

          return {
               stats: {
                    totalRevenue,
                    totalBookings,
                    confirmedBookings,
                    completedBookings,
                    cancelledBookings,
                    totalRooms,
                    availableRooms,
                    occupiedRooms: bookedRooms,
                    maintenanceRooms,
                    occupancyRate,
                    totalCustomers,
                    totalReviews,
                    pendingInquiries,
               },
               revenueChartData,
               recentBookings: recentBookings.map((b) => ({
                    ...b,
                    _id: b.id,
               })),
               recentReviews,
          };
     }

     async getCustomerStats(userId: string) {
          const [
               totalBookings,
               confirmedBookings,
               completedBookings,
               cancelledBookings,
               reviewsCount,
               myBookings,
          ] = await Promise.all([
               this.prisma.booking.count({ where: { userId, deletedAt: null } }),
               this.prisma.booking.count({ where: { userId, deletedAt: null, status: BookingStatus.CONFIRMED } }),
               this.prisma.booking.count({ where: { userId, deletedAt: null, status: BookingStatus.COMPLETED } }),
               this.prisma.booking.count({ where: { userId, deletedAt: null, status: BookingStatus.CANCELLED } }),
               this.prisma.review.count({ where: { userId, deletedAt: null } }),
               this.prisma.booking.findMany({
                    where: { userId, deletedAt: null },
                    include: { room: true },
                    orderBy: { createdAt: 'desc' },
               }),
          ]);

          const totalSpent = myBookings
               .filter((b) => b.status !== BookingStatus.CANCELLED)
               .reduce((sum, b) => sum + (b.totalAmount || b.price || 0), 0);

          return {
               stats: {
                    totalBookings,
                    confirmedBookings,
                    completedBookings,
                    cancelledBookings,
                    totalSpent,
                    reviewsCount,
               },
               recentBookings: myBookings.slice(0, 5).map((b) => ({
                    ...b,
                    _id: b.id,
               })),
          };
     }
}
