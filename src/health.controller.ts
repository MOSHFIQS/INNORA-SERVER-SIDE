import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';
import { PrismaService } from './common/prisma/prisma.service';

@ApiTags('Health')
@Controller()
export class HealthController {
     constructor(private readonly prisma: PrismaService) {}

     @Public()
     @Get()
     @ApiOperation({ summary: 'Root health check' })
     getRoot() {
          return {
               status: 'ok',
               service: 'INNORA Hotel Management Platform API',
               version: '1.0.0',
               timestamp: new Date().toISOString(),
          };
     }

     @Public()
     @Get('health')
     @ApiOperation({ summary: 'Detailed system health check' })
     async getHealth() {
          let dbStatus = 'disconnected';
          let dbLatency = 0;
          try {
               const start = Date.now();
               await this.prisma.$queryRaw`SELECT 1`;
               dbLatency = Date.now() - start;
               dbStatus = 'connected';
          } catch (e) {
               dbStatus = `error: ${e.message}`;
          }

          return {
               status: 'ok',
               timestamp: new Date().toISOString(),
               database: {
                    status: dbStatus,
                    latencyMs: dbLatency,
               },
               uptime: process.uptime(),
          };
     }
}
