from fastapi import APIRouter, status
from app.core.logging import get_logger
from app.schemas.search import SearchRequest, SearchResponse
from app.services.github_service import github_service

logger = get_logger("app.api.search")
router = APIRouter(tags=["Search"])


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Search Open Source Repositories on GitHub",
    description=(
        "Searches public GitHub repositories using keywords, programming language qualifiers, "
        "minimum star count, sorting, and pagination. Connects to the official GitHub REST API (v3)."
    ),
)
async def search_repositories(payload: SearchRequest) -> SearchResponse:
    effective_limit = payload.per_page or payload.limit or 10

    logger.info(
        "Initiating GitHub repository search: query='%s', lang=%s, min_stars=%s, limit=%d, page=%d, sort=%s",
        payload.query,
        payload.language,
        payload.min_stars,
        effective_limit,
        payload.page,
        payload.sort,
    )

    response = await github_service.search_repositories(
        query=payload.query,
        language=payload.language,
        min_stars=payload.min_stars,
        limit=effective_limit,
        page=payload.page,
        sort=payload.sort,
        order=payload.order or "desc",
    )

    return response
