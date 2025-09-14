#!/usr/bin/env python3
"""
Simplified MakrCave backend for testing
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import os

# Create FastAPI app
app = FastAPI(
    title="MakrCave API - Simple",
    description="Simplified MakrCave backend for testing",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "makrcave-backend",
        "timestamp": time.time(),
        "version": "1.0.0-simple",
    }


@app.get("/api/health")
async def api_health_check():
    return {
        "status": "healthy",
        "service": "makrcave-api",
        "timestamp": time.time(),
    }


@app.get("/api/equipment")
async def get_equipment():
    return {
        "equipment": [
            {
                "id": "eq-001",
                "name": "3D Printer - Prusa i3",
                "status": "available",
                "location": "Workshop A",
            }
        ]
    }


@app.get("/api/projects")
async def get_projects():
    return {
        "projects": [
            {
                "id": "proj-001",
                "name": "IoT Sensor Project",
                "status": "active",
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main_simple:app", host="0.0.0.0", port=port, reload=False)
