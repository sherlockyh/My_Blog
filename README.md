# My Blog · Code with Joy

个人博客与后台管理系统，采用 React 前端、NestJS 后端和 pnpm Monorepo。

## 技术栈

| 层                       | 技术                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| 前端 `apps/web`          | Vite 5、React 18、TypeScript、Ant Design 5、React Router、Zustand、i18next、React Markdown |
| 后端 `apps/server`       | NestJS 10、Prisma 5、PostgreSQL、Redis（ioredis）、JWT、`@nestjs/schedule`                 |
| 共享包 `packages/shared` | 前后端共享 TypeScript 类型、DTO 和枚举                                                     |
| 基础设施                 | pnpm workspace、Turborepo、Docker Compose、PostgreSQL 16、Redis 7、MinIO                   |

## 功能

- 前台：首页、文章列表与搜索、标签过滤、分页、Markdown 文章详情、归档、分类、标签、关于我、项目作品、资源分享、留言板。
- 后台：`/admin` 管理区，支持登录、仪表盘统计、文章/项目/资源/留言管理、首页配置和个人资料维护。
- 主题与语言：亮色/暗色主题，中英文界面；内容字段按 `*Zh/*En` 成对存储，英文为空时回退中文。
- 外部服务：天气使用 open-meteo 免费接口，不需要 API Key。
- 浏览量：Redis 实时计数，同一 IP 60 秒内去重，每 5 分钟及进程退出时写回 PostgreSQL。
- 上传：图片存储在 MinIO，默认通过 `/uploads/...` 同源路径访问。

## 快速开始

前置要求：Node.js >= 20、pnpm 9+、Docker。

### 1. 准备本地配置

```bash
cp .env.example .env
cp apps/server/.env.example apps/server/.env
```

本地开发至少确认：

- 根目录 `.env` 中的 MinIO 凭证已填写，因为 `pnpm db:up` 会同时启动 MinIO；
- `apps/server/.env` 中的数据库、Redis、MinIO 地址指向 `localhost`；
- 生产环境不能使用示例 JWT 密钥和 `admin123`。

### 2. 安装依赖并启动基础服务

```bash
pnpm install
pnpm db:up
```

`pnpm db:up` 会启动：

```text
PostgreSQL  localhost:5432
Redis       localhost:6379
MinIO API   localhost:9000
MinIO 控制台 localhost:9001
```

### 3. 初始化本地数据库

```bash
pnpm db:push
pnpm db:seed
```

`db:seed` 写入示例文章、项目、资源和站点配置。管理员账号不是由 seed 写入，而是后端启动时在 `User` 表为空的情况下，按 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 自动创建。

### 4. 启动前后端

```bash
pnpm dev
```

浏览器访问：

- 前台：<http://localhost:5173>
- 后台：<http://localhost:5173/admin/login>
- 后端健康检查：<http://localhost:7001/api/health/live>

示例配置默认使用 `admin` / `admin123`，仅适合本地开发；生产环境必须修改。

## 环境变量

### 本地后端：`apps/server/.env`

后端直接运行时读取该文件，常用配置如下：

```ini
DATABASE_URL=postgresql://blog:blog123@localhost:5432/my_blog
REDIS_URL=redis://localhost:6379
PORT=7001
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=本地开发密钥
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=my-blog
S3_ACCESS_KEY=MinIO账号
S3_SECRET_KEY=MinIO密码
```

### Docker Compose：根目录 `.env`

生产或 Compose 启动时，主要由根目录 `.env` 向容器注入配置：

```ini
APP_PORT=8080
ADMIN_USERNAME=生产管理员账号
ADMIN_PASSWORD=生产管理员密码
JWT_SECRET=生产随机密钥
CORS_ORIGIN=https://你的域名
MINIO_ROOT_USER=MinIO根账号
MINIO_ROOT_PASSWORD=MinIO根密码
```

Compose 内部使用服务名连接数据库和 Redis：

```text
PostgreSQL: postgresql://blog:blog123@postgres:5432/my_blog
Redis:      redis://redis:6379
```

生产环境必须配置安全的管理员密码、JWT 密钥和 MinIO 凭证。管理员环境变量只在 `User` 表为空时用于创建账号，不会自动修改已有账号密码。

### 前端：`apps/web/.env`

