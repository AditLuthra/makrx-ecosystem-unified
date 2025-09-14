#!/bin/bash

# Simple script to run the MakrX Store backend individually

echo "🛒 Starting MakrX Store Backend"
echo "==============================="

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3.12 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://makrx:makrx_dev_password@localhost:5433/makrx_ecosystem"
export KEYCLOAK_URL="http://localhost:8081"
export KEYCLOAK_REALM="makrx"
export KEYCLOAK_CLIENT_ID="makrx-store"
export PORT="8000"

# Start the server
echo "Starting server on port 8000..."
python main.py