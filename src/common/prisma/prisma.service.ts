import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
     private readonly logger = new Logger(PrismaService.name);

     constructor() {
          const pool = new Pool({
               connectionString: process.env.DATABASE_URL,
               max: 10,
               idleTimeoutMillis: 30000,
               connectionTimeoutMillis: 10000,
          });
          const adapter = new PrismaPg(pool);

          super({
               adapter,
               log: ['warn', 'error'],
          });
     }

     async onModuleInit(): Promise<void> {
          const start = Date.now();
          await this.$connect();
          this.logger.log(`Prisma connected in ${Date.now() - start}ms`);
     }

     async onModuleDestroy(): Promise<void> {
          await this.$disconnect();
          this.logger.log('Prisma disconnected from database');
     }

     get softDeleteFilter() {
          return { deletedAt: null };
     }
}