前端 API 默认使用同源地址：

```ini
VITE_API_BASE=/api
```

通常不需要额外配置。只有需要追加 CSP 跨域来源时，才配置 `VITE_CSP_CONNECT_SRC` 或 `VITE_CSP_IMG_SRC`，具体见 `apps/web/.env.example`。

## 常用命令

```bash
pnpm dev                 # 同时启动前端和后端
pnpm dev:web             # 仅启动前端
pnpm dev:server          # 仅启动后端
pnpm db:up               # 启动 PostgreSQL、Redis、MinIO
pnpm db:down             # 停止并删除 Compose 容器，不主动删除数据卷
pnpm db:push             # 本地根据 Prisma Schema 同步数据库
pnpm db:seed             # 写入本地示例数据
pnpm typecheck           # 全仓类型检查
pnpm build               # 构建全部应用
pnpm docker:up           # 本地构建并启动单镜像 Compose
```

本地开发可使用 `db:push`；生产发布使用容器启动时执行的 `prisma migrate deploy`，不要用 `db:push` 替代生产迁移。

## 生产部署

生产部署、环境变量、健康检查、验收、故障处理和回滚步骤见：

- [本地开发说明](docs/本地开发说明.md)
- [上线说明文档](docs/上线说明文档.md)
- [业务操作链路](docs/业务操作链路.md)
- [目录结构与模块约定](docs/目录结构与模块约定.md)

生产部署入口是服务器上的一键脚本：

```bash
cp .env.production.example .env.production
# 编辑生产密钥、域名和端口
chmod +x scripts/*.sh
./scripts/deploy.sh
```

脚本会自动拉取当前部署分支、构建 `server`/`nginx` 镜像、等待 PostgreSQL/Redis/MinIO、执行 `prisma migrate deploy`、启动服务并请求健康接口。生产环境不要直接使用本地 `docker-compose.yml`。

生产 Compose 中 Nginx 对外提供容器 `80` 端口：

```text
/api/      → server:7001
/uploads/  → MinIO my-blog/uploads/
其他路径   → 前端 index.html（支持 SPA 直链刷新）
```

手动查看状态和日志：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
./scripts/health-check.sh
```

## 目录结构

```text
My_Blog/
├── apps/
│   ├── web/                         # React 前台和后台，同一应用内路由
│   │   └── src/
│   │       ├── blog/                # 前台页面、组件、布局和路由
│   │       ├── admin/               # 后台页面、组件、布局和路由
│   │       ├── components/common/   # 跨域通用组件
│   │       ├── router/              # 聚合前台和后台路由
│   │       ├── services/            # Axios 请求和外部 API
│   │       ├── store/               # Zustand 状态
│   │       ├── i18n/                # 中文/英文文案
│   │       └── styles/              # 全局样式和主题变量
│   └── server/                      # NestJS 后端
│       ├── prisma/                  # schema、migrations、seed
│       └── src/
│           ├── common/              # 配置、鉴权、限流、审计、拦截器等
│           └── modules/             # auth、article、upload、view-count 等业务模块
├── packages/shared/                 # 前后端共享类型
├── docker/                          # 本地/生产 Nginx 配置
├── Dockerfile                       # 本地单镜像构建文件
├── Dockerfile.prod                  # 生产 server/nginx 多 target 构建文件
├── docker-compose.yml               # 本地开发编排
├── docker-compose.prod.yml          # 生产多服务编排
├── scripts/deploy.sh                # 服务器拉取、构建、迁移、启动和验收
└── docs/                            # 项目约定和上线说明
```

更多目录和模块约定见：[docs/目录结构与模块约定.md](docs/目录结构与模块约定.md)。

## 浏览量设计

- 文章详情请求触发 `INCR counter:article:{id}`，键首次缺失时使用数据库的 `viewCount` 初始化；
- `dedup:article:{id}:{ip}` 使用 `SETNX EX 60` 实现同一 IP 60 秒去重；
- 文章列表使用 Redis pipeline 批量读取实时浏览量；
- `@Cron` 每 5 分钟把 Redis 计数写回 PostgreSQL，进程退出时再尝试刷库；
- Redis 暂时不可用时，文章读取和浏览量读取会降级到数据库，限流接口则按 fail closed 处理。
