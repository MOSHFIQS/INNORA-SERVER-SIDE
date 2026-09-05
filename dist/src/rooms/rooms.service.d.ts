import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
export declare class RoomsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(query: QueryRoomDto): Promise<{
        data: any[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findFeatured(): Promise<any[]>;
    findHomePageRooms(): Promise<any[]>;
    findOne(idOrSlugOrRoomId: string): Promise<any>;
    create(dto: CreateRoomDto): Promise<any>;
    update(id: string, dto: UpdateRoomDto): Promise<any>;
    delete(id: string): Promise<{
        message: string;
    }>;
    toggleAvailability(id: string): Promise<any>;
    private generateSlug;
    private formatRoom;
}
