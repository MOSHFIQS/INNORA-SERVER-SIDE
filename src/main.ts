import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
     const logger = new Logger('Bootstrap');
     const app = await NestFactory.create(AppModule, {
          bufferLogs: true,
     });

     const configService = app.get(ConfigService);
     const port = configService.get<number>('app.port', 5000);
     const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
     const appName = configService.get<string>('app.name', 'INNORA Hotel Management API');
     const appVersion = configService.get<string>('app.version', '1.0.0');
     const corsOrigin = configService.get<string>('app.corsOrigin', '*');
     const env = configService.get<string>('app.env', 'development');

     // Security headers
     app.use(
          helmet({
               crossOriginResourcePolicy: { policy: 'cross-origin' },
               contentSecurityPolicy: false,
          }),
     );

     // Parse cookies for HttpOnly JWT extraction
     app.use(cookieParser());

     // CORS
     app.enableCors({
          origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o: string) => o.trim()),
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
          credentials: true,
     });

     // Global API prefix
     app.setGlobalPrefix(apiPrefix, {
          exclude: [
               { path: '/', method: RequestMethod.ALL },
               { path: 'health', method: RequestMethod.ALL },
          ],
     });

     // Validation
     app.useGlobalPipes(
          new ValidationPipe({
               whitelist: true,
               transform: true,
               forbidNonWhitelisted: true,
               transformOptions: {
                    enableImplicitConversion: true,
               },
          }),
     );

     // Swagger API Documentation
     const swaggerConfig = new DocumentBuilder()
          .setTitle(appName)
          .setDescription(
               'Enterprise-grade INNORA Hotel Management REST API with NestJS & Prisma. ' +
               'Authentication uses JWT HttpOnly cookies & Bearer tokens. Uploads use multipart/form-data.',
          )
          .setVersion(appVersion)
          .addBearerAuth(
               {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'Authorization',
                    description: 'Enter your JWT access token',
                    in: 'header',
               },
               'access-token',
          )
          .addTag('Authentication', 'Login, registration, sessions, and profile')
          .addTag('Rooms', 'Hotel rooms catalog and availability')
          .addTag('Bookings', 'Guest bookings, date updates, and reservation management')
          .addTag('Reviews', 'Guest room ratings and feedback')
          .addTag('Dashboard', 'Hotel occupancy, revenue, and guest analytics')
          .addTag('Users', 'Staff and customer account management')
          .addTag('Inquiries', 'Customer contact messages and banquet inquiries')
          .addTag('Notifications', 'In-app guest and staff notifications')
          .addTag('Settings', 'Hotel site settings, amenities, and carousel banners')
          .addTag('Cloudinary Uploads', 'Media and image upload service')
          .build();

     const document = SwaggerModule.createDocument(app, swaggerConfig);
     SwaggerModule.setup('api-docs', app, document, {
          swaggerOptions: {
               persistAuthorization: true,
               docExpansion: 'none',
               filter: true,
          },
          customSiteTitle: `${appName} - Documentation`,
     });

     app.enableShutdownHooks();

     await app.listen(port);

     logger.log(`==================================================`);
     logger.log(`🏨 ${appName} is running!`);
     logger.log(`📦 Environment: ${env}`);
     logger.log(`🌐 Listening on: http://localhost:${port}/${apiPrefix}`);
     logger.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
     logger.log(`==================================================`);
}

bootstrap().catch((error) => {
     // eslint-disable-next-line no-console
     console.error('❌ Failed to bootstrap application:', error);
     process.exit(1);
});
