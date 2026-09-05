"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RoomsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../common/prisma/prisma.service");
let RoomsService = RoomsService_1 = class RoomsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RoomsService_1.name);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, type, status, bedType, minPrice, maxPrice, guests, isAvailable, isFeatured, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const where = {
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
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (bedType)
            where.bedType = { equals: bedType, mode: 'insensitive' };
        if (isAvailable !== undefined)
            where.isAvailable = isAvailable;
        if (isFeatured !== undefined)
            where.isFeatured = isFeatured;
        if (guests)
            where.maxGuests = { gte: guests };
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.pricePerNight = {};
            if (minPrice !== undefined)
                where.pricePerNight.gte = minPrice;
            if (maxPrice !== undefined)
                where.pricePerNight.lte = maxPrice;
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
    async findOne(idOrSlugOrRoomId) {
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
            throw new common_1.NotFoundException(`Room with identifier '${idOrSlugOrRoomId}' not found`);
        }
        this.prisma.room.update({
            where: { id: room.id },
            data: { viewCount: { increment: 1 } },
        }).catch((err) => this.logger.warn(`Failed to increment room view: ${err.message}`));
        return this.formatRoom(room);
    }
    async create(dto) {
        const slug = this.generateSlug(dto.title, dto.roomId);
        const existing = await this.prisma.room.findFirst({
            where: {
                OR: [{ roomId: dto.roomId }, { slug }],
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Room with ID '${dto.roomId}' or Title already exists`);
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
                status: dto.status ?? client_1.RoomStatus.AVAILABLE,
                isAvailable: dto.isAvailable ?? true,
                bedType: dto.bedType || 'King',
                pricePerNight: dto.pricePerNight,
                currency: dto.currency || 'USD',
                maxGuests: dto.maxGuests ?? 2,
                roomSizeSqFt: dto.roomSizeSqFt ?? 350,
                view: dto.view || 'City',
                features: dto.features || [],
                safetyFeatures: dto.safetyFeatures || [],
                images: dto.images,
                isFeatured: dto.isFeatured ?? false,
                bookedDates: [],
            },
        });
        return this.formatRoom(room);
    }
    async update(id, dto) {
        const existing = await this.prisma.room.findUnique({
            where: { id },
        });
        if (!existing || existing.deletedAt) {
            throw new common_1.NotFoundException(`Room with ID '${id}' not found`);
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
                images: dto.images ? dto.images : existing.images,
                isFeatured: dto.isFeatured !== undefined ? dto.isFeatured : existing.isFeatured,
            },
        });
        return this.formatRoom(updated);
    }
    async delete(id) {
        const existing = await this.prisma.room.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Room with ID '${id}' not found`);
        }
        await this.prisma.room.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { message: 'Room removed successfully' };
    }
    async toggleAvailability(id) {
        const room = await this.prisma.room.findUnique({ where: { id } });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const updated = await this.prisma.room.update({
            where: { id },
            data: {
                isAvailable: !room.isAvailable,
                status: !room.isAvailable ? client_1.RoomStatus.AVAILABLE : client_1.RoomStatus.MAINTENANCE,
            },
        });
        return this.formatRoom(updated);
    }
    generateSlug(title, roomId) {
        const base = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return `${base}-${roomId}`.toLowerCase();
    }
    formatRoom(room) {
        return {
            ...room,
            _id: room.id,
        };
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = RoomsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map