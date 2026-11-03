import re
from fastapi import APIRouter, Path, status
from app.core.exceptions import ValidationException
from app.core.logging import get_logger
from app.schemas.repository import RepositoryResponse
from app.services.github_service import github_service

logger = get_logger("app.api.repositories")
router = APIRouter(tags=["Repositories"])

# Regex for valid repository identifiers: slug like 'medibot-ai' or owner/repo like 'healthtech/medibot' or numeric id '123456'
REPO_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_\-\.]+(/[a-zA-Z0-9_\-\.]+)?$")


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
