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
    } else if (exception && typeof exception === 'object') {
      // body-parser 的超限异常不是 Nest HttpException，按其标准 status 转成可识别的 413。
      const error = exception as { status?: unknown; statusCode?: unknown };
      const rawStatus = error.status ?? error.statusCode;
      if (typeof rawStatus === 'number' && rawStatus >= 400 && rawStatus < 600) {
        status = rawStatus;
        message = status === HttpStatus.PAYLOAD_TOO_LARGE ? '请求体过大' : '请求处理失败';
      }
    }
    res.status(status).json({ code: status, data: null, message });
  }
}
