#!/usr/bin/env python3
"""
Simplified Store backend for testing
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import os

# Create FastAPI app
app = FastAPI(
    title="MakrX Store API - Simple",
    description="Simplified Store backend for testing", 
    version="1.0.0"
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
        "service": "makrx-store-backend",
        "timestamp": time.time(),
        "version": "1.0.0-simple"
    }

@app.get("/api/products")
async def get_products():
    return {
        "products": [
            {
                "id": 1,
                "name": "3D Printing Filament PLA",
                "price": 25.99,
                "in_stock": True
            },
            {
                "id": 2,
                "name": "Arduino Uno R3",
                "price": 22.50,
                "in_stock": True
            }
        ]
    }

@app.get("/api/categories")
async def get_categories():
    return {
        "categories": [
            {"id": 1, "name": "3D Printing", "slug": "3d-printing"},
            {"id": 2, "name": "Electronics", "slug": "electronics"}
        ]
    }

@app.get("/api/cart")
async def get_cart():
    return {
        "items": [],
        "total": 0
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main_simple:app", host="0.0.0.0", port=port, reload=False)