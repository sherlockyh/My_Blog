#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.prod.yml}

if [ ! -f "$ENV_FILE" ]; then
  echo "缺少 $ENV_FILE，请先复制 .env.production.example 并填写配置。" >&2
  exit 1
fi

set -a
. "$ENV_FILE"
set +a

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

APP_PORT=${APP_PORT:-8080}
BASE_URL="http://127.0.0.1:${APP_PORT}"

check_url() {
  name="$1"
  url="$2"
  if curl --fail --silent --show-error --max-time 10 "$url" >/dev/null; then
    echo "[ok] $name: $url"
  else
    echo "[fail] $name: $url" >&2
    return 1
  fi
}

check_url 'Nginx' "$BASE_URL/healthz"
check_url 'NestJS live' "$BASE_URL/api/health/live"
check_url 'Application ready' "$BASE_URL/api/health/ready"

echo '健康检查通过。'
