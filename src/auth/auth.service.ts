import {
     BadRequestException,
     ConflictException,
     Injectable,
     Logger,
     UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuditAction, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, UserProfileDto } from './dto/response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface RequestMeta {
     ipAddress?: string;
     device?: string;
     userAgent?: string;
}

@Injectable()
export class AuthService {
     private readonly logger = new Logger(AuthService.name);

     constructor(
          private readonly prisma: PrismaService,
          private readonly jwtService: JwtService,
          private readonly configService: ConfigService,
     ) {}

     async register(dto: RegisterDto, meta?: RequestMeta) {
          const email = dto.email.toLowerCase().trim();

          const existingUser = await this.prisma.user.findFirst({
               where: {
                    OR: [
                         { email },
                         ...(dto.phone ? [{ phone: dto.phone }] : []),
                    ],
               },
          });

          if (existingUser) {
               if (existingUser.email === email) {
                    throw new ConflictException('An account with this email already exists');
               }
               throw new ConflictException('An account with this phone number already exists');
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
                    role: dto.role || UserRole.CUSTOMER,
                    status: UserStatus.ACTIVE,
                    lastLoginAt: new Date(),
                    lastLoginIp: meta?.ipAddress,
                    lastDevice: meta?.device,
               },
          });

          // Log registration audit
          await this.createAuditLog({
               userId: user.id,
               role: user.role,
               action: AuditAction.CREATE,
               entity: 'User',
               entityId: user.id,
               description: `User registered with email ${user.email}`,
               meta,
          });

          const accessToken = this.generateToken(user);

          return {
               user: this.sanitizeUser(user),
               accessToken,
          };
     }

     async login(dto: LoginDto, meta?: RequestMeta) {
          const email = dto.email.toLowerCase().trim();

          const user = await this.prisma.user.findUnique({
               where: { email },
          });

          if (!user) {
               throw new UnauthorizedException('Invalid email or password');
          }

          if (user.deletedAt) {
               throw new UnauthorizedException('Account has been deactivated. Please contact support.');
          }

          if (user.status === UserStatus.SUSPENDED) {
               throw new UnauthorizedException('Account is suspended. Please contact management.');
          }

          const isPasswordValid = await bcrypt.compare(dto.password, user.password);
          if (!isPasswordValid) {
               throw new UnauthorizedException('Invalid email or password');
          }

          // Update last login
          await this.prisma.user.update({
               where: { id: user.id },
               data: {
                    lastLoginAt: new Date(),
                    lastLoginIp: meta?.ipAddress,
                    lastDevice: meta?.device,
               },
          });

          // Audit log
          await this.createAuditLog({
               userId: user.id,
               role: user.role,
               action: AuditAction.LOGIN,
               entity: 'User',
               entityId: user.id,
               description: `User logged in from ${meta?.ipAddress || 'unknown IP'}`,
               meta,
          });

          const accessToken = this.generateToken(user);

          return {
               user: this.sanitizeUser(user),
               accessToken,
          };
     }

     async logout(userId: string, meta?: RequestMeta) {
          await this.createAuditLog({
               userId,
               action: AuditAction.LOGOUT,
               entity: 'User',
               entityId: userId,
               description: 'User logged out',
               meta,
          });

          return { message: 'Logged out successfully' };
     }

     async getProfile(userId: string): Promise<UserProfileDto> {
          const user = await this.prisma.user.findUnique({
               where: { id: userId },
          });

          if (!user || user.deletedAt) {
               throw new UnauthorizedException('User profile not found');
          }

          return this.sanitizeUser(user);
     }

     async updateProfile(userId: string, dto: UpdateProfileDto, meta?: RequestMeta) {
          const user = await this.prisma.user.findUnique({ where: { id: userId } });
          if (!user) {
               throw new UnauthorizedException('User not found');
          }

          const firstName = dto.firstName?.trim() ?? user.firstName;
          const lastName = dto.lastName?.trim() ?? user.lastName;
          const fullName = `${firstName} ${lastName}`;

          const updated = await this.prisma.user.update({
               where: { id: userId },
               data: {
                    firstName,
                    lastName,
                    fullName,
                    phone: dto.phone !== undefined ? dto.phone : user.phone,
                    avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : user.avatarUrl,
                    bio: dto.bio !== undefined ? dto.bio : user.bio,
                    address: dto.address !== undefined ? dto.address : user.address,
                    city: dto.city !== undefined ? dto.city : user.city,
                    country: dto.country !== undefined ? dto.country : user.country,
                    gender: dto.gender !== undefined ? dto.gender : user.gender,
               },
          });

          await this.createAuditLog({
               userId,
               role: updated.role,
               action: AuditAction.PROFILE_CHANGE,
               entity: 'User',
               entityId: userId,
               description: 'Updated user profile information',
               meta,
          });

          return this.sanitizeUser(updated);
     }

     async changePassword(userId: string, dto: ChangePasswordDto, meta?: RequestMeta) {
          const user = await this.prisma.user.findUnique({ where: { id: userId } });
          if (!user) {
               throw new UnauthorizedException('User not found');
          }

          const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
          if (!isMatch) {
               throw new BadRequestException('Current password is incorrect');
          }

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

          await this.prisma.user.update({
               where: { id: userId },
               data: { password: hashedPassword },
          });

          await this.createAuditLog({
               userId,
               role: user.role,
               action: AuditAction.UPDATE,
               entity: 'User',
               entityId: userId,
               description: 'Changed account password',
               meta,
          });

          return { message: 'Password updated successfully' };
     }

     async validateUserById(userId: string) {
          const user = await this.prisma.user.findUnique({
               where: { id: userId },
          });

          if (!user || user.deletedAt || user.status === UserStatus.SUSPENDED) {
               return null;
          }

          return user;
     }

     private generateToken(user: { id: string; email: string; role: UserRole }): string {
          const payload: JwtPayload = {
               sub: user.id,
               email: user.email,
               role: user.role,
          };
          return this.jwtService.sign(payload);
     }

     private sanitizeUser(user: any): UserProfileDto {
          return {
               id: user.id,
               email: user.email,
               phone: user.phone,
               firstName: user.firstName,
               lastName: user.lastName,
               fullName: user.fullName,
               role: user.role,
               status: user.status,
               avatarUrl: user.avatarUrl,
               bio: user.bio,
               address: user.address,
               city: user.city,
               country: user.country,
               createdAt: user.createdAt,
          };
     }

     private async createAuditLog(params: {
          userId?: string;
          role?: string;
          action: AuditAction;
          entity?: string;
          entityId?: string;
          description?: string;
          meta?: RequestMeta;
     }) {
          try {
               await this.prisma.auditLog.create({
                    data: {
                         userId: params.userId,
                         role: params.role,
                         action: params.action,
                         entity: params.entity,
                         entityId: params.entityId,
                         description: params.description,
                         ipAddress: params.meta?.ipAddress,
                         device: params.meta?.device,
                         userAgent: params.meta?.userAgent,
                    },
               });
          } catch (e) {
               this.logger.warn(`Failed to write audit log: ${e.message}`);
          }
     }
}
