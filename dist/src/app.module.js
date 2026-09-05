"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const auth_module_1 = require("./auth/auth.module");
const bookings_module_1 = require("./bookings/bookings.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const common_module_1 = require("./common/common.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const config_2 = require("./config");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const health_controller_1 = require("./health.controller");
const inquiries_module_1 = require("./inquiries/inquiries.module");
const notifications_module_1 = require("./notifications/notifications.module");
const reviews_module_1 = require("./reviews/reviews.module");
const rooms_module_1 = require("./rooms/rooms.module");
const settings_module_1 = require("./settings/settings.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
    configure(consumer) { }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.appConfig, config_2.jwtConfig, config_2.cloudinaryConfig, config_2.rateLimitConfig, config_2.fileUploadConfig],
                envFilePath: ['.env'],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: config.get('rateLimit.ttl', 60) * 1000,
                        limit: config.get('rateLimit.limit', 100),
                    },
                ],
            }),
            common_module_1.CommonModule,
            cloudinary_module_1.CloudinaryModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            rooms_module_1.RoomsModule,
            bookings_module_1.BookingsModule,
            reviews_module_1.ReviewsModule,
            inquiries_module_1.InquiriesModule,
            notifications_module_1.NotificationsModule,
            audit_log_module_1.AuditLogModule,
            dashboard_module_1.DashboardModule,
            settings_module_1.SettingsModule,
        ],
        providers: [
            {
                provide: core_1.APP_PIPE,
                useValue: new common_1.ValidationPipe({
                    whitelist: true,
                    transform: true,
                    forbidNonWhitelisted: true,
                    transformOptions: {
                        enableImplicitConversion: true,
                    },
                }),
            },
            {
                provide: core_1.APP_FILTER,
                useClass: global_exception_filter_1.GlobalExceptionFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map