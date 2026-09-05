import { PrismaService } from '../common/prisma/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByUser(userId: string, limit?: number): Promise<{
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
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    create(dto: {
        userId?: string;
        title: string;
        message: string;
        type?: any;
        targetRole?: string;
    }): Promise<{
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
    } | {
        count: number;
        message: string;
    }>;
}
