import { UserRole, UserStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryUserDto extends PaginationDto {
    role?: UserRole;
    status?: UserStatus;
}
