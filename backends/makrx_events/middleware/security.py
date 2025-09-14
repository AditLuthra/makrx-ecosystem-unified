"""
Security middleware setup for MakrX Events, aligned with MakrCave/Makrx-Store.

Provides:
- CORS and TrustedHost configuration
- Security headers
- Optional Redis-backed rate limiting
- Optional CSRF protection for browser-originated POST/PUT/PATCH/DELETE
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
import os
import time
import hashlib


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI, redis_url: str | None = None):
        super().__init__(app)
        self.limit = int(os.getenv("RATE_LIMIT", "200"))
        self.window = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
        self.redis = None
        if redis_url:
            try:
                import redis  # type: ignore

                self.redis = redis.Redis.from_url(redis_url)
            except Exception:
                self.redis = None

    async def dispatch(self, request: Request, call_next):
        # Only limit authenticated-modifying calls by default; allow toggling via env
        methods = os.getenv("RATE_LIMIT_METHODS", "POST,PUT,PATCH,DELETE").split(",")
        if request.method.upper() not in [m.strip().upper() for m in methods if m.strip()]:
            return await call_next(request)

        ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or (
            request.client.host if request.client else "unknown"
        )
        key_raw = f"rl:{ip}:{int(time.time() // self.window) * self.window}"
        key = hashlib.sha256(key_raw.encode()).hexdigest()

        if self.redis:
            try:
                current = self.redis.incr(key)
                if self.redis.ttl(key) == -1:
                    self.redis.expire(key, self.window)
                if current > self.limit:
                    return JSONResponse(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        content={"detail": "Rate limit exceeded"},
                        headers={"Retry-After": str(self.window)},
                    )
                return await call_next(request)
            except Exception:
                return await call_next(request)

        # In-memory fallback
        now = time.time()
        bucket = getattr(self, "_bucket", {})
        hits = [t for t in bucket.get(ip, []) if now - t < self.window]
        if len(hits) >= self.limit:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded"},
                headers={"Retry-After": str(self.window)},
            )
        hits.append(now)
        bucket[ip] = hits
        setattr(self, "_bucket", bucket)
        return await call_next(request)


class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI):
        super().__init__(app)
        self.exempt = {"/webhooks/", "/api/auth/", "/health", "/api/health", "/api/readyz", "/metrics"}

    def _is_exempt(self, path: str) -> bool:
        return any(seg in path for seg in self.exempt)

    async def dispatch(self, request: Request, call_next):
        if request.method in ("GET", "HEAD", "OPTIONS") or self._is_exempt(request.url.path):
            return await call_next(request)
        # Only enforce for browser origins
        if request.headers.get("Origin"):
            token = request.headers.get("X-CSRF-Token")
            cookie_token = request.cookies.get("csrf_token")
            if not token or not cookie_token or token != cookie_token:
                return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"detail": "CSRF token missing or invalid"})
        response = await call_next(request)
        if not request.cookies.get("csrf_token"):
            import secrets

            response.set_cookie(
                "csrf_token",
                secrets.token_urlsafe(32),
                httponly=True,
                secure=True,
                samesite="strict",
                max_age=3600,
            )
        return response


def add_security_middleware(app: FastAPI) -> None:
    # Security headers
    @app.middleware("http")
    async def _security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers.update(
            {
                "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            }
        )
        return response

    # CORS (align with ecosystem)
    allowed = [
        "https://makrx.org",
        "https://makrcave.com",
        "https://makrx.store",
        "https://makrx.events",
    ]
    if os.getenv("ENVIRONMENT", "development") != "production":
        allowed.extend(
            [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "http://localhost:3003",
                "http://localhost:3004",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3004",
            ]
        )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Response-Time"],
    )

    # Trusted hosts
    trusted = [
        "makrx.org",
        "*.makrx.org",
        "makrcave.com",
        "makrx.store",
        "makrx.events",
        "testserver",  # FastAPI TestClient host
    ]
    if os.getenv("ENVIRONMENT", "development") != "production":
        trusted.extend(["localhost", "127.0.0.1"]) 
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted)

    # Optional rate limiting + CSRF
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        app.add_middleware(RateLimitMiddleware, redis_url=redis_url)
    app.add_middleware(CSRFProtectionMiddleware)
