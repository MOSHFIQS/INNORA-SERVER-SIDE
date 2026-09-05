import {
     CallHandler,
     ExecutionContext,
     Injectable,
     NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T>
     implements NestInterceptor<T, ApiResponse<T> | T> {
     intercept(
          context: ExecutionContext,
          next: CallHandler,
     ): Observable<ApiResponse<T> | T> {
          return next.handle().pipe(
               map((data) => {
                    if (
                         data &&
                         typeof data === 'object' &&
                         'success' in data &&
                         'message' in data &&
                         'data' in data
                    ) {
                         return data;
                    }

                    return {
                         success: true,
                         message: 'Operation successful',
                         data,
                    } as ApiResponse<T>;
               }),
          );
     }
}
