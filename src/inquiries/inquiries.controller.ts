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
import { InquiryStatus, UserRole } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { QueryInquiryDto } from './dto/query-inquiry.dto';
import { InquiriesService } from './inquiries.service';

@ApiTags('Inquiries')
@Controller('inquiries')
export class InquiriesController {
     constructor(private readonly inquiriesService: InquiriesService) {}

     @Public()
     @Post()
     @ApiOperation({ summary: 'Submit contact message or event inquiry' })
     create(@Body() dto: CreateInquiryDto, @CurrentUser() user?: AuthUser) {
          return this.inquiriesService.create(dto, user?.id);
     }

     @Get()
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Get all inquiries (Admin/Staff)' })
     findAll(@Query() query: QueryInquiryDto) {
          return this.inquiriesService.findAll(query);
     }

     @Get('my')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Get current user inquiries' })
     findMyInquiries(@CurrentUser() user: AuthUser) {
          return this.inquiriesService.findMyInquiries(user.id);
     }

     @Get(':id')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Get single inquiry by ID' })
     findOne(@Param('id') id: string) {
          return this.inquiriesService.findOne(id);
     }

     @Patch(':id/status')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Update inquiry status & admin notes' })
     updateStatus(
          @Param('id') id: string,
          @Body('status') status: InquiryStatus,
          @Body('adminNotes') adminNotes?: string,
     ) {
          return this.inquiriesService.updateStatus(id, status, adminNotes);
     }

     @Delete(':id')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Delete inquiry' })
     delete(@Param('id') id: string) {
          return this.inquiriesService.delete(id);
     }
}
