import { CreateRoomDto } from './dto/create-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    findAll(query: QueryRoomDto): Promise<any[]>;
    findFeatured(): Promise<any[]>;
    findHomePageRooms(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: CreateRoomDto): Promise<any>;
    update(id: string, dto: UpdateRoomDto): Promise<any>;
    toggleAvailability(id: string): Promise<any>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
