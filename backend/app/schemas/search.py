from typing import Any, List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from app.schemas.repository import RepositoryResponse


class SearchRequest(BaseModel):
    """
    Request payload for searching GitHub repositories.
    """

    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Search keywords or project concept",
        examples=["AI healthcare chatbot"],
    )
    language: Optional[str] = Field(
        default=None,
        description="Optional programming language filter qualifier",
        examples=["Python"],
    )
    min_stars: Optional[int] = Field(
        default=None,
        ge=0,
        description="Optional minimum GitHub stars qualifier",
        examples=[10],
    )
    limit: Optional[int] = Field(
        default=10,
        ge=1,
        le=50,
        description="Maximum results to return per page (alias for per_page, 1-50)",
        examples=[10],
    )
    per_page: Optional[int] = Field(
        default=None,
        ge=1,
        le=50,
        description="Results per page (1-50)",
        examples=[10],
    )
    page: int = Field(
        default=1,
        ge=1,
        le=100,
        description="Page number to retrieve (1-100)",
        examples=[1],
    )
    sort: Optional[str] = Field(
        default=None,
        description="Sort field: 'stars', 'forks', 'updated', or null/'best-match'",
        examples=["stars"],
    )
    order: Optional[str] = Field(
        default="desc",
        pattern="^(desc|asc)$",
        description="Sort order: 'desc' or 'asc'",
        examples=["desc"],
    )

    @field_validator("query")
    @classmethod
    def validate_query_not_blank(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Query string cannot be empty or purely whitespace.")
        return trimmed

    @model_validator(mode="after")
    def sync_limit_and_per_page(self) -> "SearchRequest":
        if self.per_page is not None:
            self.limit = self.per_page
        elif self.limit is not None:
            self.per_page = self.limit
        return self


class SearchResponse(BaseModel):
    """
    Structured search response containing live repositories retrieved from GitHub.
    """

    query: str = Field(..., description="The query string executed")
    total_count: int = Field(default=0, ge=0, description="Total matching repositories found by GitHub")
    page: int = Field(default=1, ge=1, description="Current page number")
    per_page: int = Field(default=10, ge=1, description="Number of results per page")
    items: List[RepositoryResponse] = Field(
        default_factory=list,
        description="List of retrieved GitHub repositories",
    )

    # Backwards-compatibility aliases with Phase 3
    total: int = Field(default=0, description="Alias for total_count")
    results: List[RepositoryResponse] = Field(default_factory=list, description="Alias for items")
    limit: int = Field(default=10, description="Alias for per_page")
    message: Optional[str] = Field(default=None, description="Optional informational message")
    status: Optional[str] = Field(default=None, description="Service response status")

    @model_validator(mode="before")
    @classmethod
    def sync_compatibility_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Sync total <-> total_count
            if "total_count" in data:
                data["total"] = data["total_count"]
            elif "total" in data:
                data["total_count"] = data["total"]

            # Sync items <-> results
            if "items" in data and ("results" not in data or not data["results"]):
                data["results"] = data["items"]
            elif "results" in data and ("items" not in data or not data["items"]):
                data["items"] = data["results"]

            # Sync per_page <-> limit
            if "per_page" in data:
                data["limit"] = data["per_page"]
            elif "limit" in data:
                data["per_page"] = data["limit"]
        return data
