import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

/** 统一错误响应结构，与 TransformInterceptor 保持一致 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse();
      message =
        typeof resp === 'string'
          ? resp
          : Array.isArray((resp as any).message)
            ? (resp as any).message.join('; ')
            : ((resp as any).message ?? exception.message);
    }
    res.status(status).json({ code: status, data: null, message });
  }
}
