"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            }
            else if (typeof res === 'object' && res !== null) {
                const resObj = res;
                message = resObj.message || exception.message;
                if (Array.isArray(resObj.message)) {
                    errors = resObj.message;
                    message = resObj.message.join('; ');
                }
                else if (resObj.errors) {
                    errors = resObj.errors;
                }
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            if (exception.code === 'P2002') {
                status = common_1.HttpStatus.CONFLICT;
                message = `Duplicate field value: ${exception.meta?.target || 'record'}`;
            }
        }
        if (status >= 500) {
            this.logger.error(`[${request.method}] ${request.url} - ${status} - ${message}`, exception instanceof Error ? exception.stack : undefined);
        }
        else {
            this.logger.warn(`[${request.method}] ${request.url} - ${status} - ${message}`);
        }
        response.status(status).json({
            success: false,
            message,
            errors,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map