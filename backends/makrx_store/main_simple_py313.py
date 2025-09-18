"""
Simple FastAPI backend compatible with Python 3.13
Minimal setup to get the ecosystem working
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from typing import Dict, Any

# Create FastAPI app
app = FastAPI(
    title="MakrX Backend",
    description="Simple backend for MakrX ecosystem",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "MakrX Backend",
        "version": "1.0.0",
        "status": "running",
        "python_version": "3.13",
        "compatibility_mode": True,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2025-01-04T12:00:00Z",
        "database": "simulated",
        "cache": "simulated",
    }


@app.get("/api/products")
async def get_products():
    """Mock products endpoint"""
    return {
        "products": [
            {
                "id": 1,
                "name": "Sample Product",
                "price": 99.99,
                "description": "This is a sample product",
            }
        ],
        "total": 1,
        "page": 1,
        "per_page": 10,
    }


@app.get("/api/categories")
async def get_categories():
    """Mock categories endpoint"""
    return [{"id": 1, "name": "Electronics", "slug": "electronics"}]


@app.post("/api/cart/items")
async def add_to_cart():
    """Mock add to cart endpoint"""
    return {"message": "Item added to cart"}


@app.get("/api/cart")
async def get_cart():
    """Mock cart endpoint"""
    return {"id": "cart-1", "items": [], "total": 0, "currency": "USD"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        "main_simple_py313:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info",
    )
