from fastapi import APIRouter, status
from app.core.logging import get_logger
from app.schemas.history import HistoryResponse

logger = get_logger("app.api.history")
router = APIRouter(tags=["History"])


@router.get(
    "/history",
    response_model=HistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Search History",
    description=(
        "Retrieves the collection of previous natural language search queries and recommendation counts. "
        "In Phase 3, this returns an empty collection as persistent database storage is scheduled for Phase 4+."
    ),
)
async def get_search_history() -> HistoryResponse:
    logger.info("Search history query received")
    return HistoryResponse(
        items=[],
        total=0,
        message="Search history database persistence is staged for Phase 4+. Returning empty collection.",
    )
