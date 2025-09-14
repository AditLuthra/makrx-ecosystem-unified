#!/usr/bin/env bash
set -euo pipefail

# CI migration helper for makrx-store backend
# Usage: DATABASE_URL=postgresql://... ./scripts/ci_migrate.sh

cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL not set" >&2
  exit 1
fi

python3.12 -m venv .venv >/dev/null 2>&1 || true
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "Running Alembic migrations..."
alembic -c alembic.ini upgrade head

echo "Migrations complete. Performing a simple connectivity check..."
python - <<'PY'
import os
from sqlalchemy import create_engine

url = os.environ['DATABASE_URL']
url = url.replace('+asyncpg', '') if '+asyncpg' in url else url
engine = create_engine(url, pool_pre_ping=True)
with engine.connect() as conn:
    conn.execute("SELECT 1")
print("✅ DB connectivity OK")
PY

echo "✅ CI DB migration step finished"

