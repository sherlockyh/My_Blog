#!/bin/sh
set -e

# nginx 后台运行：托管前端静态文件并反代 /api 到本容器内的后端进程。
nginx

cd /app/server

# 幂等应用数据库迁移：首次启动建表 + pg_trgm 索引，后续启动跳过已应用的记录。
./node_modules/.bin/prisma migrate deploy

# 后端作为容器主进程前台运行。
exec node dist/main.js
