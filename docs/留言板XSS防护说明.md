# 留言板 XSS 防护说明

## 1. 防护目标

留言板允许访客提交昵称和留言内容，并在公开留言板、后台留言列表和后台详情弹窗中展示。防护目标是阻止留言内容作为 HTML 或脚本执行，同时保留普通文本和换行。

当前留言板不提供 HTML、Markdown、图片、链接或富文本能力，因此采用纯文本策略，不引入 HTML 清洗器。

## 2. 当前数据链路

```text
访客表单
  -> POST /api/messages
  -> NestJS DTO 校验
  -> PostgreSQL Message.content
  -> GET /api/messages 或 GET /api/admin/messages
  -> React 文本节点渲染
```

留言内容的最终渲染位置：

- 公开留言板：`apps/web/src/pages/guestbook/index.tsx`
- 后台详情：`apps/web/src/pages/admin/Messages/components/MessageDetailModal/index.tsx`

这两个位置必须使用 React 普通文本插值，例如：

```tsx
<span>{message.content}</span>
<p>{message.content}</p>
```

禁止使用：

```tsx
dangerouslySetInnerHTML={{ __html: message.content }}
```

## 3. 已实现的防护

### 3.1 输出上下文编码

React 将字符串插入文本节点时会自动进行 HTML 转义。`<script>`、事件属性和 HTML 标签会按原始文字显示，不会进入 DOM 的 HTML 解析上下文。

留言内容没有经过正则替换或字符串拼接为 HTML，避免了“关键词过滤被绕过”的问题。

### 3.2 服务端输入校验

文件：`apps/server/src/modules/message/dto/message.dto.ts`

- `nickname` 必须是字符串，长度不超过 20。
- `content` 必须是字符串，长度不超过 500。
- 昵称和内容不能是空字符串或全空白字符。

输入校验用于控制数据格式和长度，不能替代输出编码。

### 3.3 安全响应头

文件：`apps/server/src/main.ts`

后端统一返回：

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

前端入口 `apps/web/index.html` 同时配置了 CSP 元标签。当前 `connect-src` 只允许同源、开发端口和本地 API；实际生产环境如果 API 使用独立域名，应把真实 API origin 显式加入 CSP，并由 Nginx、CDN 或其他网关在实际 HTML 响应层配置 CSP 响应头，不能只依赖元标签。

## 4. 验证用例

可使用以下内容作为留言正文进行验证：

```text
<script>alert(1)</script>
<img src=x onerror=alert(1)>
"><svg/onload=alert(1)>
javascript:alert(1)
```

预期结果：

1. 留言可以按普通文本提交和保存。
2. 公开留言板只显示字符串，不弹窗、不执行脚本、不新增 DOM 标签。
3. 后台留言列表和详情弹窗只显示字符串。
4. 浏览器控制台没有由留言内容触发的脚本错误或 CSP 违规。

接口层可以确认响应仍是 JSON：

```text
POST /api/messages
GET /api/messages
```

不要仅凭“接口返回了原始字符串”判断存在 XSS；XSS 是否成立取决于最终输出上下文。

## 5. 开发约束

- 留言字段保持纯文本，不存储经过 HTML 拼接的内容。
- 新增留言展示位置时，默认使用 React 文本插值。
- 不为留言内容增加 `dangerouslySetInnerHTML`、`innerHTML` 或未经审核的 HTML 渲染器。
- 如果需要换行，使用 `white-space: pre-wrap` 和 `overflow-wrap: anywhere`。
- 后端新增返回留言内容的接口时，保持 JSON 字符串返回，不返回可执行 HTML。

## 6. 未来支持富文本时

如果未来明确支持富文本，不能直接复用当前纯文本策略。需要单独设计：

1. 使用成熟的 HTML 清洗器和严格白名单，而不是正则删除标签。
2. 仅允许业务确实需要的标签和属性。
3. 禁止事件属性、`style`、`iframe`、SVG、`javascript:`、`data:` 脚本协议和任意未知协议。
4. 在服务端清洗后再存储，前端仍禁止任意 HTML 注入。
5. 为公开页和后台页分别验证存储型、反射型和 DOM 型 XSS payload。

富文本清洗规则发生变化时，应同步更新接口测试、浏览器验收和部署层 CSP。
