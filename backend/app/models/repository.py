from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import BigInteger, Boolean, Column, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.models.base import Base


class RepositoryRecord(Base):
    """
    SQLAlchemy model storing GitHub repository metadata, documentation, and vector embeddings.
    """

    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    github_id = Column(BigInteger, unique=True, index=True, nullable=False)
    owner = Column(String(100), index=True, nullable=False)
    name = Column(String(100), index=True, nullable=False)
    full_name = Column(String(250), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    html_url = Column(String(500), nullable=False)
    language = Column(String(100), index=True, nullable=True)
    stars = Column(Integer, default=0, index=True, nullable=False)
    forks = Column(Integer, default=0, nullable=False)
    open_issues = Column(Integer, default=0, nullable=False)
    topics = Column(JSON, default=list, nullable=False)
    license = Column(String(100), nullable=True)
    default_branch = Column(String(100), default="main", nullable=False)

    # Documentation content
    readme_raw = Column(Text, nullable=True)
    readme_clean = Column(Text, nullable=True)
    is_indexed = Column(Boolean, default=False, index=True, nullable=False)
    indexed_at = Column(DateTime(timezone=True), nullable=True)

    # Semantic embedding vector (384-d for sentence-transformers/all-MiniLM-L6-v2)
    embedding = Column(Vector(384), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    chunks = relationship(
        "RepositoryDocChunk",
        back_populates="repository",
        cascade="all, delete-orphan",
        order_by="RepositoryDocChunk.chunk_index",
    )
    conversations = relationship(
        "ChatConversation",
        back_populates="repository",
        cascade="all, delete-orphan",
    )
