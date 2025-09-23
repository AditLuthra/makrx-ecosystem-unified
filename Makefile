# MakrX Ecosystem Makefile
# Common developer tasks for the monorepo

.PHONY: help setup install test lint format clean

help:
	@echo "Available targets:"
	@echo "  setup     Install all dependencies (Node, Python, etc.)"
	@echo "  install   Alias for setup"
	@echo "  test      Run all tests (Node + Python)"
	@echo "  lint      Run all linters (Node + Python)"
	@echo "  format    Run all code formatters (Node + Python)"
	@echo "  clean     Remove build artifacts and caches"

setup install:
	@echo "Installing Node dependencies..."
	npm install
	@echo "Installing Python dependencies..."
	pip install -r backends/makrcave/requirements.txt || true
	pip install -r backends/makrcave/requirements-dev.txt || true
	pip install -r backends/makrx_store/requirements.txt || true
	pip install -r backends/makrx_events/requirements.txt || true

# Run all tests

test:
	npm run test || true
	cd backends/makrcave && pytest || true
	cd backends/makrx_store && pytest || true
	cd backends/makrx_events && pytest || true

# Run all linters

lint:
	npm run lint || true
	flake8 backends/makrcave || true
	flake8 backends/makrx_store || true
	flake8 backends/makrx_events || true

# Format code

format:
	npm run format || true
	black backends/makrcave || true
	black backends/makrx_store || true
	black backends/makrx_events || true

# Clean build artifacts

clean:
	rm -rf node_modules/ **/__pycache__/ **/.pytest_cache/ **/.mypy_cache/ **/.next/ **/dist/ **/build/ || true
