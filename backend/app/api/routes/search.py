from fastapi import APIRouter, status
from app.core.logging import get_logger
from app.schemas.search import SearchRequest, SearchResponse

logger = get_logger("app.api.search")
router = APIRouter(tags=["Search"])


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Natural Language Repository Search",
    description=(
        "Accepts a natural language query with optional constraints and returns matched repository recommendations. "
        "In Phase 3, this endpoint validates input parameters and returns a development response. "
        "Live Mistral AI intent extraction and GitHub REST API integration are scheduled for Phase 4."
    ),
)
async def search_repositories(payload: SearchRequest) -> SearchResponse:
    logger.info("Search request received: query='%s', limit=%d", payload.query, payload.limit)

    return SearchResponse(
        query=payload.query,
        limit=payload.limit,
        total=0,
        results=[],
        message=(
            "Search pipeline is staged for Phase 4 (Mistral AI intent extraction & GitHub API search). "
            "No synthetic or fake results returned."
        ),
        status="development",
    )
