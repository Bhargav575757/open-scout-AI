from datetime import datetime, timezone
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class ErrorItem(BaseModel):
    field: str = Field(..., description="Target field that caused the error", examples=["query"])
    message: str = Field(..., description="Human-readable error description", examples=["Query string cannot be empty"])


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Standard machine-readable error code", examples=["REQUEST_VALIDATION_ERROR"])
    message: str = Field(..., description="High-level error summary", examples=["Input validation failed"])
    details: Optional[Any] = Field(default=None, description="Detailed field-level error breakdown")


class ErrorResponse(BaseModel):
    error: ErrorDetail
    detail: Optional[Any] = None


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service operational status", examples=["healthy"])
    service: str = Field(..., description="Service identifier", examples=["OpenScout Backend"])
    version: str = Field(..., description="Deployed semantic version", examples=["0.3.0"])
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="UTC timestamp of the health check inspection",
    )
    environment: str = Field(default="development", description="Runtime execution environment")


class RootResponse(BaseModel):
    message: str = Field(..., description="Welcome greeting message", examples=["Welcome to OpenScout API"])
    version: str = Field(..., description="API version", examples=["0.3.0"])
    docs_url: str = Field(default="/docs", description="Interactive API documentation URL")


class MessageResponse(BaseModel):
    message: str = Field(..., description="Informational message")
    status: str = Field(default="development", description="Execution status")
