import { InquiryStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { QueryInquiryDto } from './dto/query-inquiry.dto';
export declare class InquiriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateInquiryDto, userId?: string): Promise<{
        id: string;
        phone: string | null;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.InquiryStatus;
        deletedAt: Date | null;
        userId: string | null;
        message: string;
        subject: string | null;
        inquiryNumber: string;
        adminNotes: string | null;
        repliedAt: Date | null;
    }>;
    findAll(query: QueryInquiryDto): Promise<{
        data: {
            id: string;
            phone: string | null;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import(".prisma/client").$Enums.InquiryStatus;
            deletedAt: Date | null;
            userId: string | null;
            message: string;
            subject: string | null;
            inquiryNumber: string;
            adminNotes: string | null;
            repliedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateStatus(id: string, status: InquiryStatus, adminNotes?: string): Promise<{
        id: string;
        phone: string | null;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.InquiryStatus;
        deletedAt: Date | null;
        userId: string | null;
        message: string;
        subject: string | null;
        inquiryNumber: string;
        adminNotes: string | null;
        repliedAt: Date | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        phone: string | null;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import(".prisma/client").$Enums.InquiryStatus;
        deletedAt: Date | null;
        userId: string | null;
        message: string;
        subject: string | null;
        inquiryNumber: string;
        adminNotes: string | null;
        repliedAt: Date | null;
    }>;
}
