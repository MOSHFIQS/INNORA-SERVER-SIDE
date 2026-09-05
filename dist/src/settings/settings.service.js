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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        let settings = await this.prisma.siteSetting.findFirst();
        if (!settings) {
            settings = await this.prisma.siteSetting.create({
                data: {
                    siteName: 'INNORA Luxury Hotel & Suites',
                    tagline: 'Experience Timeless Luxury and Unmatched Hospitality',
                    email: 'concierge@innora.com',
                    phone: '+1 (800) 555-4666',
                    address: '777 Ocean View Boulevard, Coastal Haven',
                    checkInTime: '14:00',
                    checkOutTime: '11:00',
                    cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in.',
                },
            });
        }
        return settings;
    }
    async updateSettings(data) {
        const current = await this.getSettings();
        return this.prisma.siteSetting.update({
            where: { id: current.id },
            data,
        });
    }
    async getBanners() {
        return this.prisma.bannerSlide.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
    }
    async createBanner(data) {
        return this.prisma.bannerSlide.create({ data });
    }
    async updateBanner(id, data) {
        return this.prisma.bannerSlide.update({ where: { id }, data });
    }
    async deleteBanner(id) {
        return this.prisma.bannerSlide.delete({ where: { id } });
    }
    async getHotelServices() {
        return this.prisma.hotelService.findMany({
            where: { isActive: true },
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map