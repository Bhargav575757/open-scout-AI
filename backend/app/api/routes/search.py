from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.logging import get_logger
from app.schemas.query_understanding import (
    AISearchRequest,
    AISearchResponse,
    UnderstandQueryRequest,
    UnderstandQueryResponse,
)
from app.schemas.rag import SemanticSearchRequest, SemanticSearchResponse
from app.schemas.search import SearchRequest, SearchResponse
from app.services.github_service import github_service
from app.services.mistral_service import mistral_service
from app.services.semantic_search_service import semantic_search_service

logger = get_logger("app.api.search")
router = APIRouter(tags=["Search"])


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Direct GitHub Repository Search",
    description=(
        "Searches public GitHub repositories directly using keywords, programming language qualifiers, "
        "minimum star count, sorting, and pagination. Connects to the official GitHub REST API (v3)."
    ),
)
async def search_repositories(payload: SearchRequest) -> SearchResponse:
    effective_limit = payload.per_page or payload.limit or 10

    logger.info(
        "Initiating direct GitHub repository search: query='%s', lang=%s, min_stars=%s, limit=%d, page=%d, sort=%s",
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


@router.post(
    "/understand-query",
    response_model=UnderstandQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Understand Natural Language Project Query via Mistral AI",
    description=(
        "Analyzes a natural language developer query and extracts structured project requirements "
        "(domain, project type, programming languages, frameworks, difficulty, minimum stars, "
        "and GitHub search query) using Mistral AI."
    ),
)
async def understand_query(payload: UnderstandQueryRequest) -> UnderstandQueryResponse:
    logger.info("Received query understanding request: query='%s'", payload.query)
    requirements = await mistral_service.understand_query(payload.query)
    return UnderstandQueryResponse(success=True, requirements=requirements)


@router.post(
    "/ai-search",
    response_model=AISearchResponse,
    status_code=status.HTTP_200_OK,
    summary="AI-Powered Open Source Repository Discovery",
    description=(
        "End-to-end intelligent repository discovery: uses Mistral AI to decompose natural language "
        "requirements into structured technical constraints, then queries the official GitHub REST API "
        "to retrieve matching real-world repositories."
    ),
)
async def ai_search(payload: AISearchRequest) -> AISearchResponse:
    logger.info("Initiating AI-powered repository discovery for: '%s'", payload.query)

    # 1. Extract requirements using Mistral AI
    requirements = await mistral_service.understand_query(payload.query)

    # 2. Derive search criteria for GitHubService
    search_query = requirements.github_search_query or " ".join(requirements.keywords[:3]) or payload.query

    # Resolve language filter: manual override takes precedence, then primary language extracted by AI
    effective_language = (
        payload.language_override
        if payload.language_override
        else (requirements.programming_languages[0] if requirements.programming_languages else None)
    )

    # Resolve min_stars: manual override takes precedence, then AI extracted requirement
    effective_min_stars = (
        payload.min_stars_override
        if payload.min_stars_override is not None
        else requirements.min_stars
    )

    effective_limit = payload.per_page or 10

    logger.info(
        "Executing GitHub search derived from AI requirements: query='%s', lang=%s, min_stars=%s, limit=%d, page=%d",
        search_query,
        effective_language,
        effective_min_stars,
        effective_limit,
        payload.page,
    )

    # 3. Query GitHub using existing GitHubService
    github_response = await github_service.search_repositories(
        query=search_query,
        language=effective_language,
        min_stars=effective_min_stars,
        limit=effective_limit,
        page=payload.page,
        sort=payload.sort,
        order=payload.order or "desc",
    )

    return AISearchResponse(
        success=True,
        query=payload.query,
        requirements=requirements,
        total_count=github_response.total_count,
        page=github_response.page,
        per_page=github_response.per_page,
        items=github_response.items,
    )


@router.post(
    "/semantic-search",
    response_model=SemanticSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Semantic Vector Repository Search (pgvector)",
    description=(
        "Converts user query into dense vector embedding using Sentence Transformers and "
        "searches indexed GitHub repositories and documentation chunks in PostgreSQL using cosine distance."
    ),
)
async def semantic_search(
    payload: SemanticSearchRequest,
    db: AsyncSession = Depends(get_db),
) -> SemanticSearchResponse:
    logger.info("Executing semantic vector search for query: '%s'", payload.query)
    result = await semantic_search_service.search_repositories(
        query=payload.query,
        db=db,
        language=payload.language,
        min_stars=payload.min_stars,
        limit=payload.limit,
        page=payload.page,
    )
    return SemanticSearchResponse(
        query=result["query"],
        total_count=result["total_count"],
        page=result["page"],
        per_page=result["per_page"],
        items=result["items"],
    )
