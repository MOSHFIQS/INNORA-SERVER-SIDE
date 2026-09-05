import {
     ConflictException,
     Injectable,
     NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
     constructor(private readonly prisma: PrismaService) {}

     async findAll(query: QueryUserDto) {
          const { page = 1, limit = 10, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
          const skip = (page - 1) * limit;

          const where: Prisma.UserWhereInput = {
               deletedAt: null,
          };

          if (role) where.role = role;
          if (status) where.status = status;

          if (search) {
               where.OR = [
                    { email: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
               ];
          }

          const [total, users] = await Promise.all([
               this.prisma.user.count({ where }),
               this.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                    select: {
                         id: true,
                         email: true,
                         phone: true,
                         firstName: true,
                         lastName: true,
                         fullName: true,
                         role: true,
                         status: true,
                         avatarUrl: true,
                         bio: true,
                         address: true,
                         city: true,
                         country: true,
                         lastLoginAt: true,
                         createdAt: true,
                         _count: {
                              select: {
                                   bookings: true,
                                   reviews: true,
                              },
                         },
                    },
               }),
          ]);

          return {
               data: users,
               meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
               },
          };
     }

     async findOne(id: string) {
          const user = await this.prisma.user.findUnique({
               where: { id },
               include: {
                    bookings: {
                         where: { deletedAt: null },
                         include: { room: true },
                         orderBy: { createdAt: 'desc' },
                         take: 5,
                    },
                    reviews: {
                         where: { deletedAt: null },
                         include: { room: true },
                         take: 5,
                    },
               },
          });

          if (!user || user.deletedAt) {
               throw new NotFoundException('User not found');
          }

          const { password, ...sanitized } = user;
          return sanitized;
     }

     async create(dto: CreateUserDto, creatorId?: string) {
          const email = dto.email.toLowerCase().trim();
          const existing = await this.prisma.user.findUnique({ where: { email } });
          if (existing) {
               throw new ConflictException('User with this email already exists');
          }

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(dto.password, salt);
          const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`;

          const user = await this.prisma.user.create({
               data: {
                    email,
                    password: hashedPassword,
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    fullName,
                    phone: dto.phone?.trim() || null,
                    role: dto.role,
                    status: dto.status ?? UserStatus.ACTIVE,
               },
          });

          await this.prisma.auditLog.create({
               data: {
                    userId: creatorId,
                    action: AuditAction.CREATE,
                    entity: 'User',
                    entityId: user.id,
                    description: `Created account for ${user.email} with role ${user.role}`,
               },
          });

          const { password, ...sanitized } = user;
          return sanitized;
     }

     async update(id: string, dto: UpdateUserDto, updaterId?: string) {
          const user = await this.prisma.user.findUnique({ where: { id } });
          if (!user || user.deletedAt) {
               throw new NotFoundException('User not found');
          }

          const firstName = dto.firstName ?? user.firstName;
          const lastName = dto.lastName ?? user.lastName;
          const fullName = `${firstName} ${lastName}`;

          const updated = await this.prisma.user.update({
               where: { id },
               data: {
                    firstName,
                    lastName,
                    fullName,
                    email: dto.email ? dto.email.toLowerCase().trim() : user.email,
                    phone: dto.phone !== undefined ? dto.phone : user.phone,
                    role: dto.role ?? user.role,
                    status: dto.status ?? user.status,
                    avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : user.avatarUrl,
                    bio: dto.bio !== undefined ? dto.bio : user.bio,
               },
          });

          await this.prisma.auditLog.create({
               data: {
                    userId: updaterId,
                    action: AuditAction.UPDATE,
                    entity: 'User',
                    entityId: user.id,
                    description: `Updated profile/role for user ${user.email}`,
               },
          });

          const { password, ...sanitized } = updated;
          return sanitized;
     }

     async delete(id: string, deleterId?: string) {
          const user = await this.prisma.user.findUnique({ where: { id } });
          if (!user) throw new NotFoundException('User not found');

          await this.prisma.user.update({
               where: { id },
               data: { deletedAt: new Date(), status: UserStatus.INACTIVE },
          });

          await this.prisma.auditLog.create({
               data: {
                    userId: deleterId,
                    action: AuditAction.DELETE,
                    entity: 'User',
                    entityId: id,
                    description: `Soft deleted user account ${user.email}`,
               },
          });

          return { message: 'User account removed successfully' };
     }
}
