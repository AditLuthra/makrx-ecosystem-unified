
import secrets
import os
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration for MakrCave backend (unified)."""

    # Store integration
    STORE_API_URL: str = Field("http://localhost:8000", description="Store backend URL")
    # In production, STORE_API_KEY must be set via env var. No default allowed.
    STORE_API_KEY: str = Field(
        default=None,
        description="Service-to-service auth key (REQUIRED in production)",
    )
    SERVICE_JWT: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        description="JWT for service auth",
    )

    # Service job processing
    AUTO_ASSIGN_JOBS: bool = True
    DEFAULT_JOB_PRIORITY: str = "normal"
    JOB_TIMEOUT_HOURS: int = 72

    class Config:
        env_file = ".env"
        case_sensitive = True

    # validate_secrets is now replaced by validate_all

    ENVIRONMENT: str = Field(
        default_factory=lambda: os.getenv("ENVIRONMENT", "development"),
        description="App environment",
    )
    CORS_ORIGINS: Optional[str] = Field(
        default_factory=lambda: os.getenv("CORS_ORIGINS", ""),
        description="Comma-separated CORS origins",
    )
    DATABASE_URL: Optional[str] = Field(
        default_factory=lambda: os.getenv("DATABASE_URL"),
        description="Database URL",
    )

    # Add any other required secrets here
    RAZORPAY_KEY_ID: Optional[str] = Field(
        default_factory=lambda: os.getenv("RAZORPAY_KEY_ID")
    )
    RAZORPAY_KEY_SECRET: Optional[str] = Field(
        default_factory=lambda: os.getenv("RAZORPAY_KEY_SECRET")
    )
    STRIPE_SECRET_KEY: Optional[str] = Field(
        default_factory=lambda: os.getenv("STRIPE_SECRET_KEY")
    )
    STRIPE_PUBLISHABLE_KEY: Optional[str] = Field(
        default_factory=lambda: os.getenv("STRIPE_PUBLISHABLE_KEY")
    )
    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(
        default_factory=lambda: os.getenv("STRIPE_WEBHOOK_SECRET")
    )
    KEYCLOAK_URL: Optional[str] = Field(
        default_factory=lambda: os.getenv("KEYCLOAK_URL")
    )
    KEYCLOAK_REALM: Optional[str] = Field(
        default_factory=lambda: os.getenv("KEYCLOAK_REALM")
    )
    KEYCLOAK_CLIENT_ID: Optional[str] = Field(
        default_factory=lambda: os.getenv("KEYCLOAK_CLIENT_ID")
    )

    def validate_all(self):
        import structlog
        log = structlog.get_logger(__name__)
        # Fail fast if secrets are not set in production
        missing = []
        required_secrets = [
            "STORE_API_KEY",
            "RAZORPAY_KEY_ID",
            "RAZORPAY_KEY_SECRET",
            "STRIPE_SECRET_KEY",
            "STRIPE_PUBLISHABLE_KEY",
            "STRIPE_WEBHOOK_SECRET",
            "DATABASE_URL",
            "KEYCLOAK_URL",
            "KEYCLOAK_REALM",
            "KEYCLOAK_CLIENT_ID",
        ]
        for k in required_secrets:
            if getattr(self, k, None) in (None, ""):
                missing.append(k)
        if missing and self.ENVIRONMENT == "production":
            raise RuntimeError(
                f"Missing required secrets in production: {', '.join(missing)}"
            )
        elif missing:
            log.warning("Missing secrets (not production)", missing=missing)

        # CORS safety: warn if any localhost/127.0.0.1 in production
        cors = self.CORS_ORIGINS or ""
        if self.ENVIRONMENT == "production" and (
            "localhost" in cors or "127.0.0.1" in cors
        ):
            log.warning(
                "Unsafe CORS_ORIGINS includes localhost/127.0.0.1 in production!"
            )

        # DB URL safety: warn if using dev/test DB in production
        db_url = self.DATABASE_URL or ""
        if self.ENVIRONMENT == "production" and (
            "localhost" in db_url or "dev_password" in db_url
        ):
            log.warning(
                "DATABASE_URL appears unsafe for production!"
            )


settings = Settings()
settings.validate_all()

