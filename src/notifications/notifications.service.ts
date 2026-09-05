import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
     constructor(private readonly prisma: PrismaService) {}

     async findByUser(userId: string, limit: number = 10) {
          const notifications = await this.prisma.notification.findMany({
               where: { userId },
               orderBy: { createdAt: 'desc' },
               take: limit,
          });

          return notifications;
     }

     async getUnreadCount(userId: string) {
          const count = await this.prisma.notification.count({
               where: { userId, isRead: false },
          });
          return { count };
     }

     async markAsRead(id: string, userId: string) {
          return this.prisma.notification.updateMany({
               where: { id, userId },
               data: { isRead: true, readAt: new Date() },
          });
     }

     async markAllAsRead(userId: string) {
          return this.prisma.notification.updateMany({
               where: { userId, isRead: false },
               data: { isRead: true, readAt: new Date() },
          });
     }
}
