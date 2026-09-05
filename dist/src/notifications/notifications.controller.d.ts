import { AuthUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findMyNotifications(user: AuthUser, limit?: number): Promise<{
        data: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        message: string;
        isRead: boolean;
        readAt: Date | null;
    }[]>;
    getUnreadCount(user: AuthUser): Promise<{
        count: number;
    }>;
    markAsRead(id: string, user: AuthUser): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(user: AuthUser): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
