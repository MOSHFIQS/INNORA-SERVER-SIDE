import { PaginationDto } from '../common/dto/pagination.dto';
import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(query: PaginationDto): Promise<{
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
            beforeValue: import("@prisma/client/runtime/client").JsonValue | null;
            afterValue: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
