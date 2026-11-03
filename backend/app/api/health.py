from fastapi import APIRouter, status
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="System Health Check",
    description="Returns current operational status of the OpenScout backend service.",
)
async def check_health() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service="OpenScout Backend",
    )
