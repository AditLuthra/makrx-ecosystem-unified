#!/usr/bin/env sh
set -e

PORT="${PORT:-8001}"
WORKERS="${WORKERS:-2}"
USE_GUNICORN="${USE_GUNICORN:-false}"

echo "Running Alembic migrations..."
alembic upgrade head

if [ "$USE_GUNICORN" = "true" ] || [ "$USE_GUNICORN" = "1" ]; then
	echo "Starting with gunicorn ($WORKERS workers) on port $PORT"
	exec gunicorn main:app \
		--workers "$WORKERS" \
		--worker-class uvicorn.workers.UvicornWorker \
		--bind 0.0.0.0:"$PORT" \
		--access-logfile - \
		--error-logfile -
else
	echo "Starting with uvicorn on port $PORT"
	exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
fi
