interface AppConfig {
  NODE_ENV?: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  JWT_SECRET?: string;
  CORS_ORIGIN?: string;
  PORT?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
}

function assertUrl(name: keyof AppConfig, value: string | undefined, required: boolean) {
  if (!value) {
    if (required) throw new Error(`缺少必要环境变量 ${name}`);
    return;
  }
  try {
    // 只做启动期基础格式校验，具体连通性由 /api/health/ready 负责。
    new URL(value);
  } catch {
    throw new Error(`${name} 必须是合法 URL`);
  }
}

export function validateConfig(config: AppConfig) {
  const isProduction = config.NODE_ENV === 'production';
  // DB/Redis 是服务启动后的核心依赖：这里校验“配置存在且格式正确”，连通性留给 readiness。
  assertUrl('DATABASE_URL', config.DATABASE_URL, true);
  assertUrl('REDIS_URL', config.REDIS_URL, true);

  if (config.PORT && !Number.isInteger(Number(config.PORT))) {
    throw new Error('PORT 必须是整数');
  }

  if (isProduction) {
    // 生产环境宁可启动失败，也不能带默认密钥上线；否则历史 token 伪造风险不可控。
    if (!config.JWT_SECRET || config.JWT_SECRET === 'my-blog-jwt-secret' || config.JWT_SECRET === 'change-me') {
      throw new Error('生产环境必须配置安全的 JWT_SECRET');
    }
    if (!config.CORS_ORIGIN) {
      throw new Error('生产环境必须配置 CORS_ORIGIN');
    }
    if (!config.ADMIN_USERNAME || !config.ADMIN_PASSWORD || config.ADMIN_PASSWORD === 'admin123') {
      throw new Error('生产环境必须配置安全的 ADMIN_USERNAME 和 ADMIN_PASSWORD');
    }
    // CORS 支持逗号分隔多域名，但每一项都必须是完整 URL，避免误填通配符或半截域名。
    config.CORS_ORIGIN.split(',').forEach((origin) => assertUrl('CORS_ORIGIN', origin.trim(), true));
  }

  return config;
}
