# 架构与性能优化说明

## 当前架构

项目采用 pnpm workspace + Turborepo 组织代码：

- `apps/web`：Vite + React + TypeScript，承载公开博客和后台管理。
- `apps/server`：NestJS + Prisma，提供公开接口、后台接口、上传和浏览量统计。
- `packages/shared`：前后端共享 DTO、枚举和通用类型。
- PostgreSQL 持久化内容数据，Redis 承担站点缓存和浏览量实时计数。

## 本轮优化内容

### 1. 前端路由拆包

公开页面、后台页面和文章编辑页已改为路由级懒加载。后台页面包含 Ant Design 管理表格、Markdown 编辑器等较重依赖，延迟加载后，用户访问公开博客时不需要一次性下载后台代码。

同时在 Vite 中增加 `manualChunks`：

- `react`：React 及路由核心依赖。
- `antd`：Ant Design 和图标库。
- `markdown`：Markdown 渲染与编辑器。

这样业务代码变化时，稳定第三方依赖可以更好地命中浏览器缓存。

### 2. 数据库索引

Prisma schema 增加了高频查询索引：

- 文章公开列表：`status + publishedAt + id`
- 文章后台列表：`updatedAt`
- 热门文章排序：`viewCount`
- 精选项目：`featured + sort + createdAt`
- 资源分类：`category + createdAt`
- 留言列表：`createdAt`
- 审计日志：`createdAt`、`targetType + targetId`、`userId + createdAt`

关键词搜索使用 PostgreSQL `pg_trgm` GIN 索引，SQL 脚本位于：

```text
apps/server/prisma/sql/2026-08-23-backend-hardening.sql
```

更新 schema 后，开发环境可以继续使用：

```bash
pnpm db:push
```

生产环境建议改用 Prisma migration，避免直接 `db push` 带来不可审计的结构变更。

### 3. 后台文章分页

后台文章列表已从一次性拉取全部文章改为服务端分页。文章正文通常较大，随着文章增加，全量加载会拖慢后台首屏，也会浪费数据库和网络资源。

文章编辑页也改为按 `id` 查询单篇文章，不再先拉取整个文章列表再本地查找。

公开文章列表和后台文章列表都只查询列表所需字段，不再读取正文大字段。

### 4. 浏览量刷库优化

浏览量仍以 Redis 作为实时源，但写回数据库时不再扫描所有 `counter:article:*` key。现在每次文章浏览量变化时，会把文章 id 写入 `dirty:article_views` 集合；定时任务按批次刷这些发生变化的文章。

这个设计的收益：

- 文章越多，定时任务收益越明显。
- 定时任务失败时，待刷集合保留，下次任务继续处理。
- 数据库写入仍是幂等更新，不会因为重复刷库导致浏览量叠加错误。

### 5. 前台博客展示与后台编辑分离

公开博客端已按展示链路重新组织：首页、文章列表、文章详情、归档、分类、标签都只消费公开文章接口；后台 `/admin` 继续承担内容编辑和站点配置。前台文章卡片与侧栏抽为可复用组件，列表和详情共享“关于我 / 最新文章 / 热门标签”模块，后续扩展推荐文章、相关文章、阅读进度时可以在公共组件层演进。

前台 UI 说明见 [docs/frontend-blog-ui.md](frontend-blog-ui.md)。

## 后续建议

### 短期

- 为登录、留言、上传接口增加限流。
- CORS 改为按环境配置白名单。
- 上传服务抽象为 `StorageService`，生产环境切到 S3 或 OSS。
- 增加 `pnpm typecheck`、`pnpm build` 的 CI。

以上短期项已完成基础实现：登录、留言和上传接口使用 Redis 固定窗口限流；上传已通过 `StorageService` 隔离存储实现；CI 会执行类型检查和构建。

## 生产环境配置建议

后端生产环境至少配置：

```ini
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=replace-with-admin-user
ADMIN_PASSWORD=replace-with-a-strong-password
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

健康检查接口为：

```text
GET /api/health
GET /api/health/live
GET /api/health/ready
```

`live` 只判断进程是否存活；`ready` 会检查 PostgreSQL 和 Redis 是否可用，适合挂到负载均衡、K8s readiness probe 或监控系统。

## 数据库变更流程

开发阶段仍可使用：

```bash
pnpm db:push
```

生产和协作环境建议使用 migration：

```bash
pnpm db:migrate:dev      # 本地生成迁移
pnpm db:migrate:deploy   # CI/CD 或生产环境执行迁移
```

这样索引和字段变更会进入可审计的迁移历史，避免 `db push` 在生产环境直接修改结构。

## 后端安全与一致性

当前策略：

- 生产环境必须配置安全的 `JWT_SECRET`、`ADMIN_USERNAME`、`ADMIN_PASSWORD` 和 `CORS_ORIGIN`。
- 上传接口只允许 PNG、JPG、GIF、WebP，暂不允许 SVG，避免公开访问 SVG 带来脚本注入风险。
- 公开文章列表支持 Keyset pagination，使用 `publishedAt + id` 作为游标；未传 `cursor` 时仍兼容原 page 分页。
- 文章 slug 创建和更新会在唯一索引冲突时重试，降低并发创建同名文章时的失败概率。
- 后台文章、项目、资源、留言删除、站点配置和个人资料写操作会记录审计日志。

## Redis 降级策略

当前策略：

- 限流：Redis 故障时失败，避免高风险接口失去保护。
- readiness：Redis 故障时失败，让流量调度层摘除实例。
- 缓存：Redis 故障时降级查数据库，不影响公开页面访问。
- 浏览量：Redis 故障时返回数据库持久化值，避免文章详情不可访问。

### 中期

- 首页最新文章、精选项目、标签列表做统一缓存和失效策略。
- 增加接口日志、错误追踪和基础指标。

### 长期

- 如果重视 SEO 和首屏性能，可以评估 Next.js 或 SSG 方案。
- 如果后台能力继续增强，可以拆出更明确的权限模型、审计日志和操作记录。
- 如果图片资源增长明显，增加图片压缩、缩略图和 CDN。
