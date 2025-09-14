SHELL := /bin/bash

# Configuration
PY ?= python3
PIP ?= pip3
PORT ?= 8000
VENV ?= .venv
ACTIVATE = source $(VENV)/bin/activate


.PHONY: help venv install env-check db-upgrade db-revision db-downgrade start-dev start-prod lint format typecheck migrate-ci test

help:
	@echo "Targets:"
	@echo "  venv          - Create virtualenv in $(VENV)"
	@echo "  install       - Install Python dependencies"
	@echo "  env-check     - Verify required env vars"
	@echo "  db-upgrade    - Alembic upgrade to head"
	@echo "  db-revision   - Alembic autogenerate revision (use m=message)"
	@echo "  db-downgrade  - Alembic downgrade by one revision"
	@echo "  start-dev     - Run uvicorn in reload mode"
	@echo "  start-prod    - Run gunicorn + uvicorn worker"
	@echo "  migrate-ci    - Install deps and run DB migrations (for CI/CD)"
	@echo "  lint          - Run ruff and flake8 lint checks"
	@echo "  format        - Run black code formatter"
	@echo "  typecheck     - Run mypy type checks"
	@echo "  test          - Run pytest suite"
lint:
	$(ACTIVATE) && ruff .
	$(ACTIVATE) && flake8 .

format:
	$(ACTIVATE) && black .

typecheck:
	$(ACTIVATE) && mypy .

test:
	$(ACTIVATE) && pytest

venv:
	@test -d $(VENV) || $(PY) -m venv $(VENV)

install: venv
	$(ACTIVATE) && $(PIP) install --upgrade pip
	$(ACTIVATE) && $(PIP) install -r requirements.txt

env-check:
	@if [[ -z "$$DATABASE_URL" ]]; then echo "ERROR: DATABASE_URL not set"; exit 1; fi

db-upgrade:
	$(ACTIVATE) && alembic -c alembic.ini upgrade head

db-revision:
	@if [[ -z "$(m)" ]]; then echo "Usage: make db-revision m=\"message\""; exit 1; fi
	$(ACTIVATE) && alembic -c alembic.ini revision --autogenerate -m "$(m)"

db-downgrade:
	$(ACTIVATE) && alembic -c alembic.ini downgrade -1

start-dev:
	$(ACTIVATE) && ENVIRONMENT=development uvicorn main:app --reload --host 0.0.0.0 --port $(PORT)

start-prod:
	$(ACTIVATE) && ENVIRONMENT=production gunicorn -k uvicorn.workers.UvicornWorker main:app -b 0.0.0.0:$(PORT)

migrate-ci:
	$(MAKE) install
	$(MAKE) env-check
	$(ACTIVATE) && alembic -c alembic.ini upgrade head
	@echo "✅ Migrations applied"

