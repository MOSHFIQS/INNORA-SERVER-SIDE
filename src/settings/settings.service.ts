import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SettingsService {
     constructor(private readonly prisma: PrismaService) {}

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

     async updateSettings(data: any) {
          const current = await this.getSettings();
          return this.prisma.siteSetting.update({
               where: { id: current.id },
               data,
          });
     }

     async getBanners() {
          return this.prisma.bannerSlide.findMany({
               orderBy: { order: 'asc' },
          });
     }

     async getBannerById(id: string) {
          return this.prisma.bannerSlide.findUnique({ where: { id } });
     }

     async createBanner(data: any) {
          return this.prisma.bannerSlide.create({ data });
     }

     async updateBanner(id: string, data: any) {
          return this.prisma.bannerSlide.update({ where: { id }, data });
     }

     async deleteBanner(id: string) {
          return this.prisma.bannerSlide.delete({ where: { id } });
     }

     async getHotelServices() {
          return this.prisma.hotelService.findMany({
               where: { isActive: true },
          });
     }
}
