import {
     ConflictException,
     Injectable,
     Logger,
     NotFoundException,
} from '@nestjs/common';
import { Prisma, RoomStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
     private readonly logger = new Logger(RoomsService.name);

     constructor(private readonly prisma: PrismaService) {}

     async findAll(query: QueryRoomDto) {
          const {
               page = 1,
               limit = 10,
               search,
               type,
               status,
               bedType,
               minPrice,
               maxPrice,
               guests,
               isAvailable,
               isFeatured,
               sortBy = 'createdAt',
               sortOrder = 'desc',
          } = query;

          const where: Prisma.RoomWhereInput = {
               deletedAt: null,
               isActive: true,
          };

          if (search) {
               where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { roomId: { contains: search, mode: 'insensitive' } },
                    { roomNumber: { contains: search, mode: 'insensitive' } },
                    { view: { contains: search, mode: 'insensitive' } },
               ];
          }

          if (type) where.type = type;
          if (status) where.status = status;
          if (bedType) where.bedType = { equals: bedType, mode: 'insensitive' };
          if (isAvailable !== undefined) where.isAvailable = isAvailable;
          if (isFeatured !== undefined) where.isFeatured = isFeatured;
          if (guests) where.maxGuests = { gte: guests };

          if (minPrice !== undefined || maxPrice !== undefined) {
               where.pricePerNight = {};
               if (minPrice !== undefined) where.pricePerNight.gte = minPrice;
               if (maxPrice !== undefined) where.pricePerNight.lte = maxPrice;
          }

          const skip = (page - 1) * limit;

          const [total, rooms] = await Promise.all([
               this.prisma.room.count({ where }),
               this.prisma.room.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
               }),
          ]);

          const totalPages = Math.ceil(total / limit);

          const formattedRooms = rooms.map(this.formatRoom);

          return {
               data: formattedRooms,
               meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
               },
          };
     }

     async findFeatured() {
          const rooms = await this.prisma.room.findMany({
               where: {
                    deletedAt: null,
                    isActive: true,
                    isFeatured: true,
               },
               take: 8,
               orderBy: { rating: 'desc' },
          });

          return rooms.map(this.formatRoom);
     }

     async findHomePageRooms() {
          const rooms = await this.prisma.room.findMany({
               where: {
                    deletedAt: null,
                    isActive: true,
               },
               take: 12,
               orderBy: { createdAt: 'desc' },
          });

          return rooms.map(this.formatRoom);
     }

     async findOne(idOrSlugOrRoomId: string) {
          const room = await this.prisma.room.findFirst({
               where: {
                    deletedAt: null,
                    OR: [
                         { id: idOrSlugOrRoomId },
                         { roomId: idOrSlugOrRoomId },
                         { slug: idOrSlugOrRoomId },
                    ],
               },
               include: {
                    reviews: {
                         where: { deletedAt: null, status: 'APPROVED' },
                         orderBy: { createdAt: 'desc' },
                         take: 10,
                    },
               },
          });

          if (!room) {
               throw new NotFoundException(`Room with identifier '${idOrSlugOrRoomId}' not found`);
          }

          // Increment view count in background
          this.prisma.room.update({
               where: { id: room.id },
               data: { viewCount: { increment: 1 } },
          }).catch((err) => this.logger.warn(`Failed to increment room view: ${err.message}`));

          return this.formatRoom(room);
     }

     async create(dto: CreateRoomDto) {
          const slug = this.generateSlug(dto.title, dto.roomId);

          const existing = await this.prisma.room.findFirst({
               where: {
                    OR: [{ roomId: dto.roomId }, { slug }],
               },
          });

          if (existing) {
               throw new ConflictException(`Room with ID '${dto.roomId}' or Title already exists`);
          }

          const room = await this.prisma.room.create({
               data: {
                    roomId: dto.roomId,
                    roomNumber: dto.roomNumber,
                    floor: dto.floor ?? 1,
                    title: dto.title,
                    slug,
                    description: dto.description,
                    shortDescription: dto.shortDescription,
                    type: dto.type,
                    status: dto.status ?? RoomStatus.AVAILABLE,
                    isAvailable: dto.isAvailable ?? true,
                    bedType: dto.bedType || 'King',
                    pricePerNight: dto.pricePerNight,
                    currency: dto.currency || 'USD',
                    maxGuests: dto.maxGuests ?? 2,
                    roomSizeSqFt: dto.roomSizeSqFt ?? 350,
                    view: dto.view || 'City',
                    features: dto.features || [],
                    safetyFeatures: dto.safetyFeatures || [],
                    images: dto.images as any,
                    isFeatured: dto.isFeatured ?? false,
                    bookedDates: [],
               },
          });

          return this.formatRoom(room);
     }

     async update(id: string, dto: UpdateRoomDto) {
          const existing = await this.prisma.room.findUnique({
               where: { id },
          });

          if (!existing || existing.deletedAt) {
               throw new NotFoundException(`Room with ID '${id}' not found`);
          }

          const slug = dto.title ? this.generateSlug(dto.title, dto.roomId || existing.roomId) : existing.slug;

          const updated = await this.prisma.room.update({
               where: { id },
               data: {
                    roomId: dto.roomId ?? existing.roomId,
                    roomNumber: dto.roomNumber ?? existing.roomNumber,
                    floor: dto.floor ?? existing.floor,
                    title: dto.title ?? existing.title,
                    slug,
                    description: dto.description !== undefined ? dto.description : existing.description,
                    shortDescription: dto.shortDescription !== undefined ? dto.shortDescription : existing.shortDescription,
                    type: dto.type ?? existing.type,
                    status: dto.status ?? existing.status,
                    isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : existing.isAvailable,
                    bedType: dto.bedType ?? existing.bedType,
                    pricePerNight: dto.pricePerNight ?? existing.pricePerNight,
                    currency: dto.currency ?? existing.currency,
                    maxGuests: dto.maxGuests ?? existing.maxGuests,
                    roomSizeSqFt: dto.roomSizeSqFt ?? existing.roomSizeSqFt,
                    view: dto.view ?? existing.view,
                    features: dto.features ?? existing.features,
                    safetyFeatures: dto.safetyFeatures ?? existing.safetyFeatures,
                    images: dto.images ? (dto.images as any) : existing.images,
                    isFeatured: dto.isFeatured !== undefined ? dto.isFeatured : existing.isFeatured,
               },
          });

          return this.formatRoom(updated);
     }

     async delete(id: string) {
          const existing = await this.prisma.room.findUnique({ where: { id } });
          if (!existing) {
               throw new NotFoundException(`Room with ID '${id}' not found`);
          }

          await this.prisma.room.update({
               where: { id },
               data: { deletedAt: new Date(), isActive: false },
          });

          return { message: 'Room removed successfully' };
     }

     async toggleAvailability(id: string) {
          const room = await this.prisma.room.findUnique({ where: { id } });
          if (!room) throw new NotFoundException('Room not found');

          const updated = await this.prisma.room.update({
               where: { id },
               data: {
                    isAvailable: !room.isAvailable,
                    status: !room.isAvailable ? RoomStatus.AVAILABLE : RoomStatus.MAINTENANCE,
               },
          });

          return this.formatRoom(updated);
     }

     private generateSlug(title: string, roomId: string): string {
          const base = title
               .toLowerCase()
               .replace(/[^a-z0-9]+/g, '-')
               .replace(/^-+|-+$/g, '');
          return `${base}-${roomId}`.toLowerCase();
     }

     private formatRoom(room: any) {
          return {
               ...room,
               _id: room.id, // For backwards compatibility with existing frontend code referencing room._id
          };
     }
}
