import re
from fastapi import APIRouter, Path, status
from app.core.exceptions import ResourceNotFoundException, ValidationException
from app.core.logging import get_logger
from app.schemas.repository import RepositoryResponse

logger = get_logger("app.api.repositories")
router = APIRouter(tags=["Repositories"])

# Regex for valid repository identifiers: slug like 'medibot-ai' or owner/repo like 'healthtech/medibot'
REPO_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_\-\.]+(/[a-zA-Z0-9_\-\.]+)?$")


@router.get(
    "/repositories/{repository_id:path}",
    response_model=RepositoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Repository By Identifier",
    description=(
        "Retrieves detailed metadata for a specific repository by its unique identifier or owner/repo slug. "
        "In Phase 3, this validates the identifier format and returns a clean 404 response indicating "
        "live data ingestion is scheduled for Phase 4 (GitHub API integration)."
    ),
)
async def get_repository_by_id(
    repository_id: str = Path(
        ...,
        min_length=1,
        max_length=120,
        description="Repository slug identifier or owner/repo path",
        examples=["medibot-ai-fastapi"],
    ),
) -> RepositoryResponse:
    clean_id = repository_id.strip()

    if not clean_id or not REPO_ID_PATTERN.match(clean_id):
        raise ValidationException(
            message=f"Invalid repository identifier '{repository_id}'. Identifiers must be alphanumeric slugs or owner/repo strings.",
            details={"field": "repository_id", "value": repository_id},
        )

    logger.info("Repository lookup requested for id='%s'", clean_id)

    # In Phase 3, no database or live GitHub API fetching is implemented yet.
    # Return an explicit, structured 404 Resource Not Found.
    raise ResourceNotFoundException(
        message=(
            f"Repository '{clean_id}' was not found. "
            "Live repository crawling and vector storage are staged for Phase 4 (GitHub REST API integration)."
        ),
        details={"repository_id": clean_id, "status": "staged_for_phase_4"},
    )
