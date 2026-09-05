import {
     Body,
     Controller,
     Delete,
     Get,
     Param,
     Patch,
     Post,
     Query,
     UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
     constructor(private readonly roomsService: RoomsService) {}

     @Public()
     @Get()
     @ApiOperation({ summary: 'Get all rooms with filtering and pagination' })
     async findAll(@Query() query: QueryRoomDto) {
          // If query limit is not specified or user asks for full list without pagination wrapper:
          // we return the formatted array directly if requested as raw or standard paginated
          const result = await this.roomsService.findAll(query);
          return result.data;
     }

     @Public()
     @Get('featured')
     @ApiOperation({ summary: 'Get featured luxury rooms' })
     findFeatured() {
          return this.roomsService.findFeatured();
     }

     @Public()
     @Get('homepage')
     @ApiOperation({ summary: 'Get homepage rooms' })
     findHomePageRooms() {
          return this.roomsService.findHomePageRooms();
     }

     @Public()
     @Get(':id')
     @ApiOperation({ summary: 'Get room by ID, roomId, or slug' })
     findOne(@Param('id') id: string) {
          return this.roomsService.findOne(id);
     }

     @Post()
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Create new room (Admin/Staff)' })
     create(@Body() dto: CreateRoomDto) {
          return this.roomsService.create(dto);
     }

     @Patch(':id')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Update room (Admin/Staff)' })
     update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
          return this.roomsService.update(id, dto);
     }

     @Patch(':id/toggle-availability')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Toggle room availability status' })
     toggleAvailability(@Param('id') id: string) {
          return this.roomsService.toggleAvailability(id);
     }

     @Delete(':id')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Soft delete room (Super Admin/Admin)' })
     delete(@Param('id') id: string) {
          return this.roomsService.delete(id);
     }
}
