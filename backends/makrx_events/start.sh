#!/usr/bin/env sh
set -e

PORT="${PORT:-5000}"
WORKERS="${WORKERS:-2}"
USE_GUNICORN="${USE_GUNICORN:-true}"
TIMEOUT="${TIMEOUT:-60}"
GRACEFUL_TIMEOUT="${GRACEFUL_TIMEOUT:-30}"
KEEPALIVE="${KEEPALIVE:-5}"

# Optionally run DB migrations before starting (recommended in prod)
if [ "${RUN_DB_MIGRATIONS:-false}" = "true" ] || [ "${RUN_DB_MIGRATIONS:-false}" = "1" ]; then
  echo "Running Alembic migrations..."
  # Default DATABASE_URL must be provided in environment for non-sqlite
  alembic -c alembic.ini upgrade head || {
    echo "Alembic migration failed" >&2
    exit 1
  }
fi

if [ "$USE_GUNICORN" = "true" ] || [ "$USE_GUNICORN" = "1" ]; then
  echo "Starting with gunicorn ($WORKERS workers) on port $PORT"
  exec gunicorn main:app \
    --workers "$WORKERS" \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:"$PORT" \
    --timeout "$TIMEOUT" \
    --graceful-timeout "$GRACEFUL_TIMEOUT" \
    --keep-alive "$KEEPALIVE" \
    --access-logfile - \
    --error-logfile -
else
  echo "Starting with uvicorn on port $PORT"
  exec uvicorn main:app --host 0.0.0.0 --port "$PORT" --no-access-log
fi
