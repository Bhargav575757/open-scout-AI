import re
from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ValidationException
from app.core.logging import get_logger
from app.schemas.rag import IndexRepositoryRequest, IndexRepositoryResponse, IndexStatusResponse
from app.schemas.repository import RepositoryResponse
from app.services.github_service import github_service
from app.services.ingestion_service import ingestion_service

logger = get_logger("app.api.repositories")
router = APIRouter(tags=["Repositories"])

# Regex for valid repository identifiers: slug like 'medibot-ai' or owner/repo like 'healthtech/medibot' or numeric id '123456'
REPO_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_\-\.]+(/[a-zA-Z0-9_\-\.]+)?$")


@router.post(
    "/repositories/{owner}/{repo}/index",
    response_model=IndexRepositoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Index Repository Documentation",
    description=(
        "Retrieves the repository README from GitHub, sanitizes markdown, fragments it into semantic "
        "overlapping chunks, generates vector embeddings with Sentence Transformers, and stores the index in PostgreSQL."
    ),
)
async def index_repository(
    owner: str = Path(..., min_length=1, max_length=100, description="GitHub repository owner username or organization"),
    repo: str = Path(..., min_length=1, max_length=100, description="GitHub repository name"),
    payload: IndexRepositoryRequest = IndexRepositoryRequest(),
    db: AsyncSession = Depends(get_db),
) -> IndexRepositoryResponse:
    clean_owner = owner.strip()
    clean_repo = repo.strip()
    logger.info("Received indexing request for %s/%s (force_refresh=%s)", clean_owner, clean_repo, payload.force_refresh)

    result = await ingestion_service.index_repository(clean_owner, clean_repo, db)
    return IndexRepositoryResponse(
        success=True,
        repository_id=result["repository_id"],
        full_name=result["full_name"],
        is_indexed=result["is_indexed"],
        chunks_count=result["chunks_count"],
        message=f"Repository {result['full_name']} successfully indexed with {result['chunks_count']} chunks.",
    )


@router.get(
    "/repositories/{owner}/{repo}/index-status",
    response_model=IndexStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Repository Documentation Indexing Status",
    description="Checks whether a repository README has been embedded and indexed in PostgreSQL pgvector.",
)
async def get_index_status(
    owner: str = Path(..., min_length=1, max_length=100, description="GitHub repository owner username or organization"),
    repo: str = Path(..., min_length=1, max_length=100, description="GitHub repository name"),
    db: AsyncSession = Depends(get_db),
) -> IndexStatusResponse:
    clean_owner = owner.strip()
    clean_repo = repo.strip()
    status_data = await ingestion_service.get_index_status(clean_owner, clean_repo, db)
    return IndexStatusResponse(**status_data)


@router.get(
    "/repositories/{repository_id:path}",
    response_model=RepositoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get GitHub Repository Metadata",
    description=(
        "Retrieves structured metadata for a repository from GitHub using either a namespaced "
        "'owner/repo' path, a numeric repository ID, or an identifier slug."
    ),
)
async def get_repository_by_id(
    repository_id: str = Path(
        ...,
        min_length=1,
        max_length=120,
        description="Repository 'owner/repo' path, numeric ID, or name slug",
        examples=["healthtech-labs/medibot-ai"],
    ),
) -> RepositoryResponse:
    clean_id = repository_id.strip()

    if not clean_id or not REPO_ID_PATTERN.match(clean_id):
        raise ValidationException(
            message=f"Invalid repository identifier '{repository_id}'. Identifiers must be alphanumeric slugs or owner/repo strings.",
            details={"field": "repository_id", "value": repository_id},
        )

    logger.info("Fetching repository metadata for id='%s'", clean_id)
    return await github_service.get_repository(clean_id)
