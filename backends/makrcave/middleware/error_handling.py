"""
Unified error handling middleware for MakrCave Backend API
Provides consistent error responses, input validation, and security logging
"""

import logging
import traceback
from typing import Optional, Dict, Any
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import (
    RequestValidationError,
    HTTPException as FastAPIHTTPException,
)
from pydantic import ValidationError
from starlette.middleware.base import BaseHTTPMiddleware
import time
import uuid

logger = logging.getLogger(__name__)


class ErrorCode:
    """Standardized error codes for consistent API responses"""

    # Client Errors (4xx)
    INVALID_INPUT = "INVALID_INPUT"
    MISSING_FIELD = "MISSING_FIELD"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    RATE_LIMITED = "RATE_LIMITED"

    # Server Errors (5xx)
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"


class APIError(Exception):
    """Custom API error with structured response"""

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
    """Specialized error for validation failures"""

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
    """Middleware for unified error handling and logging"""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.time()

        try:
            response = await call_next(request)
            return response

        except Exception as exc:
            return await self.handle_exception(request, exc, request_id, start_time)

    async def handle_exception(
        self,
        request: Request,
        exc: Exception,
        request_id: str,
        start_time: float,
    ) -> JSONResponse:
        """Handle and format all exceptions consistently"""

        process_time = (time.time() - start_time) * 1000

        # Extract client info for logging
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("User-Agent", "Unknown")

        if isinstance(exc, APIError):
            return await self._handle_api_error(exc, request_id, request, process_time)

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
        """Handle custom API errors"""

        logger.warning(
            f"API Error: {exc.message} | "
            f"Code: {exc.error_code} | "
            f"Request: {request.method} {request.url.path} | "
            f"RequestID: {request_id}"
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
        """Handle Pydantic validation errors"""

        field_errors = {}
        for error in exc.errors():
            field_name = ".".join(str(loc) for loc in error["loc"])
            field_errors[field_name] = error["msg"]

        logger.warning(
            f"Validation Error: {len(field_errors)} field errors | "
            f"Request: {request.method} {request.url.path} | "
            f"RequestID: {request_id} | "
            f"Fields: {list(field_errors.keys())}"
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
        """Handle FastAPI HTTP exceptions"""

        # Map status codes to error codes
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
            f"HTTP Exception: {exc.detail} | "
            f"Status: {exc.status_code} | "
            f"Request: {request.method} {request.url.path} | "
            f"RequestID: {request_id}"
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
        """Handle unexpected errors"""

        logger.error(
            f"Unexpected Error: {str(exc)} | "
            f"Type: {type(exc).__name__} | "
            f"Request: {request.method} {request.url.path} | "
            f"RequestID: {request_id} | "
            f"Traceback: {traceback.format_exc()}"
        )

        # Don't expose internal error details in production
        import os

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


# Utility functions for raising standardized errors
def raise_validation_error(
    field_errors: Dict[str, str], message: str = "Validation failed"
):
    """Raise a validation error with field-specific errors"""
    raise ValidationAPIError(field_errors, message)


def raise_not_found(resource: str, identifier: str = None):
    """Raise a standardized not found error"""
    message = f"{resource} not found"
    if identifier:
        message += f": {identifier}"

    raise APIError(message=message, error_code=ErrorCode.NOT_FOUND, status_code=404)


def raise_unauthorized(message: str = "Authentication required"):
    """Raise a standardized unauthorized error"""
    raise APIError(message=message, error_code=ErrorCode.UNAUTHORIZED, status_code=401)


def raise_forbidden(message: str = "Access denied"):
    """Raise a standardized forbidden error"""
    raise APIError(message=message, error_code=ErrorCode.FORBIDDEN, status_code=403)


def raise_conflict(resource: str, reason: str = None):
    """Raise a standardized conflict error"""
    message = f"{resource} already exists"
    if reason:
        message += f": {reason}"

    raise APIError(message=message, error_code=ErrorCode.CONFLICT, status_code=409)


def raise_internal_error(
    message: str = "Internal server error", details: Dict[str, Any] = None
):
    """Raise a standardized internal server error"""
    raise APIError(
        message=message,
        error_code=ErrorCode.INTERNAL_ERROR,
        status_code=500,
        details=details,
    )


# Input validation decorators
def validate_required_fields(data: dict, required_fields: list) -> Dict[str, str]:
    """Validate that required fields are present and not empty"""
    errors = {}

    for field in required_fields:
        if field not in data:
            errors[field] = f"{field} is required"
        elif data[field] is None or (
            isinstance(data[field], str) and not data[field].strip()
        ):
            errors[field] = f"{field} cannot be empty"

    return errors


def validate_field_length(
    data: dict, field_rules: Dict[str, Dict[str, int]]
) -> Dict[str, str]:
    """Validate field length constraints"""
    errors = {}

    for field, rules in field_rules.items():
        if field in data and data[field] is not None:
            value = str(data[field])

            if "min_length" in rules and len(value) < rules["min_length"]:
                errors[field] = (
                    f"{field} must be at least {rules['min_length']} characters"
                )

            if "max_length" in rules and len(value) > rules["max_length"]:
                errors[field] = (
                    f"{field} must be no more than {rules['max_length']} characters"
                )

    return errors


def validate_email_format(email: str) -> bool:
    """Basic email format validation"""
    import re

    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def sanitize_string_input(value: str, max_length: int = 1000) -> str:
    """Sanitize string input to prevent injection attacks"""
    if not value:
        return ""

    # Remove null bytes and control characters
    sanitized = "".join(char for char in value if ord(char) >= 32 or char in "\t\n\r")

    # Trim whitespace and limit length
    sanitized = sanitized.strip()[:max_length]

    return sanitized
