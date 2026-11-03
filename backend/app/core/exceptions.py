from typing import Any, Optional
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("app.exceptions")


class OpenScoutException(Exception):
    """Base application exception for OpenScout."""

    def __init__(
        self,
        message: str,
        code: str = "APPLICATION_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Any] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class ResourceNotFoundException(OpenScoutException):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="RESOURCE_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class ValidationException(OpenScoutException):
    """Raised when client input fails business validation rules."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class FeatureNotImplementedException(OpenScoutException):
    """Raised when an endpoint is staged for a future implementation phase."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="NOT_IMPLEMENTED",
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            details=details,
        )


def register_exception_handlers(app: FastAPI) -> None:
    """
    Registers centralized exception handlers to format all errors into a uniform JSON structure.
    """

    @app.exception_handler(OpenScoutException)
    async def custom_exception_handler(request: Request, exc: OpenScoutException):
        logger.warning(
            "Custom exception: path=%s, code=%s, status=%d, msg=%s",
            request.url.path,
            exc.code,
            exc.status_code,
            exc.message,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
                "detail": exc.message,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.info(
            "Validation error on path=%s: %s",
            request.url.path,
            exc.errors(),
        )
        formatted_errors = []
        for err in exc.errors():
            loc = " -> ".join([str(x) for x in err.get("loc", []) if x != "body"])
            msg = err.get("msg", "Invalid value")
            formatted_errors.append({"field": loc or "request", "message": msg})

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "REQUEST_VALIDATION_ERROR",
                    "message": "Input validation failed. Please check the request payload.",
                    "details": formatted_errors,
                },
                "detail": formatted_errors,
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.info(
            "HTTP exception: path=%s, status=%d, detail=%s",
            request.url.path,
            exc.status_code,
            exc.detail,
        )
        code = "HTTP_ERROR"
        if exc.status_code == 404:
            code = "NOT_FOUND"
        elif exc.status_code == 403:
            code = "FORBIDDEN"
        elif exc.status_code == 401:
            code = "UNAUTHORIZED"

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": code,
                    "message": str(exc.detail),
                    "details": None,
                },
                "detail": str(exc.detail),
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(
            "Unhandled server exception on %s: %s",
            request.url.path,
            str(exc),
            exc_info=True,
        )
        # Never expose raw internal tracebacks to clients
        message = (
            f"Internal server error: {str(exc)}"
            if settings.DEBUG
            else "An unexpected error occurred. Please try again later."
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": message,
                    "details": None,
                },
                "detail": message,
            },
        )
