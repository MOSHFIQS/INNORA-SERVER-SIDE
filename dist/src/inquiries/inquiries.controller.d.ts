import { InquiryStatus } from '@prisma/client';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { QueryInquiryDto } from './dto/query-inquiry.dto';
import { InquiriesService } from './inquiries.service';
export declare class InquiriesController {
    private readonly inquiriesService;
    constructor(inquiriesService: InquiriesService);
    create(dto: CreateInquiryDto, user?: AuthUser): Promise<{
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
