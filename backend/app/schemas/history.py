from typing import List
from pydantic import BaseModel, Field


class HistoryItem(BaseModel):
    """
    Schema representing a recorded search interaction.
    """

    id: str = Field(..., description="Unique search interaction ID", examples=["hist-101"])
    query: str = Field(..., description="Original search query text", examples=["AI healthcare chatbot using Python"])
    timestamp: str = Field(..., description="ISO 8601 formatted search timestamp")
    results_count: int = Field(default=0, ge=0, description="Number of results found")


class HistoryResponse(BaseModel):
    """
    Paginated collection of historical search queries.
    In Phase 3, this returns an empty collection as database persistence is staged for Phase 4+.
    """

    items: List[HistoryItem] = Field(
        default_factory=list,
        description="List of recorded search history entries",
    )
    total: int = Field(default=0, ge=0, description="Total count of search history items")
    message: str = Field(
        default="Search history database persistence is staged for Phase 4+. Returning empty collection.",
        description="Development status note",
    )

