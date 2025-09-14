import base64
import json
from typing import Any, Dict

from fastapi import Request


def _decode_jwt_no_verify(token: str) -> Dict[str, Any]:
    """Best-effort decode of JWT payload without verification (for logging only)."""
    try:
        parts = token.split(".")
        if len(parts) < 2:
            return {}
        payload_b64 = parts[1] + "==="  # pad
        payload = base64.urlsafe_b64decode(payload_b64.encode("utf-8")).decode("utf-8")
        return json.loads(payload)
    except Exception:
        return {}


def get_request_context(request: Request = None) -> Dict[str, Any]:
    """
    Returns a small context dict for security logging. If a Request is provided,
    attempt to extract subject/roles/groups from Authorization header; otherwise return empty.
    """
    ctx: Dict[str, Any] = {}
    try:
        if request:
            auth = request.headers.get("authorization") or request.headers.get("Authorization")
            if auth and auth.lower().startswith("bearer "):
                token = auth.split(" ", 1)[1]
                payload = _decode_jwt_no_verify(token)
                ctx["sub"] = payload.get("sub")
                # realm and client roles, if present
                roles = []
                roles += payload.get("realm_access", {}).get("roles", []) or []
                # collect all client roles
                ra = payload.get("resource_access", {}) or {}
                for _, v in ra.items():
                    roles += v.get("roles", []) or []
                ctx["roles"] = roles
                ctx["groups"] = payload.get("groups", []) or []
    except Exception:
        pass
    return ctx

