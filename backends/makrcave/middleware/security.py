"""
Security Middleware for MakrCave Backend
Rate limiting, security headers, and request validation
"""

import logging
import os
import random
import time
import uuid
from collections import defaultdict
from typing import Optional
import hashlib
import redis

from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from ..security.helpers import get_request_context

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware with endpoint-specific limits"""
    
    def __init__(self, app):
        super().__init__(app)
        self.clients = defaultdict(lambda: defaultdict(list))
        # Optional Redis client for distributed rate limiting
        self.redis_url = os.getenv("REDIS_URL")
        self.redis_client: Optional[redis.Redis] = None
        if self.redis_url:
            try:
                self.redis_client = redis.from_url(self.redis_url)
            except Exception:
                self.redis_client = None
        
        # Endpoint-specific rate limits (calls per hour)
        self.limits = {
            "/api/v1/auth/": {"calls": 20, "period": 3600},  # Auth endpoints
            "/api/v1/inventory/": {"calls": 200, "period": 3600},  # Inventory
            "/api/v1/equipment/": {"calls": 100, "period": 3600},  # Equipment
            "/api/v1/projects/": {"calls": 150, "period": 3600},  # Projects
            "/api/v1/members/": {"calls": 100, "period": 3600},  # Members
            "/api/v1/billing/": {"calls": 50, "period": 3600},   # Billing
            "default": {"calls": 300, "period": 3600}  # Default limit
        }
    
    def get_endpoint_category(self, path: str) -> str:
        """Get the rate limit category for a path"""
        for prefix in self.limits:
            if prefix != "default" and path.startswith(prefix):
                return prefix
        return "default"
    
    async def dispatch(self, request: Request, call_next):
        # Determine client IP (proxy-aware if enabled)
        client_ip = request.client.host if request.client else "unknown"
        if os.getenv("TRUST_PROXY", "false").lower() in ("1", "true", "yes"):
            xff = request.headers.get("x-forwarded-for")
            if xff:
                client_ip = xff.split(",")[0].strip()
            else:
                fwd = request.headers.get("forwarded")
                if fwd:
                    # naive parse: look for for=
                    parts = [p.strip() for p in fwd.split(";")]
                    for part in parts:
                        if part.lower().startswith("for="):
                            client_ip = part.split("=", 1)[1].strip().strip('"')
                            break
        endpoint_category = self.get_endpoint_category(request.url.path)
        
        # Get limits for this endpoint category
        limit_config = self.limits[endpoint_category]
        calls_limit = limit_config["calls"]
        period = limit_config["period"]
        
        now = time.time()
        remaining = None
        if self.redis_client:
            # Fixed window key
            window_start = int(now // period) * period
            key_raw = f"rl:{client_ip}:{endpoint_category}:{window_start}"
            key = hashlib.sha256(key_raw.encode()).hexdigest()
            try:
                current = self.redis_client.incr(key)
                ttl = self.redis_client.ttl(key)
                if ttl == -1:
                    self.redis_client.expire(key, period)
                if current > calls_limit:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Rate limit exceeded for {endpoint_category}. Try again later.",
                        headers={"Retry-After": str(period)}
                    )
                remaining = max(0, calls_limit - int(current))
            except HTTPException:
                raise
            except Exception:
                # Fallback to in-memory if Redis fails
                pass

        if remaining is None:
            # In-memory fallback
            self.clients[client_ip][endpoint_category] = [
                t for t in self.clients[client_ip][endpoint_category] if now - t < period
            ]
            if len(self.clients[client_ip][endpoint_category]) >= calls_limit:
                logger.warning(
                    f"Rate limit exceeded for IP {client_ip} on {endpoint_category}: "
                    f"{len(self.clients[client_ip][endpoint_category])}/{calls_limit}"
                )
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded for {endpoint_category}. Try again later.",
                    headers={"Retry-After": str(period)}
                )
            self.clients[client_ip][endpoint_category].append(now)
            remaining = calls_limit - len(self.clients[client_ip][endpoint_category])
        
        # Add rate limit headers
        response = await call_next(request)
        # Propagate request id header
        request_id = getattr(request.state, "request_id", None)
        if request_id:
            response.headers["X-Request-ID"] = request_id
        response.headers["X-RateLimit-Limit"] = str(calls_limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(now + period))
        
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add comprehensive security headers (CSP built from env)."""

    def __init__(self, app):
        super().__init__(app)
        # Allow Keycloak and API hosts in connect-src
        keycloak_url = os.getenv("KEYCLOAK_URL", "http://localhost:8081")
        extra_connect = os.getenv("CSP_CONNECT_EXTRA", "")
        connect_sources = ["'self'", "wss:", "https:"]
        if keycloak_url:
            connect_sources.append(keycloak_url)
        for src in [s.strip() for s in extra_connect.split(",") if s.strip()]:
            connect_sources.append(src)
        self.csp = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            f"connect-src {' '.join(connect_sources)}; "
            "font-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "frame-ancestors 'none'"
        )

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": self.csp,
            "Permissions-Policy": (
                "accelerometer=(), camera=(), geolocation=(), gyroscope=(), "
                "magnetometer=(), microphone=(), payment=(), usb=()"
            ),
        }
        # Only advertise HSTS when behind TLS (typically production)
        if os.getenv("ENVIRONMENT") == "production":
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers.update(headers)
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log security-relevant requests"""

    def __init__(self, app):
        super().__init__(app)
        self.sample_rate = float(os.environ.get("REQUEST_LOG_SAMPLE_RATE", "1.0"))

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        request_id = getattr(
            request.state,
            "request_id",
            request.headers.get("X-Request-ID", str(uuid.uuid4())),
        )
        request.state.request_id = request_id

        # Log request details
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        user_agent = request.headers.get("user-agent", "")

        logger.info(
            f"[{request_id}] Request: {method} {path} from {client_ip} "
            f"UA: {user_agent[:50]}..."
        )

        # Check for suspicious patterns
        suspicious_patterns = [
            "../", "..\\", "%2e%2e", "union select", "drop table",
            "<script", "javascript:", "onclick=", "onerror=",
            "/etc/passwd", "/proc/", "cmd.exe", "powershell"
        ]

        path_lower = path.lower()
        query_lower = str(request.query_params).lower()

        for pattern in suspicious_patterns:
            if pattern in path_lower or pattern in query_lower:
                logger.warning(
                    f"[{request_id}] Suspicious request pattern detected: {pattern} "
                    f"from {client_ip} - {method} {path}"
                )
                break

        response = await call_next(request)

        process_time = time.time() - start_time
        ctx = get_request_context()
        if random.random() <= self.sample_rate:
            sub = ctx.get("sub")
            roles = ctx.get("roles", [])
            groups = ctx.get("groups", [])
            logger.info(
                f"[{request_id}] Response: {response.status_code} for {method} {path} "
                f"in {process_time:.3f}s sub={sub} roles={roles} groups={len(groups)}"
            )

        if response.status_code == 401:
            logger.warning(
                f"[{request_id}] Authentication failure from {client_ip} - "
                f"{method} {path}"
            )
        elif response.status_code == 403:
            logger.warning(
                f"[{request_id}] Authorization failure from {client_ip} - "
                f"{method} {path}"
            )

        return response

def add_security_middleware(app):
    """Add all security middleware to the FastAPI app"""
    # Order is important. In Starlette, the last added runs first on request
    # and last on response. Add SecurityHeaders last so it always sets headers.
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
