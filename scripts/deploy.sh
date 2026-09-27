#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.prod.yml}
DEPLOY_REF=${1:-${DEPLOY_REF:-main}}

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy] 失败：%s\n' "$*" >&2
  exit 1
}

if [ ! -f "$ENV_FILE" ]; then
  fail "缺少 $ENV_FILE，请先执行 cp .env.production.example $ENV_FILE 并填写配置"
fi

command -v git >/dev/null 2>&1 || fail '未找到 git'
command -v docker >/dev/null 2>&1 || fail '未找到 docker'
docker compose version >/dev/null 2>&1 || fail '未找到 docker compose plugin'
command -v curl >/dev/null 2>&1 || fail '未找到 curl'

set -a
. "$ENV_FILE"
set +a

required_vars='POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB JWT_SECRET CORS_ORIGIN ADMIN_USERNAME ADMIN_PASSWORD MINIO_ROOT_USER MINIO_ROOT_PASSWORD S3_ACCESS_KEY S3_SECRET_KEY'
for variable in $required_vars; do
  eval "value=\${$variable:-}"
  [ -n "$value" ] || fail "缺少环境变量 $variable"
done

case "$JWT_SECRET $ADMIN_PASSWORD $POSTGRES_PASSWORD $MINIO_ROOT_PASSWORD" in
  *change-me*|*replace-me*|*admin123*|*blog123*)
    fail '检测到默认或模板密码，请先修改 .env.production'
    ;;
esac

current_branch=$(git branch --show-current)
[ "$current_branch" = "$DEPLOY_REF" ] || fail "当前分支为 $current_branch，期望部署分支为 $DEPLOY_REF"

git diff --quiet && git diff --cached --quiet || fail '服务器工作区存在未提交修改，拒绝自动拉取以避免覆盖本地文件'

log "拉取 origin/$DEPLOY_REF"
git fetch origin "$DEPLOY_REF"
git pull --ff-only origin "$DEPLOY_REF"

export IMAGE_TAG=$(git rev-parse --short HEAD)
log "部署版本：$IMAGE_TAG"

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

on_error() {
  status=$?
  if [ "$status" -ne 0 ]; then
    echo '[deploy] 最近容器日志：' >&2
    compose ps >&2 || true
    compose logs --tail=120 migration server nginx >&2 || true
  fi
  exit "$status"
}
trap on_error EXIT

log '校验 Compose 配置'
compose config --quiet

log '构建 server 和 nginx 镜像'
compose build --pull server nginx

log '启动 PostgreSQL、Redis、MinIO'
compose up -d postgres redis minio

wait_for_health() {
  service="$1"
  timeout_seconds=${2:-120}
  elapsed=0
  container_id=''

  while [ "$elapsed" -lt "$timeout_seconds" ]; do
    container_id=$(compose ps -q "$service" 2>/dev/null || true)
    if [ -n "$container_id" ]; then
      status=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id" 2>/dev/null || true)
      case "$status" in
        healthy|running)
          log "$service 已就绪"
          return 0
          ;;
        unhealthy|exited|dead)
          compose logs --tail=80 "$service" >&2 || true
          fail "$service 未就绪，当前状态：$status"
          ;;
      esac
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done

  compose logs --tail=80 "$service" >&2 || true
  fail "$service 等待超时"
}

wait_for_health postgres
wait_for_health redis
wait_for_health minio

log '执行数据库迁移'
compose up --force-recreate --abort-on-container-exit --exit-code-from migration migration

log '启动 server 和 nginx'
compose up -d --force-recreate server nginx
wait_for_health server
wait_for_health nginx

log '执行 HTTP 健康检查'
ENV_FILE="$ENV_FILE" COMPOSE_FILE="$COMPOSE_FILE" "$ROOT_DIR/scripts/health-check.sh"

trap - EXIT
log "部署完成：版本 $IMAGE_TAG，访问端口 ${APP_PORT:-8080}"
