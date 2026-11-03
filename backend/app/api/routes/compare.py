from fastapi import APIRouter, status
from app.core.logging import get_logger
from app.schemas.comparison import ComparisonRequest, ComparisonResponse

logger = get_logger("app.api.compare")
router = APIRouter(tags=["Comparison"])


@router.post(
    "/compare",
    response_model=ComparisonResponse,
    status_code=status.HTTP_200_OK,
    summary="Compare Repositories",
    description=(
        "Accepts a list of 2 to 4 repository identifiers and computes architectural trade-offs, "
        "documentation scores, and stack suitability. "
        "In Phase 3, this endpoint validates input repository lists and returns an operational development response. "
        "Multi-repository comparative matrix synthesis is scheduled for Phase 5."
    ),
)
async def compare_repositories(payload: ComparisonRequest) -> ComparisonResponse:
    logger.info(
        "Comparison request received for %d repositories: %s",
        len(payload.repository_ids),
        payload.repository_ids,
    )

    return ComparisonResponse(
        repository_ids=payload.repository_ids,
        count=len(payload.repository_ids),
        comparison_data=None,
        message=(
            f"Successfully validated {len(payload.repository_ids)} repository identifiers. "
            "Comparative analysis matrix pipeline is staged for Phase 5."
        ),
        status="development",
    )

