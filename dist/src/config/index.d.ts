export declare const appConfig: (() => {
    env: string;
    port: number;
    apiPrefix: string;
    name: string;
    version: string;
    corsOrigin: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: string;
    port: number;
    apiPrefix: string;
    name: string;
    version: string;
    corsOrigin: string;
}>;
export declare const jwtConfig: (() => {
    secret: string;
    expiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    expiresIn: string;
}>;
export declare const rateLimitConfig: (() => {
    ttl: number;
    limit: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    ttl: number;
    limit: number;
}>;
export declare const cloudinaryConfig: (() => {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    cloudName: string;
    apiKey: string;
    apiSecret: string;
}>;
export declare const fileUploadConfig: (() => {
    maxFileSize: number;
    allowedMimeTypes: string[];
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    maxFileSize: number;
    allowedMimeTypes: string[];
}>;
declare const _default: {
    appConfig: (() => {
        env: string;
        port: number;
        apiPrefix: string;
        name: string;
        version: string;
        corsOrigin: string;
    }) & import("@nestjs/config").ConfigFactoryKeyHost<{
        env: string;
        port: number;
        apiPrefix: string;
        name: string;
        version: string;
        corsOrigin: string;
    }>;
    jwtConfig: (() => {
        secret: string;
        expiresIn: string;
    }) & import("@nestjs/config").ConfigFactoryKeyHost<{
        secret: string;
        expiresIn: string;
    }>;
    rateLimitConfig: (() => {
        ttl: number;
        limit: number;
    }) & import("@nestjs/config").ConfigFactoryKeyHost<{
        ttl: number;
        limit: number;
    }>;
    cloudinaryConfig: (() => {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    }) & import("@nestjs/config").ConfigFactoryKeyHost<{
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    }>;
    fileUploadConfig: (() => {
        maxFileSize: number;
        allowedMimeTypes: string[];
    }) & import("@nestjs/config").ConfigFactoryKeyHost<{
        maxFileSize: number;
        allowedMimeTypes: string[];
    }>;
};
export default _default;
