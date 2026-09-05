import { AuditAction, Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class AuditLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto & {
        action?: AuditAction;
        entity?: string;
    }): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            role: string | null;
            description: string | null;
            userId: string | null;
            action: import(".prisma/client").$Enums.AuditAction;
            entity: string | null;
            entityId: string | null;
            ipAddress: string | null;
            device: string | null;
            userAgent: string | null;
            beforeValue: Prisma.JsonValue | null;
            afterValue: Prisma.JsonValue | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
