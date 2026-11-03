from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, model_validator


class RepositoryResponse(BaseModel):
    """
    Standard schema representing GitHub repository metadata extracted from the GitHub REST API.
    Handles null values, missing fields, and aliases safely.
    """

    id: Union[int, str] = Field(
        ...,
        description="Unique GitHub repository numeric identifier or slug",
        examples=[123456],
    )
    name: str = Field(
        ...,
        description="Repository short name",
        examples=["example-project"],
    )
    full_name: str = Field(
        ...,
        description="Full owner/repository name",
        examples=["owner/example-project"],
    )
    owner: str = Field(
        default="",
        description="GitHub owner login username or organization",
        examples=["owner"],
    )
    owner_avatar_url: Optional[str] = Field(
        default=None,
        description="URL to owner's GitHub profile avatar",
        examples=["https://avatars.githubusercontent.com/u/123456?v=4"],
    )
    description: Optional[str] = Field(
        default=None,
        description="Repository description or null if unspecified",
        examples=["Example description of project"],
    )
    html_url: str = Field(
        ...,
        description="Direct URL to GitHub repository page",
        examples=["https://github.com/owner/example-project"],
    )
    language: Optional[str] = Field(
        default=None,
        description="Primary programming language or null if untracked",
        examples=["Python"],
    )
    stars: int = Field(
        default=0,
        ge=0,
        description="Total stargazers count",
        examples=[500],
    )
    forks: int = Field(
        default=0,
        ge=0,
        description="Total repository forks count",
        examples=[80],
    )
    stargazers_count: Optional[int] = Field(
        default=None,
        description="Explicit stargazers count field mirroring GitHub API",
    )
    forks_count: Optional[int] = Field(
        default=None,
        description="Explicit forks count field mirroring GitHub API",
    )
    open_issues_count: Optional[int] = Field(
        default=None,
        ge=0,
        description="Count of open GitHub issues and pull requests",
    )
    watchers_count: Optional[int] = Field(
        default=None,
        ge=0,
        description="Count of watchers/subscribers",
    )
    topics: List[str] = Field(
        default_factory=list,
        description="Associated topic tags",
        examples=[["machine-learning", "chatbot"]],
    )
    license: Optional[str] = Field(
        default=None,
        description="SPDX license key or name, or null if unlicensed",
        examples=["MIT"],
    )
    created_at: Optional[str] = Field(
        default=None,
        description="ISO 8601 repository creation timestamp",
    )
    updated_at: Optional[str] = Field(
        default=None,
        description="ISO 8601 latest push/update timestamp",
    )
    default_branch: Optional[str] = Field(
        default=None,
        description="Default git branch name (e.g. main, master)",
        examples=["main"],
    )

    @model_validator(mode="before")
    @classmethod
    def sync_metrics_and_owner(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Sync stargazers_count <-> stars
            if "stargazers_count" in data and data["stargazers_count"] is not None:
                if "stars" not in data or data["stars"] == 0:
                    data["stars"] = data["stargazers_count"]
            elif "stars" in data:
                data["stargazers_count"] = data["stars"]

            # Sync forks_count <-> forks
            if "forks_count" in data and data["forks_count"] is not None:
                if "forks" not in data or data["forks"] == 0:
                    data["forks"] = data["forks_count"]
            elif "forks" in data:
                data["forks_count"] = data["forks"]

            # Sync owner object if raw GitHub dict is provided
            owner_data = data.get("owner")
            if isinstance(owner_data, dict):
                if not data.get("owner"):
                    data["owner"] = owner_data.get("login", "")
                if not data.get("owner_avatar_url"):
                    data["owner_avatar_url"] = owner_data.get("avatar_url")
            elif isinstance(owner_data, str) and not data.get("owner"):
                data["owner"] = owner_data

            # Extract license string from GitHub license dict if needed
            license_data = data.get("license")
            if isinstance(license_data, dict):
                data["license"] = license_data.get("spdx_id") or license_data.get("name")
        return data


class RepositoryListResponse(BaseModel):
    """
    Paginated collection of repository items.
    """

    total_count: int = Field(default=0, ge=0)
    items: List[RepositoryResponse] = Field(default_factory=list)
