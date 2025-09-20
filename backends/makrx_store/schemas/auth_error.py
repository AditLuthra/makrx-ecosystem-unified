from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field
from pydantic import field_serializer


class AuthError(BaseModel):
    """Standard authentication error response envelope."""

    error: str
    message: str
    code: str
    request_id: Optional[str] = None
    # Use timezone-aware UTC now and serialize to ISO string for JSON safety
    ts: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_serializer("ts")
    def serialize_ts(self, ts: datetime) -> str:  # pragma: no cover - simple serializer
        # Serialize datetime to ISO 8601 string to avoid JSON encoding errors
        return ts.isoformat()
