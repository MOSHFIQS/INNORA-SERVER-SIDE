"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadConfig = exports.cloudinaryConfig = exports.rateLimitConfig = exports.jwtConfig = exports.appConfig = void 0;
const config_1 = require("@nestjs/config");
exports.appConfig = (0, config_1.registerAs)('app', () => ({
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    name: process.env.APP_NAME || 'INNORA Hotel Management API',
    version: process.env.APP_VERSION || '1.0.0',
    corsOrigin: process.env.CORS_ORIGIN || '*',
}));
exports.jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'innora-super-secret-jwt-key-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
exports.rateLimitConfig = (0, config_1.registerAs)('rateLimit', () => ({
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
}));
exports.cloudinaryConfig = (0, config_1.registerAs)('cloudinary', () => ({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
}));
exports.fileUploadConfig = (0, config_1.registerAs)('fileUpload', () => ({
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
    ],
}));
exports.default = {
    appConfig: exports.appConfig,
    jwtConfig: exports.jwtConfig,
    rateLimitConfig: exports.rateLimitConfig,
    cloudinaryConfig: exports.cloudinaryConfig,
    fileUploadConfig: exports.fileUploadConfig,
};
//# sourceMappingURL=index.js.map