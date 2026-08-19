#!/usr/bin/env bash
# Run from the repo root on the server (e.g. /opt/ybuddy) after a git pull.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env (copy .env.prod.example -> .env and fill it in first)" >&2
  exit 1
fi
if [ ! -f backend/.env ]; then
  echo "Missing backend/.env (copy backend/.env.prod.example -> backend/.env and fill it in first)" >&2
  exit 1
fi

echo "==> Building and starting containers"
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Status"
docker compose -f docker-compose.prod.yml ps
