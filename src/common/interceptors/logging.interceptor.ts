import {
     CallHandler,
     ExecutionContext,
     Injectable,
     Logger,
     NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
     private readonly logger = new Logger('HTTP');

     intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
          const req = context.switchToHttp().getRequest<Request>();
          const res = context.switchToHttp().getResponse<Response>();
          const { method, url } = req;
          const start = Date.now();

          return next.handle().pipe(
               tap(() => {
                    const elapsed = Date.now() - start;
                    const statusCode = res.statusCode;
                    this.logger.log(`${method} ${url} ${statusCode} - ${elapsed}ms`);
               }),
          );
     }
}
