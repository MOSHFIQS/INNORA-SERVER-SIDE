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

     async create(dto: { userId?: string; title: string; message: string; type?: any; targetRole?: string }) {
          if (dto.userId) {
               return this.prisma.notification.create({
                    data: {
                         userId: dto.userId,
                         title: dto.title,
                         message: dto.message,
                         type: dto.type || 'INFO',
                    },
               });
          }

          // Broadcast to users matching role or all active users
          const users = await this.prisma.user.findMany({
               where: {
                    deletedAt: null,
                    ...(dto.targetRole ? { role: dto.targetRole as any } : {}),
               },
               select: { id: true },
          });

          const created = await Promise.all(
               users.map((u) =>
                    this.prisma.notification.create({
                         data: {
                              userId: u.id,
                              title: dto.title,
                              message: dto.message,
                              type: dto.type || 'INFO',
                         },
                    }),
               ),
          );

          return { count: created.length, message: `Notification delivered to ${created.length} users` };
     }
}
