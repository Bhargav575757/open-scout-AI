from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class ComparisonRequest(BaseModel):
    """
    Request payload to initiate comparative architectural analysis between repositories.
    """

    repository_ids: List[str] = Field(
        ...,
        min_length=2,
        max_length=4,
        description="List of 2 to 4 repository identifiers or slugs to compare",
        examples=[["medibot-ai-fastapi", "health-assistant-core"]],
    )

    @field_validator("repository_ids")
    @classmethod
    def validate_repository_ids(cls, ids: List[str]) -> List[str]:
        if not ids or len(ids) < 2:
            raise ValueError("At least 2 repository identifiers are required for comparison.")
        if len(ids) > 4:
            raise ValueError("A maximum of 4 repositories can be compared simultaneously.")

        cleaned = [i.strip() for i in ids if isinstance(i, str) and i.strip()]
        if len(cleaned) != len(ids):
            raise ValueError("Repository identifiers cannot be empty or blank strings.")

        # Check for duplicates
        if len(set(cleaned)) != len(cleaned):
            raise ValueError("Duplicate repository identifiers are not allowed in comparison.")

        return cleaned


class ComparisonResponse(BaseModel):
    """
    Response schema for repository comparison.
    In Phase 3, this returns an explicit development message acknowledging the input.
    """

    repository_ids: List[str] = Field(..., description="The repository identifiers being evaluated")
    count: int = Field(..., description="Number of repositories submitted")
    comparison_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Detailed side-by-side metrics matrix (staged for Phase 5)",
    )
    message: str = Field(
        default="Repository comparison matrix is staged for Phase 5. Received valid repository identifiers.",
        description="Development status message",
    )
    status: str = Field(default="development", description="Service response status")
