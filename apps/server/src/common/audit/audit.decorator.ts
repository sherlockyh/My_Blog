import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit:action';

export interface AuditActionOptions {
  action: string;
  targetType: string;
  targetId?: string | number;
  targetIdPath?: string;
  detailPaths?: Record<string, string>;
  bodyFieldsDetailKey?: string;
}

export const AuditAction = (options: AuditActionOptions) => SetMetadata(AUDIT_ACTION_KEY, options);
