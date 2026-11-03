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


class GitHubAPIException(OpenScoutException):
    """Base exception for errors communicating with the GitHub REST API."""

    def __init__(
        self,
        message: str,
        code: str = "GITHUB_API_ERROR",
        status_code: int = status.HTTP_502_BAD_GATEWAY,
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status_code,
            details=details,
        )


class GitHubRateLimitException(GitHubAPIException):
    """Raised when the GitHub API rate limit is exceeded."""

    def __init__(
        self,
        message: str = "GitHub API rate limit exceeded. Please wait before retrying or configure a personal GITHUB_TOKEN.",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code="GITHUB_RATE_LIMIT_EXCEEDED",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details,
        )


class GitHubAuthException(GitHubAPIException):
    """Raised when GitHub token authentication fails (401 Bad credentials)."""

    def __init__(
        self,
        message: str = "GitHub authentication failed. Please verify that your GITHUB_TOKEN is valid.",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code="GITHUB_AUTH_FAILED",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details,
        )


class GitHubResourceNotFoundException(ResourceNotFoundException):
    """Raised when a specific GitHub repository does not exist or is private."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            details=details,
        )
        self.code = "GITHUB_REPOSITORY_NOT_FOUND"


class GitHubUpstreamException(GitHubAPIException):
    """Raised when GitHub returns transient 5xx errors or network timeout."""

    def __init__(
        self,
        message: str = "GitHub API is currently unreachable or experiencing service degradation. Please try again later.",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code="GITHUB_UPSTREAM_ERROR",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details,
        )


class MistralAPIException(OpenScoutException):
    """Base exception for errors communicating with the Mistral AI API."""

    def __init__(
        self,
        message: str,
        code: str = "MISTRAL_API_ERROR",
        status_code: int = status.HTTP_502_BAD_GATEWAY,
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status_code,
            details=details,
        )


class MistralAuthException(MistralAPIException):
    """Raised when Mistral API authentication fails (missing or invalid API key)."""

    def __init__(
        self,
        message: str = "Mistral API authentication failed. Please configure a valid MISTRAL_API_KEY.",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code="MISTRAL_AUTH_FAILED",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details,
        )


class MistralRateLimitException(MistralAPIException):
    """Raised when Mistral API rate limit is exceeded."""

    def __init__(
        self,
        message: str = "Mistral AI API rate limit exceeded. Please wait a moment before retrying.",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code="MISTRAL_RATE_LIMIT_EXCEEDED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details=details,
        )


class MistralMalformedResponseException(MistralAPIException):
    """Raised when Mistral returns an unparseable or invalid response structure."""

    def __init__(
        self,
        message: str = "Mistral AI returned a malformed or unparseable response.",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code="MISTRAL_MALFORMED_RESPONSE",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details,
        )


class MistralUpstreamException(MistralAPIException):
    """Raised when Mistral AI returns transient 5xx errors or network timeouts."""

    def __init__(
        self,
        message: str = "Mistral AI is currently unreachable or experiencing service degradation. Please try again later.",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code="MISTRAL_UPSTREAM_ERROR",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details,
        )


class DatabaseException(OpenScoutException):
    """Base exception for database failures."""

    def __init__(
        self,
        message: str,
        code: str = "DATABASE_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status_code,
            details=details,
        )


class DatabaseConnectionException(DatabaseException):
    """Raised when the PostgreSQL/pgvector database is unreachable."""

    def __init__(
        self,
        message: str = "Database connection failed. Please ensure PostgreSQL with pgvector is running.",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code="DATABASE_CONNECTION_ERROR",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details=details,
        )


class RepositoryNotIndexedException(ResourceNotFoundException):
    """Raised when a RAG query or status check is executed on a repository that has not been indexed."""

    def __init__(
        self,
        message: str = "This repository has not been indexed yet. Please trigger documentation indexing first.",
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            details=details,
        )
        self.code = "REPOSITORY_NOT_INDEXED"


class IngestionException(OpenScoutException):
    """Raised when documentation ingestion or indexing fails."""

    def __init__(
        self,
        message: str,
        code: str = "INGESTION_ERROR",
        status_code: int = status.HTTP_422_UNPROCESSABLE_ENTITY,
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status_code,
            details=details,
        )


class RAGException(OpenScoutException):
    """Raised when RAG chatbot query processing or context generation fails."""

    def __init__(
        self,
        message: str,
        code: str = "RAG_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Any] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status_code,
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
