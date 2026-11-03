from typing import Any, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from app.schemas.repository import RepositoryResponse

DifficultyLevel = Literal["Beginner", "Intermediate", "Advanced", "Unknown"]


class ProjectRequirements(BaseModel):
    """
    Structured project requirements extracted from a natural-language developer query.
    """

    domain: Optional[str] = Field(
        default=None,
        description="Application domain or industry sector (e.g., Healthcare, E-Commerce, DevTools)",
        examples=["Healthcare AI"],
    )
    project_type: Optional[str] = Field(
        default=None,
        description="Type or archetype of project (e.g., Chatbot, CLI Tool, REST API, Web App)",
        examples=["Chatbot"],
    )
    programming_languages: List[str] = Field(
        default_factory=list,
        description="Identified programming languages (e.g., Python, TypeScript, Go)",
        examples=[["Python", "TypeScript"]],
    )
    frameworks: List[str] = Field(
        default_factory=list,
        description="Identified frameworks and major libraries (e.g., React, FastAPI, PyTorch)",
        examples=[["FastAPI", "React"]],
    )
    technologies: List[str] = Field(
        default_factory=list,
        description="Identified technical concepts or toolchains (e.g., NLP, Docker, WebSockets)",
        examples=[["AI", "NLP"]],
    )
    difficulty: DifficultyLevel = Field(
        default="Unknown",
        description="Target developer difficulty level: Beginner, Intermediate, Advanced, or Unknown",
        examples=["Beginner"],
    )
    min_stars: Optional[int] = Field(
        default=None,
        ge=0,
        description="Extracted or preferred minimum star count for candidate repositories",
        examples=[100],
    )
    documentation_preference: Optional[str] = Field(
        default=None,
        description="Extracted documentation expectation (e.g., 'Good documentation preferred')",
        examples=["Good documentation preferred"],
    )
    keywords: List[str] = Field(
        default_factory=list,
        description="Keywords and phrases characterizing the search intent",
        examples=[["healthcare chatbot", "medical AI"]],
    )
    github_search_query: str = Field(
        default="",
        description="Clean, optimized query keywords formulated for GitHub repository search",
        examples=["healthcare chatbot AI"],
    )
    summary: str = Field(
        default="",
        description="Concise summary of the developer's project intent",
        examples=["Beginner-friendly AI healthcare chatbot using Python and React."],
    )

    @field_validator("difficulty", mode="before")
    @classmethod
    def normalize_difficulty(cls, v: Any) -> str:
        if isinstance(v, str):
            clean = v.strip().capitalize()
            if clean in {"Beginner", "Intermediate", "Advanced", "Unknown"}:
                return clean
        return "Unknown"

    @field_validator(
        "programming_languages",
        "frameworks",
        "technologies",
        "keywords",
        mode="before",
    )
    @classmethod
    def clean_string_list(cls, v: Any) -> List[str]:
        if not v:
            return []
        if isinstance(v, str):
            v = [v]
        if isinstance(v, (list, tuple)):
            cleaned: List[str] = []
            seen = set()
            for item in v:
                if isinstance(item, str):
                    s = item.strip()
                    if s and s.lower() not in seen:
                        seen.add(s.lower())
                        cleaned.append(s)
            return cleaned
        return []

    @field_validator("domain", "project_type", "documentation_preference", mode="before")
    @classmethod
    def clean_optional_str(cls, v: Any) -> Optional[str]:
        if isinstance(v, str):
            s = v.strip()
            return s if s else None
        return None

    @field_validator("github_search_query", "summary", mode="before")
    @classmethod
    def clean_required_str(cls, v: Any) -> str:
        if isinstance(v, str):
            return v.strip()
        return ""

    @model_validator(mode="after")
    def validate_search_query_fallback(self) -> "ProjectRequirements":
        # Fallback if model returned empty github_search_query
        if not self.github_search_query:
            if self.keywords:
                self.github_search_query = " ".join(self.keywords[:3])
            elif self.domain and self.project_type:
                self.github_search_query = f"{self.domain} {self.project_type}"
            elif self.summary:
                self.github_search_query = self.summary[:80]
            else:
                self.github_search_query = "open source project"

        if not self.summary:
            parts = []
            if self.difficulty != "Unknown":
                parts.append(f"{self.difficulty} level")
            if self.domain:
                parts.append(self.domain)
            if self.project_type:
                parts.append(self.project_type)
            self.summary = " ".join(parts) or "Open source project search requirements."

        return self


class UnderstandQueryRequest(BaseModel):
    """
    Request payload to extract structured project requirements using Mistral AI.
    """

    query: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Natural language description of the desired open source project or architecture",
        examples=["I want to build an AI healthcare chatbot using Python, FastAPI and React. I am a beginner."],
    )

    @field_validator("query")
    @classmethod
    def validate_query_not_blank(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Query string cannot be empty or purely whitespace.")
        return trimmed


class UnderstandQueryResponse(BaseModel):
    """
    Response containing extracted project requirements from Mistral AI.
    """

    success: bool = Field(default=True, description="Indicates if query understanding succeeded")
    requirements: ProjectRequirements = Field(..., description="Structured project requirements")


class AISearchRequest(BaseModel):
    """
    Request payload for AI-powered GitHub repository discovery.
    """

    query: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Natural language project description",
        examples=["I want to build an AI healthcare chatbot using Python, FastAPI and React."],
    )
    page: int = Field(
        default=1,
        ge=1,
        le=100,
        description="Page number to retrieve (1-100)",
        examples=[1],
    )
    per_page: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Results per page (1-50)",
        examples=[10],
    )
    sort: Optional[str] = Field(
        default=None,
        description="GitHub sort field: 'stars', 'forks', 'updated', or null/'best-match'",
        examples=["stars"],
    )
    order: Optional[str] = Field(
        default="desc",
        pattern="^(desc|asc)$",
        description="Sort order: 'desc' or 'asc'",
        examples=["desc"],
    )
    language_override: Optional[str] = Field(
        default=None,
        description="Optional manual programming language override",
        examples=["Python"],
    )
    min_stars_override: Optional[int] = Field(
        default=None,
        ge=0,
        description="Optional manual minimum stars override",
        examples=[50],
    )

    @field_validator("query")
    @classmethod
    def validate_query_not_blank(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Query string cannot be empty or purely whitespace.")
        return trimmed


class AISearchResponse(BaseModel):
    """
    Unified response combining Mistral AI requirements extraction with real GitHub repositories.
    """

    success: bool = Field(default=True, description="Indicates if AI search completed successfully")
    query: str = Field(..., description="Original user natural language query")
    requirements: ProjectRequirements = Field(..., description="Extracted structured requirements")
    total_count: int = Field(default=0, ge=0, description="Total matching repositories found on GitHub")
    page: int = Field(default=1, ge=1, description="Current page number")
    per_page: int = Field(default=10, ge=1, description="Results per page")
    items: List[RepositoryResponse] = Field(
        default_factory=list,
        description="List of real GitHub repositories matching the AI requirements",
    )

    # Aliases for compatibility
    total: int = Field(default=0, description="Alias for total_count")
    results: List[RepositoryResponse] = Field(default_factory=list, description="Alias for items")

    @model_validator(mode="before")
    @classmethod
    def sync_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "total_count" in data and "total" not in data:
                data["total"] = data["total_count"]
            elif "total" in data and "total_count" not in data:
                data["total_count"] = data["total"]

            if "items" in data and "results" not in data:
                data["results"] = data["items"]
            elif "results" in data and "items" not in data:
                data["items"] = data["results"]
        return data

