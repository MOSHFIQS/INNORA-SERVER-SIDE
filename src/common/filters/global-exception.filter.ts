import {
     ArgumentsHost,
     Catch,
     ExceptionFilter,
     HttpException,
     HttpStatus,
     Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
     private readonly logger = new Logger(GlobalExceptionFilter.name);

     catch(exception: unknown, host: ArgumentsHost) {
          const ctx = host.switchToHttp();
          const response = ctx.getResponse<Response>();
          const request = ctx.getRequest<Request>();

          let status = HttpStatus.INTERNAL_SERVER_ERROR;
          let message = 'Internal server error';
          let errors: any = null;

          if (exception instanceof HttpException) {
               status = exception.getStatus();
               const res = exception.getResponse();
               if (typeof res === 'string') {
                    message = res;
               } else if (typeof res === 'object' && res !== null) {
                    const resObj = res as Record<string, any>;
                    message = resObj.message || exception.message;
                    if (Array.isArray(resObj.message)) {
                         errors = resObj.message;
                         message = resObj.message.join('; ');
                    } else if (resObj.errors) {
                         errors = resObj.errors;
                    }
               }
          } else if (exception instanceof Error) {
               message = exception.message;
               // Handle Prisma unique constraint error
               if ((exception as any).code === 'P2002') {
                    status = HttpStatus.CONFLICT;
                    message = `Duplicate field value: ${(exception as any).meta?.target || 'record'}`;
               }
          }

          if (status >= 500) {
               this.logger.error(
                    `[${request.method}] ${request.url} - ${status} - ${message}`,
                    exception instanceof Error ? exception.stack : undefined,
               );
          } else {
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
}
