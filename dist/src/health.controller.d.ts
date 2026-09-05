import { PrismaService } from './common/prisma/prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRoot(): {
        status: string;
        service: string;
        version: string;
        timestamp: string;
    };
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        database: {
            status: string;
            latencyMs: number;
        };
        uptime: number;
    }>;
}
