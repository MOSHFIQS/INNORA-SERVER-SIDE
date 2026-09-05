import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryUserDto extends PaginationDto {
     @ApiPropertyOptional({ enum: UserRole })
     @IsOptional()
     @IsEnum(UserRole)
     role?: UserRole;

     @ApiPropertyOptional({ enum: UserStatus })
     @IsOptional()
     @IsEnum(UserStatus)
     status?: UserStatus;
}
