"""
Core configuration settings for MakrX Store API
Uses Pydantic BaseSettings for environment variable management
"""

import secrets
from typing import List, Optional

import asyncpg  # noqa: F401 - ensure asyncpg is installed
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class Settings(BaseSettings):
    """Application settings with environment variable support"""

    # Basic app settings
    APP_NAME: str = "MakrX Store API"
    ENVIRONMENT: str = Field("development", pattern="^(development|staging|production)$")
    DEBUG: bool = Field(False, description="Enable debug mode")
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))

    # CORS and security
    ALLOWED_ORIGINS: List[str] = [
        "https://makrx.org",
        "https://makrcave.com",
        "https://makrx.store",
    ]
    ALLOWED_HOSTS: List[str] = [
        "localhost",
        "127.0.0.1",
        "makrx.store",
        "*.makrx.store",
    ]

    # Database
    DATABASE_URL: str = Field(
        "postgresql+asyncpg://makrx:makrx@localhost:5432/makrx_store_dev",
        description="PostgreSQL database URL",
    )
    DB_ECHO: bool = Field(False, description="Enable SQLAlchemy query logging")
    DB_POOL_SIZE: int = Field(10, description="SQLAlchemy connection pool size")
    DB_MAX_OVERFLOW: int = Field(20, description="SQLAlchemy pool max overflow")
    DB_POOL_TIMEOUT: int = Field(30, description="Pool checkout timeout (seconds)")
    DB_POOL_RECYCLE: int = Field(1800, description="Recycle connections after N seconds")

    # Redis
    REDIS_URL: str = Field(
        "redis://localhost:6379/0",
        description="Redis URL for caching and rate limiting",
    )

    # Authentication (Keycloak)
    KEYCLOAK_URL: str = Field(
        "http://localhost:8081", description="Keycloak base URL"
    )
    KEYCLOAK_ISSUER: str = Field(
        "https://auth.makrx.org/realms/makrx", description="Keycloak realm issuer URL"
    )
    KEYCLOAK_CLIENT_ID: str = Field(
        "makrx-store", description="Client ID/audience for token validation"
    )
    KEYCLOAK_REALM: str = Field("makrx", description="Keycloak realm name")
    KEYCLOAK_CLIENT_SECRET: Optional[str] = Field(None, description="Keycloak client secret")
    KEYCLOAK_JWKS_URL: Optional[str] = None
    # Audience for service-to-service tokens (Store ↔ Cave, etc.)
    SERVICE_AUDIENCE: str = Field(
        default="makrx-services",
        description="Audience for service-to-service JWTs. Set to KEYCLOAK_CLIENT_ID if services share a client, or a dedicated audience if using separate service accounts."
    )

    # S3/MinIO Storage
    S3_ENDPOINT: str = Field(
        "http://localhost:9000", description="S3 or MinIO endpoint URL"
    )
    S3_BUCKET: str = Field("makrx-uploads", description="S3 bucket name")
    S3_BASE_URL: Optional[str] = Field(None, description="Base URL for public object access")
    S3_ACCESS_KEY: Optional[str] = Field(None, description="S3 access key")
    S3_SECRET_KEY: Optional[str] = Field(None, description="S3 secret key")
    S3_REGION: str = Field("us-east-1", description="S3 region")
    S3_USE_SSL: bool = Field(True, description="Use SSL for S3 connections")

    # Payments
    STRIPE_SECRET_KEY: Optional[str] = Field(None, description="Stripe secret key")
    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(
        None, description="Stripe webhook secret"
    )
    STRIPE_PUBLIC_KEY: Optional[str] = Field(None, description="Stripe publishable key")

    RAZORPAY_KEY_ID: Optional[str] = Field(None, description="Razorpay key ID")
    RAZORPAY_KEY_SECRET: Optional[str] = Field(None, description="Razorpay key secret")
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = Field(
        None, description="Razorpay webhook secret"
    )

    # MakrCave Integration
    SERVICE_MAKRCAVE_URL: str = Field(
        "http://localhost:8001", description="MakrCave backend service URL"
    )
    MAKRCAVE_API_URL: str = Field(
        "http://localhost:8001", description="MakrCave API URL for bridge calls"
    )
    SERVICE_JWT: Optional[str] = Field(None, description="Service-to-service JWT for Cave bridge")
    CAVE_WEBHOOK_SECRET: Optional[str] = Field(None, description="HMAC secret for verifying Cave webhooks")
    MAKRCAVE_API_KEY: Optional[str] = Field(None, description="API key for MakrCave API (outbound/inbound)")

    # Pricing Configuration
    PRICE_SETUP_FEE: float = Field(50.0, description="Base setup fee for services")
    RATE_PLA_PER_CM3: float = Field(0.15, description="PLA material rate per cm³")
    RATE_ABS_PER_CM3: float = Field(0.18, description="ABS material rate per cm³")
    RATE_PETG_PER_CM3: float = Field(0.20, description="PETG material rate per cm³")
    RATE_RESIN_PER_CM3: float = Field(0.35, description="Resin material rate per cm³")

    # File Upload Limits
    MAX_UPLOAD_SIZE: int = Field(
        100 * 1024 * 1024, description="Max file size in bytes (100MB)"
    )
    ALLOWED_UPLOAD_EXTENSIONS: List[str] = [".stl", ".obj", ".3mf", ".step", ".stp"]

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(100, description="Requests per window")
    RATE_LIMIT_WINDOW: int = Field(3600, description="Rate limit window in seconds")

    # Email Configuration (for notifications)
    SMTP_HOST: Optional[str] = Field(None, description="SMTP server host")
    SMTP_PORT: int = Field(587, description="SMTP server port")
    SMTP_USERNAME: Optional[str] = Field(None, description="SMTP username")
    SMTP_PASSWORD: Optional[str] = Field(None, description="SMTP password")
    SMTP_USE_TLS: bool = Field(True, description="Use TLS for SMTP")

    # Logging
    LOG_LEVEL: str = Field("INFO", pattern="^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$")

    # Metrics protection
    METRICS_TOKEN: Optional[str] = Field(None, description="Optional token to protect /metrics in production")

    # Celery (for future async tasks)
    CELERY_BROKER: str = Field(
        "redis://localhost:6379/1", description="Celery broker URL"
    )
    CELERY_BACKEND: str = Field(
        "redis://localhost:6379/1", description="Celery result backend URL"
    )

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'
    )

    def model_post_init(self, __context: dict) -> None:  # pydantic v2 hook
        # Derive issuer from URL + realm if not explicitly set via env
        if 'KEYCLOAK_ISSUER' not in os.environ or not self.KEYCLOAK_ISSUER:
            self.KEYCLOAK_ISSUER = f"{self.KEYCLOAK_URL}/realms/{self.KEYCLOAK_REALM}"


# Global settings instance
settings = Settings()

# Material pricing configuration
MATERIAL_RATES = {
    "pla": settings.RATE_PLA_PER_CM3,
    "pla+": settings.RATE_PLA_PER_CM3 * 1.2,
    "abs": settings.RATE_ABS_PER_CM3,
    "petg": settings.RATE_PETG_PER_CM3,
    "tpu": settings.RATE_PETG_PER_CM3 * 1.5,
    "resin": settings.RATE_RESIN_PER_CM3,
    "resin_tough": settings.RATE_RESIN_PER_CM3 * 1.3,
    "wood": settings.RATE_PLA_PER_CM3 * 2.0,
    "metal": settings.RATE_PLA_PER_CM3 * 3.0,
}

# Material densities (g/cm³)
MATERIAL_DENSITIES = {
    "pla": 1.24,
    "pla+": 1.24,
    "abs": 1.04,
    "petg": 1.27,
    "tpu": 1.20,
    "resin": 1.15,
    "resin_tough": 1.15,
    "wood": 1.28,
    "metal": 1.75,
}

# Quality multipliers for print time
QUALITY_MULTIPLIERS = {
    "draft": 0.7,
    "standard": 1.0,
    "high": 1.4,
    "ultra": 2.0,
}
