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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../common/prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdminStats() {
        const [totalRooms, availableRooms, bookedRooms, maintenanceRooms, totalBookings, confirmedBookings, cancelledBookings, completedBookings, totalCustomers, totalReviews, pendingInquiries, allBookings, recentBookings, recentReviews,] = await Promise.all([
            this.prisma.room.count({ where: { deletedAt: null } }),
            this.prisma.room.count({ where: { deletedAt: null, isAvailable: true, status: client_1.RoomStatus.AVAILABLE } }),
            this.prisma.room.count({ where: { deletedAt: null, status: client_1.RoomStatus.BOOKED } }),
            this.prisma.room.count({ where: { deletedAt: null, status: client_1.RoomStatus.MAINTENANCE } }),
            this.prisma.booking.count({ where: { deletedAt: null } }),
            this.prisma.booking.count({ where: { deletedAt: null, status: client_1.BookingStatus.CONFIRMED } }),
            this.prisma.booking.count({ where: { deletedAt: null, status: client_1.BookingStatus.CANCELLED } }),
            this.prisma.booking.count({ where: { deletedAt: null, status: client_1.BookingStatus.COMPLETED } }),
            this.prisma.user.count({ where: { deletedAt: null, role: client_1.UserRole.CUSTOMER } }),
            this.prisma.review.count({ where: { deletedAt: null } }),
            this.prisma.inquiry.count({ where: { deletedAt: null, status: 'PENDING' } }),
            this.prisma.booking.findMany({
                where: { deletedAt: null, status: { not: client_1.BookingStatus.CANCELLED } },
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
        const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalAmount || b.price || 0), 0);
        const occupancyRate = totalRooms > 0 ? parseFloat(((bookedRooms / totalRooms) * 100).toFixed(1)) : 0;
        const monthsMap = {};
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
    async getCustomerStats(userId) {
        const [totalBookings, confirmedBookings, completedBookings, cancelledBookings, reviewsCount, myBookings,] = await Promise.all([
            this.prisma.booking.count({ where: { userId, deletedAt: null } }),
            this.prisma.booking.count({ where: { userId, deletedAt: null, status: client_1.BookingStatus.CONFIRMED } }),
            this.prisma.booking.count({ where: { userId, deletedAt: null, status: client_1.BookingStatus.COMPLETED } }),
            this.prisma.booking.count({ where: { userId, deletedAt: null, status: client_1.BookingStatus.CANCELLED } }),
            this.prisma.review.count({ where: { userId, deletedAt: null } }),
            this.prisma.booking.findMany({
                where: { userId, deletedAt: null },
                include: { room: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        const totalSpent = myBookings
            .filter((b) => b.status !== client_1.BookingStatus.CANCELLED)
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map