"""
Configuration settings for MakrX Services Backend
"""

import os
from functools import lru_cache
from pydantic import BaseSettings


class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "MakrX Services API"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://makrx_services:password@localhost/makrx_services",
    )
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/2")
    
    # Cross-platform integration
    STORE_API_URL: str = os.getenv(
        "STORE_API_URL",
        "http://localhost:8004/api",
    )
    SERVICES_API_URL: str = os.getenv(
        "SERVICES_API_URL",
        "http://localhost:8006/api",
    )
    
    # File storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "104857600"))  # 100MB
    ALLOWED_FILE_TYPES: list = [".stl", ".obj", ".3mf", ".svg", ".dxf", ".ai"]
    
    # S3/MinIO Configuration
    # Support multiple env naming styles (AWS_*, S3_*, MINIO_*) with
    # sensible fallbacks.
    # Canonical fields (prefer S3_*/AWS_*, fall back to MINIO_* where
    # applicable)
    S3_ENDPOINT: str = os.getenv(
        "S3_ENDPOINT",
        os.getenv("MINIO_ENDPOINT", "http://localhost:9000"),
    )
    S3_BUCKET_NAME: str = os.getenv(
        "S3_BUCKET_NAME",
        os.getenv("MINIO_BUCKET", "makrx-services-files"),
    )
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv(
        "AWS_ACCESS_KEY_ID",
        os.getenv(
            "S3_ACCESS_KEY",
            os.getenv("MINIO_ACCESS_KEY", ""),
        ),
    )
    AWS_SECRET_ACCESS_KEY: str = os.getenv(
        "AWS_SECRET_ACCESS_KEY",
        os.getenv(
            "S3_SECRET_KEY",
            os.getenv("MINIO_SECRET_KEY", ""),
        ),
    )

    # Back-compat MINIO_* fields (mirror the effective S3/AWS values
    # where not explicitly set)
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", S3_ENDPOINT)
    MINIO_ACCESS_KEY: str = os.getenv(
        "MINIO_ACCESS_KEY",
        AWS_ACCESS_KEY_ID or os.getenv("S3_ACCESS_KEY", "minioadmin"),
    )
    MINIO_SECRET_KEY: str = os.getenv(
        "MINIO_SECRET_KEY",
        AWS_SECRET_ACCESS_KEY
        or os.getenv("S3_SECRET_KEY", "minioadmin"),
    )
    MINIO_BUCKET: str = os.getenv(
        "MINIO_BUCKET", S3_BUCKET_NAME or "makrx-services"
    )
    
    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "your-secret-key-here-change-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Keycloak
    KEYCLOAK_URL: str = os.getenv("KEYCLOAK_URL", "http://localhost:8081")
    KEYCLOAK_REALM: str = os.getenv("KEYCLOAK_REALM", "makrx")
    KEYCLOAK_CLIENT_ID: str = os.getenv("KEYCLOAK_CLIENT_ID", "makrx-services")
    
    # Job processing
    JOB_DISPATCH_INTERVAL: int = int(
        os.getenv("JOB_DISPATCH_INTERVAL", "30")
    )  # seconds
    MAX_PROVIDER_NOTIFICATIONS: int = int(
        os.getenv("MAX_PROVIDER_NOTIFICATIONS", "5")
    )
    
    # Pricing defaults
    DEFAULT_3D_PRINT_PRICE_PER_KG: float = 150.0
    DEFAULT_LASER_ENGRAVE_PRICE_PER_CM2: float = 50.0
    DEFAULT_SETUP_FEE_3D: float = 100.0
    DEFAULT_SETUP_FEE_LASER: float = 50.0
    RUSH_ORDER_MULTIPLIER: float = 1.5
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
