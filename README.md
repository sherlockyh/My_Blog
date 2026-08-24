# My Blog · Code with Joy

个人博客 + 后台管理系统。React 前端 + NestJS 后端，pnpm monorepo。

## 技术栈

| 层                     | 技术                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| 前端 `apps/web`        | Vite 5 + React 18 + TypeScript + Ant Design 5 + react-router-dom 6 + zustand + react-i18next + react-markdown |
| 后端 `apps/server`     | NestJS 10 + Prisma 5 + PostgreSQL + Redis(ioredis) + JWT + @nestjs/schedule                                   |
| 共享 `packages/shared` | 前后端共享 TS 类型（DTO / 枚举）                                                                              |
| 基建                   | pnpm workspace + Turborepo + docker-compose（PostgreSQL 16 / Redis 7）                                        |

## 功能

- 前台：首页（Hero / 6 个技能入口 / 推荐文章 / 最新文章 + 关于我 + 热门标签）、文章列表（搜索 + 标签过滤 + 分页 + 侧栏）、Markdown 文章详情、归档、分类、标签、关于我、项目作品、资源分享、留言板
- 后台：独立 `/admin` 管理区，只承担内容编辑、配置和数据管理；公开博客页面只负责展示和阅读
- 深色模式：一键切换，CSS 变量 + antd darkAlgorithm 双轨适配
- 中英双语：界面文案 i18next，内容字段 `*Zh/*En` 成对存储，EN 为空自动回退中文
- 天气胶囊：open-meteo 免费接口（免 key）
- 后台：登录（JWT）、仪表盘统计、文章/项目/资源/留言管理、首页配置（Hero + 4 张特色卡片 + 天气城市）、个人信息（头像 + 社交链接）
- 浏览量：Redis 计数（60s 同 IP 防刷），每 5 分钟 + 进程退出时写回 PostgreSQL

## 快速开始

前置要求：Node >= 20、pnpm 9+、Docker。

```bash
# 1. 安装依赖
pnpm install

# 2. 启动 PostgreSQL + Redis
pnpm db:up

# 3. 初始化数据库表结构 + 种子数据（含管理员账号）
pnpm db:push
pnpm db:seed

# 4. 同时启动前后端（server: http://localhost:7001，web: http://localhost:5173）
pnpm dev
```

浏览器访问：

- 前台：<http://localhost:5173>
- 后台：<http://localhost:5173/admin/login>（开发环境默认账号 `admin` / `admin123`）

## 环境变量

后端配置在 `apps/server/.env`：

```ini
DATABASE_URL=postgresql://blog:blog123@localhost:5432/my_blog
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:5173
```

前端可选配置在 `apps/web/.env`：

```ini
VITE_API_BASE=/api
```

管理员账号首次启动时若 User 表为空会自动按 `ADMIN_USERNAME/ADMIN_PASSWORD` 创建。生产环境必须显式配置安全的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`，不能使用默认密码。

## 常用命令

```bash
pnpm dev            # turbo 并行启动 web + server
pnpm dev:web        # 仅前端
pnpm dev:server     # 仅后端
pnpm db:push        # prisma db push
pnpm db:seed        # 种子数据
pnpm build          # 构建全部应用
```

## 架构与性能说明

当前架构、已完成的性能优化和后续扩展建议见 [docs/architecture-performance.md](docs/architecture-performance.md)。

## 目录结构

```
My_Blog/
├── apps/
│   ├── web/                 # Vite + React 前台 & 后台（同一应用内路由）
│   │   └── src/
│   │       ├── layouts/     # PublicLayout / AdminLayout
│   │       ├── pages/       # home/about/articles/projects/resources/guestbook/admin
│   │       ├── components/  # Navbar/Footer/WeatherChip/ProjectCard 等
│   │       ├── services/    # axios 封装 + API
│   │       ├── store/       # theme / auth / site (zustand)
│   │       ├── i18n/        # zh / en
│   │       └── styles/      # CSS 变量（亮/暗双主题）
│   └── server/              # NestJS
│       ├── prisma/          # schema.prisma + seed.ts
│       └── src/modules/     # auth/article/view-count/project/resource/message/site-config/upload
├── packages/shared/         # 共享类型
└── docker-compose.yml       # postgres:16 + redis:7
```

## 浏览量设计

- 文章详情请求触发 `INCR counter:article:{id}`，键首次缺失时用 DB `viewCount` 初始化
- `dedup:article:{id}:{ip}` SETNX EX 60 实现同 IP 60 秒防刷
- 列表页用 Redis pipeline MGET 批量合并实时值
- `@Cron` 每 5 分钟把 Redis 计数整体写回 DB，进程退出时再 flush 一次
