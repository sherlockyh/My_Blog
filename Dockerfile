# ---------- 构建阶段：安装依赖并构建 shared / server / web ----------
FROM node:20-alpine AS builder

WORKDIR /app
# prisma 的 engine 二进制依赖 openssl，alpine 基础镜像默认不带。
RUN apk add --no-cache openssl && corepack enable

# 先只拷 workspace 配置和各包 package.json，最大化依赖安装层缓存。
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

COPY . .
# turbo 保证构建顺序 shared → server（含 prisma generate）→ web。
RUN pnpm build \
  # deploy 产出 /app/deployed：server + workspace 依赖 shared 的独立生产 node_modules 目录。
  && pnpm --filter @my-blog/server deploy --prod /app/deployed \
  # deploy 只按 lockfile 装生产依赖，不带 prisma generate 的注入产物，必须在部署目录内重新生成 client。
  && cd /app/deployed && npx prisma generate

# ---------- 运行阶段：nginx（前端静态 + 反代）与后端 Node 合一的单镜像 ----------
FROM node:20-alpine AS runner

RUN apk add --no-cache nginx tzdata openssl
ENV TZ=Asia/Shanghai NODE_ENV=production

# alpine nginx 默认 include /etc/nginx/http.d/*.conf。
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
# deployed 目录自带 dist、prisma(schema+migrations)、生产 node_modules 和生成的 client。
COPY --from=builder /app/deployed /app/server

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
# 探针打后端进程：nginx 起来但 Node 未就绪时容器应视为不健康。
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=10 \
  CMD wget -q --spider http://127.0.0.1:7001/api/health/live || exit 1

ENTRYPOINT ["/entrypoint.sh"]
