from typing import List, Optional
from pydantic import BaseModel, Field


class RepositoryResponse(BaseModel):
    """
    Standard schema representing GitHub repository metadata.
    """

    id: str = Field(..., description="Unique repository identifier or slug", examples=["medibot-ai-fastapi"])
    name: str = Field(..., description="Repository short name", examples=["MediBot-AI"])
    full_name: str = Field(..., description="Full owner/repository name", examples=["healthtech-labs/medibot-ai"])
    description: Optional[str] = Field(
        default=None,
        description="Repository summary or purpose",
        examples=["Conversational AI chatbot for clinical triage and symptoms inquiry"],
    )
    html_url: str = Field(
        ...,
        description="Direct URL to GitHub repository",
        examples=["https://github.com/healthtech-labs/medibot-ai"],
    )
    language: Optional[str] = Field(default=None, description="Primary programming language", examples=["Python"])
    stars: int = Field(default=0, ge=0, description="Total stargazers count", examples=[8420])
    forks: int = Field(default=0, ge=0, description="Total forks count", examples=[1140])
    topics: List[str] = Field(default_factory=list, description="Associated GitHub topic tags", examples=[["healthcare", "fastapi", "react"]])
    license: Optional[str] = Field(default=None, description="Software license identifier", examples=["Apache-2.0"])
    open_issues: Optional[int] = Field(default=None, ge=0, description="Count of open GitHub issues")
    last_updated: Optional[str] = Field(default=None, description="Timestamp of latest commit or push")
