/** 外部项目入口只允许 HTTP/HTTPS，存量无效地址也不会成为可点击链接。 */
export function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value.trim())) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
