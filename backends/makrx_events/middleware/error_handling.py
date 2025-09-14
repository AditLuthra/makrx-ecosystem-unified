"""
Unified error handling middleware for MakrX Events Backend API
Provides consistent error responses and security-aware logging.
"""

import logging
import traceback
from typing import Optional, Dict, Any
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import (
    RequestValidationError,
    HTTPException as FastAPIHTTPException,
)
from starlette.middleware.base import BaseHTTPMiddleware
import time
import uuid
import os

logger = logging.getLogger(__name__)


class ErrorCode:
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_FIELD = "MISSING_FIELD"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    RATE_LIMITED = "RATE_LIMITED"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"


class APIError(Exception):
    def __init__(
        self,
        message: str,
        error_code: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
        field_errors: Optional[Dict[str, str]] = None,
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        self.field_errors = field_errors or {}
        super().__init__(message)


class ValidationAPIError(APIError):
    def __init__(
        self, field_errors: Dict[str, str], message: str = "Validation failed"
    ):
        super().__init__(
            message=message,
            error_code=ErrorCode.VALIDATION_ERROR,
            status_code=422,
            field_errors=field_errors,
        )


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        start_time = time.time()
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            return await self.handle_exception(
                request, exc, request_id, start_time
            )

    async def handle_exception(
        self,
        request: Request,
        exc: Exception,
        request_id: str,
        start_time: float,
    ) -> JSONResponse:
        process_time = (time.time() - start_time) * 1000

        if isinstance(exc, APIError):
            return await self._handle_api_error(
                exc, request_id, request, process_time
            )
        elif isinstance(exc, RequestValidationError):
            return await self._handle_validation_error(
                exc, request_id, request, process_time
            )
        elif isinstance(exc, FastAPIHTTPException):
            return await self._handle_http_exception(
                exc, request_id, request, process_time
            )
        else:
            return await self._handle_unexpected_error(
                exc, request_id, request, process_time
            )

    async def _handle_api_error(
        self,
        exc: APIError,
        request_id: str,
        request: Request,
        process_time: float,
    ) -> JSONResponse:
        logger.warning(
            f"API Error: {exc.message} | Code: {exc.error_code} | Request: {request.method} {request.url.path} | RequestID: {request_id}"
        )
        response_data = {
            "error": {
                "message": exc.message,
                "code": exc.error_code,
                "request_id": request_id,
                "timestamp": time.time(),
            }
        }
        if exc.field_errors:
            response_data["error"]["field_errors"] = exc.field_errors
        if exc.details:
            response_data["error"]["details"] = exc.details
        return JSONResponse(
            status_code=exc.status_code,
            content=response_data,
            headers={
                "X-Request-ID": request_id,
                "X-Response-Time": f"{process_time:.2f}ms",
            },
        )

    async def _handle_validation_error(
        self,
        exc: RequestValidationError,
        request_id: str,
        request: Request,
        process_time: float,
    ) -> JSONResponse:
        field_errors = {}
        for error in exc.errors():
            field_name = ".".join(str(loc) for loc in error["loc"])
            field_errors[field_name] = error["msg"]

        logger.warning(
            f"Validation Error: {len(field_errors)} field errors | Request: {request.method} {request.url.path} | RequestID: {request_id}"
        )
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "message": "Request validation failed",
                    "code": ErrorCode.VALIDATION_ERROR,
                    "field_errors": field_errors,
                    "request_id": request_id,
                    "timestamp": time.time(),
                }
            },
            headers={
                "X-Request-ID": request_id,
                "X-Response-Time": f"{process_time:.2f}ms",
            },
        )

    async def _handle_http_exception(
        self,
        exc: FastAPIHTTPException,
        request_id: str,
        request: Request,
        process_time: float,
    ) -> JSONResponse:
        error_code_map = {
            400: ErrorCode.INVALID_INPUT,
            401: ErrorCode.UNAUTHORIZED,
            403: ErrorCode.FORBIDDEN,
            404: ErrorCode.NOT_FOUND,
            409: ErrorCode.CONFLICT,
            429: ErrorCode.RATE_LIMITED,
        }
        error_code = error_code_map.get(
            exc.status_code, ErrorCode.INTERNAL_ERROR
        )
        logger.warning(
            f"HTTP Exception: {exc.detail} | Status: {exc.status_code} | Request: {request.method} {request.url.path} | RequestID: {request_id}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "message": str(exc.detail),
                    "code": error_code,
                    "request_id": request_id,
                    "timestamp": time.time(),
                }
            },
            headers={
                "X-Request-ID": request_id,
                "X-Response-Time": f"{process_time:.2f}ms",
            },
        )

    async def _handle_unexpected_error(
        self,
        exc: Exception,
        request_id: str,
        request: Request,
        process_time: float,
    ) -> JSONResponse:
        logger.error(
            f"Unexpected Error: {str(exc)} | Type: {type(exc).__name__} | Request: {request.method} {request.url.path} | RequestID: {request_id} | Traceback: {traceback.format_exc()}"
        )
        is_production = os.getenv("ENVIRONMENT") == "production"
        error_message = "An internal server error occurred"
        error_details = (
            None
            if is_production
            else {
                "exception_type": type(exc).__name__,
                "exception_message": str(exc),
            }
        )
        response_data = {
            "error": {
                "message": error_message,
                "code": ErrorCode.INTERNAL_ERROR,
                "request_id": request_id,
                "timestamp": time.time(),
            }
        }
        if error_details:
            response_data["error"]["details"] = error_details
        return JSONResponse(
            status_code=500,
            content=response_data,
            headers={
                "X-Request-ID": request_id,
                "X-Response-Time": f"{process_time:.2f}ms",
            },
        )


async def http_exception_handler(
    request: Request, exc: FastAPIHTTPException
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    error_code_map = {
        400: ErrorCode.INVALID_INPUT,
        401: ErrorCode.UNAUTHORIZED,
        403: ErrorCode.FORBIDDEN,
        404: ErrorCode.NOT_FOUND,
        409: ErrorCode.CONFLICT,
        429: ErrorCode.RATE_LIMITED,
    }
    error_code = error_code_map.get(exc.status_code, ErrorCode.INTERNAL_ERROR)
    logger.warning(
        f"HTTP Exception: {exc.detail} | Status: {exc.status_code} | Request: {request.method} {request.url.path} | RequestID: {request_id}"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": str(exc.detail),
                "code": error_code,
                "request_id": request_id,
                "timestamp": time.time(),
            }
        },
        headers={"X-Request-ID": request_id},
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    field_errors = {}
    for error in exc.errors():
        field_name = ".".join(str(loc) for loc in error["loc"])
        field_errors[field_name] = error["msg"]
    logger.warning(
        f"Validation Error: {len(field_errors)} field errors | Request: {request.method} {request.url.path} | RequestID: {request_id}"
    )
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "message": "Request validation failed",
                "code": (
                    ErrorCode.VALATION_ERROR
                    if False
                    else ErrorCode.VALIDATION_ERROR
                ),
                "field_errors": field_errors,
                "request_id": request_id,
                "timestamp": time.time(),
            }
        },
        headers={"X-Request-ID": request_id},
    )
