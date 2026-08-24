import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiBody<T> {
  code: number;
  data: T;
  message: string;
}

/** 统一成功响应结构 { code, data, message } */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiBody<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiBody<T>> {
    return next.handle().pipe(
      map((data) => ({ code: 0, data, message: 'ok' })),
    );
  }
}
