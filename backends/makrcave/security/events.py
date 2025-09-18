"""Lightweight security event helpers.

These keep the legacy log calls working while we modernize the import paths.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict

import structlog

log = structlog.get_logger(__name__)


class SecurityEventType(str, Enum):
    ROLE_GRANT = "role_grant"
    ROLE_REVOKE = "role_revoke"
    ADMIN_OVERRIDE = "admin_override"


def log_security_event(
    event_type: SecurityEventType,
    *,
    user_id: str,
    details: Dict[str, Any] | None = None,
) -> None:
    """Emit a structured security event for auditing purposes."""

    log.bind(event_type=event_type.value, user_id=user_id).info(
        "security_event", details=details or {}
    )
