import {
     Controller,
     Get,
     Param,
     Patch,
     Query,
     UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
     constructor(private readonly notificationsService: NotificationsService) {}

     @Get()
     @ApiOperation({ summary: 'Get current user notifications' })
     findMyNotifications(@CurrentUser() user: AuthUser, @Query('limit') limit?: number) {
          return this.notificationsService.findByUser(user.id, limit ? Number(limit) : 10);
     }

     @Get('unread-count')
     @ApiOperation({ summary: 'Get unread notifications count' })
     getUnreadCount(@CurrentUser() user: AuthUser) {
          return this.notificationsService.getUnreadCount(user.id);
     }

     @Patch(':id/read')
     @ApiOperation({ summary: 'Mark single notification as read' })
     markAsRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
          return this.notificationsService.markAsRead(id, user.id);
     }

     @Patch('read-all')
     @ApiOperation({ summary: 'Mark all user notifications as read' })
     markAllAsRead(@CurrentUser() user: AuthUser) {
          return this.notificationsService.markAllAsRead(user.id);
     }
}
