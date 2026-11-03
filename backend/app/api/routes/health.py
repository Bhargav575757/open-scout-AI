from fastapi import APIRouter, status
from app.core.config import settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Status",
    description="Returns the operational status, application version, timestamp, and environment of the OpenScout backend.",
)
async def get_health() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service="OpenScout Backend",
        version=settings.APP_VERSION,
        environment="development" if settings.DEBUG else "production",
    )
