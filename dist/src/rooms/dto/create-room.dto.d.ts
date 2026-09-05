import { RoomStatus, RoomType } from '@prisma/client';
export declare class CreateRoomDto {
    roomId: string;
    roomNumber: string;
    floor?: number;
    title: string;
    description?: string;
    shortDescription?: string;
    type?: RoomType;
    status?: RoomStatus;
    isAvailable?: boolean;
    bedType?: string;
    pricePerNight: number;
    currency?: string;
    maxGuests?: number;
    roomSizeSqFt?: number;
    view?: string;
    features?: string[];
    safetyFeatures?: string[];
    images: {
        main: string;
        gallery?: string[];
    };
    isFeatured?: boolean;
}
