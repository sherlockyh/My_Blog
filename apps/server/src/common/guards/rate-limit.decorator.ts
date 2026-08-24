import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  ttl: number;
  limit: number;
  name?: string;
}

export const RATE_LIMIT_KEY = 'rate-limit';

export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);
