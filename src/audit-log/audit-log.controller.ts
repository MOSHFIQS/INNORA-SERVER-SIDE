import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuditLogService } from './audit-log.service';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AuditLogController {
     constructor(private readonly auditLogService: AuditLogService) {}

     @Get()
     @ApiOperation({ summary: 'Get security and system audit trail' })
     findAll(@Query() query: PaginationDto) {
          return this.auditLogService.findAll(query);
     }

     @Get(':id')
     @ApiOperation({ summary: 'Get single audit log payload by ID' })
     findOne(@Param('id') id: string) {
          return this.auditLogService.findOne(id);
     }
}
