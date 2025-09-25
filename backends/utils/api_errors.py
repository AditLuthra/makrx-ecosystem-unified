"""Common helpers for building API error payloads."""

from typing import Dict


def error_detail(code: str, message: str) -> Dict[str, str]:
    """Return a standardised error payload with machine-readable code."""

    return {"code": code, "message": message}

