from datetime import datetime
from typing import Any, List, Optional, Union
from pydantic import BaseModel, Field, field_validator
from app.schemas.repository import RepositoryResponse


class IndexRepositoryRequest(BaseModel):
    """
    Request to trigger documentation ingestion for a repository.
    """

    force_refresh: bool = Field(
        default=False,
        description="Force re-fetching README and regenerating embeddings even if already indexed",
    )


class IndexRepositoryResponse(BaseModel):
    """
    Result of repository README indexing operation.
    """

    success: bool = Field(default=True)
    repository_id: int = Field(..., description="Internal database repository record ID")
    full_name: str = Field(..., description="owner/repo slug")
    is_indexed: bool = Field(default=True)
    chunks_count: int = Field(default=0, description="Total documentation chunks generated and embedded")
    message: str = Field(default="Repository indexed successfully.")


class IndexStatusResponse(BaseModel):
    """
    Current indexing status of a repository.
    """

    repository_id: Optional[int] = Field(default=None)
    full_name: str
    is_indexed: bool = Field(default=False)
    indexed_at: Optional[str] = Field(default=None)
    chunks_count: int = Field(default=0)


class SemanticSearchRequest(BaseModel):
    """
    Request parameters for semantic vector similarity search.
    """

    query: str = Field(..., min_length=1, max_length=1000, description="Natural language search concept")
    language: Optional[str] = Field(default=None, description="Optional programming language filter")
    min_stars: Optional[int] = Field(default=None, ge=0, description="Optional minimum stars filter")
    limit: int = Field(default=10, ge=1, le=50, description="Number of results per page")
    page: int = Field(default=1, ge=1, le=100, description="Page number")

    @field_validator("query")
    @classmethod
    def validate_query_not_blank(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Query string cannot be empty or purely whitespace.")
        return trimmed


class SemanticSearchResponse(BaseModel):
    """
    Results of semantic repository discovery.
    """

    query: str
    total_count: int = Field(default=0)
    page: int = Field(default=1)
    per_page: int = Field(default=10)
    items: List[RepositoryResponse] = Field(default_factory=list)


class ChatSource(BaseModel):
    """
    Supporting documentation evidence retrieved for a RAG response.
    """

    chunk_index: int
    section_header: Optional[str] = None
    snippet: str
    similarity_score: Optional[float] = None


class ChatRequest(BaseModel):
    """
    User question submitted to the repository RAG chatbot.
    """

    repository_id: Union[int, str] = Field(
        ...,
        description="Database repository ID, GitHub numeric ID, or 'owner/repo' identifier",
    )
    question: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Question regarding repository installation, features, tech stack, or architecture",
    )
    conversation_id: Optional[str] = Field(
        default=None,
        description="Optional existing conversation UUID to maintain session history",
    )

    @field_validator("question")
    @classmethod
    def validate_question_not_blank(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Question cannot be empty or purely whitespace.")
        return trimmed


class ChatResponse(BaseModel):
    """
    RAG answer synthesized by Mistral AI grounded strictly in retrieved documentation chunks.
    """

    conversation_id: str = Field(..., description="Conversation session UUID")
    repository_id: int
    full_name: str
    question: str
    answer: str
    sources: List[ChatSource] = Field(
        default_factory=list,
        description="List of retrieved documentation chunks used as evidence",
    )
    insufficient_context: bool = Field(
        default=False,
        description="True if documentation was insufficient to fully answer the question",
    )


class ChatMessageResponse(BaseModel):
    """
    Single persisted chat message record.
    """

    id: int
    role: str
    content: str
    sources: List[ChatSource] = Field(default_factory=list)
    created_at: str


class ConversationHistoryResponse(BaseModel):
    """
    Full message history for a conversation session.
    """

    conversation_id: str
    repository_id: int
    messages: List[ChatMessageResponse] = Field(default_factory=list)
