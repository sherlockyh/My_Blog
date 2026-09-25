/**
 * 业务层需要的最小请求视图：只声明实际用到的字段，
 * 控制器/守卫不与具体 HTTP 框架的完整 Request 类型耦合。
 */
export interface RequestContext {
  ip?: string;
  method?: string;
  path?: string;
  route?: { path?: string };
  headers?: Record<string, string | string[] | undefined>;
}
