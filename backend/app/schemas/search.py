from typing import Any, List, Optional
from pydantic import BaseModel, Field, field_validator


class SearchRequest(BaseModel):
    """
    Request payload for natural language repository search.
    """

    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Natural language description of desired project or stack constraints",
        examples=["AI healthcare chatbot using Python and React"],
    )
    limit: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Maximum number of candidate repositories to return (1-50)",
        examples=[10],
    )
    language: Optional[str] = Field(
        default=None,
        description="Optional filter for specific primary programming language",
        examples=["Python"],
    )
    min_stars: Optional[int] = Field(
        default=None,
        ge=0,
        description="Optional minimum GitHub stars threshold",
        examples=[100],
    )

    @field_validator("query")
    @classmethod
    def validate_query_not_blank(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Query string cannot be empty or purely whitespace.")
        return trimmed


class SearchResponse(BaseModel):
    """
    Standard response payload for repository search.
    In Phase 3, this returns an explicit development message with an empty results list,
    as live Mistral AI extraction and GitHub API querying are scheduled for Phase 4.
    """

    query: str = Field(..., description="The sanitized search query")
    limit: int = Field(..., description="Applied maximum limit")
    total: int = Field(default=0, description="Count of matched repositories")
    results: List[Any] = Field(
        default_factory=list,
        description="List of matched repository recommendations (staged for Phase 4)",
    )
    message: str = Field(
        default="Search pipeline is staged for Phase 4 (Mistral AI intent extraction & GitHub API search). No synthetic or fake results returned.",
        description="Development status message",
    )
    status: str = Field(default="development", description="Service response status")
