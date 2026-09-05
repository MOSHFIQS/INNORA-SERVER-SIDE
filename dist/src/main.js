"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port', 5000);
    const apiPrefix = configService.get('app.apiPrefix', 'api/v1');
    const appName = configService.get('app.name', 'INNORA Hotel Management API');
    const appVersion = configService.get('app.version', '1.0.0');
    const corsOrigin = configService.get('app.corsOrigin', '*');
    const env = configService.get('app.env', 'development');
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    }));
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    app.setGlobalPrefix(apiPrefix, {
        exclude: [
            { path: '/', method: common_1.RequestMethod.ALL },
            { path: 'health', method: common_1.RequestMethod.ALL },
        ],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle(appName)
        .setDescription('Enterprise-grade INNORA Hotel Management REST API with NestJS & Prisma. ' +
        'Authentication uses JWT HttpOnly cookies & Bearer tokens. Uploads use multipart/form-data.')
        .setVersion(appVersion)
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token',
        in: 'header',
    }, 'access-token')
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
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
    console.error('❌ Failed to bootstrap application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map