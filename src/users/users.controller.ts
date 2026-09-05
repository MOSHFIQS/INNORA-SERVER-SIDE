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
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
     constructor(private readonly usersService: UsersService) {}

     @Get()
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiOperation({ summary: 'Get all users with pagination & role filtering' })
     findAll(@Query() query: QueryUserDto) {
          return this.usersService.findAll(query);
     }

     @Get(':id')
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiOperation({ summary: 'Get single user by ID' })
     findOne(@Param('id') id: string) {
          return this.usersService.findOne(id);
     }

     @Post()
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiOperation({ summary: 'Create user account (Admin/SuperAdmin)' })
     create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
          return this.usersService.create(dto, user.id);
     }

     @Patch(':id')
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiOperation({ summary: 'Update user account (Admin/SuperAdmin)' })
     update(
          @Param('id') id: string,
          @Body() dto: UpdateUserDto,
          @CurrentUser() user: AuthUser,
     ) {
          return this.usersService.update(id, dto, user.id);
     }

     @Delete(':id')
     @Roles(UserRole.SUPER_ADMIN)
     @ApiOperation({ summary: 'Delete user account (SuperAdmin only)' })
     delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
          return this.usersService.delete(id, user.id);
     }
}
