import { Injectable, NotFoundException } from '@nestjs/common';
import { InquiryStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { QueryInquiryDto } from './dto/query-inquiry.dto';

@Injectable()
export class InquiriesService {
     constructor(private readonly prisma: PrismaService) {}

     async create(dto: CreateInquiryDto, userId?: string) {
          const inquiryNumber = `INQ-${Date.now().toString().slice(-6)}`;
          return this.prisma.inquiry.create({
               data: {
                    inquiryNumber,
                    userId,
                    name: dto.name,
                    email: dto.email.toLowerCase().trim(),
                    phone: dto.phone,
                    subject: dto.subject,
                    message: dto.message,
                    status: InquiryStatus.PENDING,
               },
          });
     }

     async findAll(query: QueryInquiryDto) {
          const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
          const skip = (page - 1) * limit;

          const where: Prisma.InquiryWhereInput = {
               deletedAt: null,
          };

          if (status) where.status = status;
          if (search) {
               where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { subject: { contains: search, mode: 'insensitive' } },
                    { message: { contains: search, mode: 'insensitive' } },
               ];
          }

          const [total, items] = await Promise.all([
               this.prisma.inquiry.count({ where }),
               this.prisma.inquiry.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
               }),
          ]);

          return {
               data: items,
               meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
               },
          };
     }

     async findMyInquiries(userId: string) {
          return this.prisma.inquiry.findMany({
               where: { userId, deletedAt: null },
               orderBy: { createdAt: 'desc' },
          });
     }

     async findOne(id: string) {
          const inquiry = await this.prisma.inquiry.findFirst({
               where: {
                    deletedAt: null,
                    OR: [{ id }, { inquiryNumber: id }],
               },
               include: { user: true },
          });
          if (!inquiry) throw new NotFoundException('Inquiry not found');
          return inquiry;
     }

     async updateStatus(id: string, status: InquiryStatus, adminNotes?: string) {
          const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
          if (!inquiry) throw new NotFoundException('Inquiry not found');

          return this.prisma.inquiry.update({
               where: { id },
               data: {
                    status,
                    adminNotes: adminNotes ?? inquiry.adminNotes,
                    repliedAt: status === InquiryStatus.CONTACTED || status === InquiryStatus.RESOLVED ? new Date() : inquiry.repliedAt,
               },
          });
     }

     async delete(id: string) {
          const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
          if (!inquiry) throw new NotFoundException('Inquiry not found');

          return this.prisma.inquiry.update({
               where: { id },
               data: { deletedAt: new Date() },
          });
     }
}
