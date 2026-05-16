#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ivanzagulin/legkaya-himiya}"
WEB_DIR="${WEB_DIR:-/var/www/legkaya-himiya}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$APP_DIR/.env" ]]; then
  echo "Missing $APP_DIR/.env; keep the production environment file on the server." >&2
  exit 1
fi

rsync -a --delete \
  --exclude ".env" \
  "$REPO_DIR/backend/" "$APP_DIR/backend/"

install -m 0644 "$REPO_DIR/docker-compose.yml" "$APP_DIR/docker-compose.yml"

rsync -a --delete \
  --exclude "admin/index.html.bak*" \
  "$REPO_DIR/frontend/" "$WEB_DIR/"

cd "$APP_DIR"
docker compose up -d --build backend

echo "Deploy complete"
