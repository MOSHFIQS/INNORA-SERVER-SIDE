import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuditLogService {
     constructor(private readonly prisma: PrismaService) {}

     async findAll(query: PaginationDto & { action?: AuditAction; entity?: string }) {
          const { page = 1, limit = 15, search, action, entity, sortBy = 'createdAt', sortOrder = 'desc' } = query;
          const skip = (page - 1) * limit;

          const where: Prisma.AuditLogWhereInput = {};

          if (action) where.action = action;
          if (entity) where.entity = entity;

          if (search) {
               where.OR = [
                    { description: { contains: search, mode: 'insensitive' } },
                    { entity: { contains: search, mode: 'insensitive' } },
                    { role: { contains: search, mode: 'insensitive' } },
               ];
          }

          const [total, logs] = await Promise.all([
               this.prisma.auditLog.count({ where }),
               this.prisma.auditLog.findMany({
                    where,
                    include: { user: { select: { id: true, email: true, fullName: true } } },
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
               }),
          ]);

          return {
               data: logs,
               meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
               },
          };
     }
}
