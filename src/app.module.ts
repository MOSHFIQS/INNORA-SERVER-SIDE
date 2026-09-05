import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CommonModule } from './common/common.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { appConfig, cloudinaryConfig, fileUploadConfig, jwtConfig, rateLimitConfig } from './config';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthController } from './health.controller';
import { InquiriesModule } from './inquiries/inquiries.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { RoomsModule } from './rooms/rooms.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';

@Module({
     imports: [
          ConfigModule.forRoot({
               isGlobal: true,
               load: [appConfig, jwtConfig, cloudinaryConfig, rateLimitConfig, fileUploadConfig],
               envFilePath: ['.env'],
          }),
          ThrottlerModule.forRootAsync({
               imports: [ConfigModule],
               inject: [ConfigService],
               useFactory: (config: ConfigService) => [
                    {
                         ttl: config.get<number>('rateLimit.ttl', 60) * 1000,
                         limit: config.get<number>('rateLimit.limit', 100),
                    },
               ],
          }),
          CommonModule,
          CloudinaryModule,
          AuthModule,
          UsersModule,
          RoomsModule,
          BookingsModule,
          ReviewsModule,
          InquiriesModule,
          NotificationsModule,
          AuditLogModule,
          DashboardModule,
          SettingsModule,
     ],
     providers: [
          {
               provide: APP_PIPE,
               useValue: new ValidationPipe({
                    whitelist: true,
                    transform: true,
                    forbidNonWhitelisted: true,
                    transformOptions: {
                         enableImplicitConversion: true,
                    },
               }),
          },
          {
               provide: APP_FILTER,
               useClass: GlobalExceptionFilter,
          },
          {
               provide: APP_INTERCEPTOR,
               useClass: LoggingInterceptor,
          },
          {
               provide: APP_INTERCEPTOR,
               useClass: TransformInterceptor,
          },
          {
               provide: APP_GUARD,
               useClass: ThrottlerGuard,
          },
     ],
     controllers: [HealthController],
})
export class AppModule implements NestModule {
     configure(consumer: MiddlewareConsumer) {}
}
