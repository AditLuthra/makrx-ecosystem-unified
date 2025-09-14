from pydantic_settings import BaseSettings
from pydantic import Field
import secrets


class Settings(BaseSettings):
    """Configuration for MakrCave backend (unified)."""

    # Store integration
    STORE_API_URL: str = Field("http://localhost:8000", description="Store backend URL")
    STORE_API_KEY: str = Field(
        "cave-to-store-api-key", description="Service-to-service auth key"
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


settings = Settings()
