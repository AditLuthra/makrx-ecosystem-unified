#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/start-backend.sh <backend_dir> <app_module> <port>
# Example: scripts/start-backend.sh backends/makrcave backends.makrcave.main:app 8001

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <backend_dir> <app_module> <port>"
  exit 1
fi

BACKEND_DIR="$1"
APP_MODULE="$2"
PORT="$3"

# Resolve repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Ensure venv exists
if [[ ! -d "$BACKEND_DIR/venv" ]]; then
  echo "No venv found in $BACKEND_DIR. Creating..."
  python3 -m venv "$BACKEND_DIR/venv"
fi

# Install requirements if present
if [[ -f "$BACKEND_DIR/requirements.txt" ]]; then
  echo "Installing requirements for $BACKEND_DIR..."
  PYTHONPATH="$REPO_ROOT" "$BACKEND_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

# Run the backend with uvicorn using repo as PYTHONPATH
echo "Starting $APP_MODULE on port $PORT..."
exec env PYTHONPATH="$REPO_ROOT" "$BACKEND_DIR/venv/bin/python" -m uvicorn "$APP_MODULE" --host 0.0.0.0 --port "$PORT" --reload
