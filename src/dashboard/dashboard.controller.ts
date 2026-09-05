import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
     constructor(private readonly dashboardService: DashboardService) {}

     @Get('admin')
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiOperation({ summary: 'Get admin dashboard analytics & metrics' })
     getAdminStats() {
          return this.dashboardService.getAdminStats();
     }

     @Get('customer')
     @Roles(UserRole.CUSTOMER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiOperation({ summary: 'Get customer dashboard summary' })
     getCustomerStats(@CurrentUser() user: AuthUser) {
          return this.dashboardService.getCustomerStats(user.id);
     }
}
