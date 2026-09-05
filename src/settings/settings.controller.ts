import {
     Body,
     Controller,
     Delete,
     Get,
     Param,
     Patch,
     Post,
     UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
     constructor(private readonly settingsService: SettingsService) {}

     @Public()
     @Get()
     @ApiOperation({ summary: 'Get hotel site settings' })
     getSettings() {
          return this.settingsService.getSettings();
     }

     @Patch()
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Update site settings' })
     updateSettings(@Body() data: any) {
          return this.settingsService.updateSettings(data);
     }

     @Public()
     @Get('banners')
     @ApiOperation({ summary: 'Get homepage hero banner slides' })
     getBanners() {
          return this.settingsService.getBanners();
     }

     @Post('banners')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Create banner slide' })
     createBanner(@Body() data: any) {
          return this.settingsService.createBanner(data);
     }

     @Patch('banners/:id')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Update banner slide' })
     updateBanner(@Param('id') id: string, @Body() data: any) {
          return this.settingsService.updateBanner(id, data);
     }

     @Delete('banners/:id')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Delete banner slide' })
     deleteBanner(@Param('id') id: string) {
          return this.settingsService.deleteBanner(id);
     }

     @Public()
     @Get('services')
     @ApiOperation({ summary: 'Get hotel amenities and luxury services' })
     getHotelServices() {
          return this.settingsService.getHotelServices();
     }
}
