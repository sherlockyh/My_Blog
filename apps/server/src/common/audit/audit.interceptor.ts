import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Observable, tap } from 'rxjs';
import { AUDIT_ACTION_KEY, AuditActionOptions } from './audit.decorator';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.getAllAndOverride<AuditActionOptions>(AUDIT_ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!options) return next.handle();

    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap((result) => {
        const source = { params: req.params, body: req.body, result };
        const detail = this.buildDetail(options, source);
        const targetId = options.targetId ?? (options.targetIdPath ? this.readPath(source, options.targetIdPath) : undefined);
        void this.audit.log({
          user: req.user,
          action: options.action,
          targetType: options.targetType,
          targetId: this.toTargetId(targetId),
          detail: detail as Prisma.InputJsonValue | undefined,
          ip: req.ip,
        });
      }),
    );
  }

  private buildDetail(options: AuditActionOptions, source: Record<string, unknown>) {
    const detail: Record<string, unknown> = {};
    if (options.bodyFieldsDetailKey && source.body && typeof source.body === 'object') {
      detail[options.bodyFieldsDetailKey] = Object.keys(source.body as Record<string, unknown>);
    }
    Object.entries(options.detailPaths ?? {}).forEach(([key, path]) => {
      const value = this.readPath(source, path);
      const jsonValue = this.toJsonValue(value);
      if (jsonValue !== undefined) detail[key] = jsonValue;
    });
    return Object.keys(detail).length ? detail : undefined;
  }

  private readPath(source: Record<string, unknown>, path: string) {
    return path.split('.').reduce<unknown>((value, key) => {
      if (value === null || typeof value !== 'object') return undefined;
      return (value as Record<string, unknown>)[key];
    }, source);
  }

  private toTargetId(value: unknown) {
    if (typeof value === 'number' || typeof value === 'string') return value;
    return undefined;
  }

  private toJsonValue(value: unknown): unknown {
    if (value === undefined) return undefined;
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
      return value.map((item) => this.toJsonValue(item) ?? null);
    }
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((json, [key, item]) => {
        const jsonValue = this.toJsonValue(item);
        if (jsonValue !== undefined) json[key] = jsonValue;
        return json;
      }, {});
    }
    return String(value);
  }
}
