/** unknown 是否为非空对象（数组不算） */
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Prisma Json 列读出的值只能是 unknown，这里收敛唯一的转换入口：
 * 结构匹配就按目标类型收窄，否则回退默认值，避免散落的 as any。
 */
export function asJson<T>(value: unknown, fallback: T): T {
  return isRecord(value) || Array.isArray(value) ? (value as unknown as T) : fallback;
}
