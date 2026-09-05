import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
     env: process.env.NODE_ENV || 'development',
     port: parseInt(process.env.PORT || '5000', 10),
     apiPrefix: process.env.API_PREFIX || 'api/v1',
     name: process.env.APP_NAME || 'INNORA Hotel Management API',
     version: process.env.APP_VERSION || '1.0.0',
     corsOrigin: process.env.CORS_ORIGIN || '*',
}));

export const jwtConfig = registerAs('jwt', () => ({
     secret: process.env.JWT_SECRET || 'innora-super-secret-jwt-key-2026',
     expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));

export const rateLimitConfig = registerAs('rateLimit', () => ({
     ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
     limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
}));

export const cloudinaryConfig = registerAs('cloudinary', () => ({
     cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
     apiKey: process.env.CLOUDINARY_API_KEY || '',
     apiSecret: process.env.CLOUDINARY_API_SECRET || '',
}));

export const fileUploadConfig = registerAs('fileUpload', () => ({
     maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
     allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'application/pdf',
     ],
}));

export default {
     appConfig,
     jwtConfig,
     rateLimitConfig,
     cloudinaryConfig,
     fileUploadConfig,
};
