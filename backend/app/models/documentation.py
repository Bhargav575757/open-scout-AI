from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.models.base import Base


class RepositoryDocChunk(Base):
    """
    SQLAlchemy model storing fragmented documentation text chunks and their embeddings.
    """

    __tablename__ = "repository_doc_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    repository_id = Column(
        Integer,
        ForeignKey("repositories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_index = Column(Integer, nullable=False, index=True)
    section_header = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=True)

    # Dense vector embedding (384 dimensions)
    embedding = Column(Vector(384), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    repository = relationship("RepositoryRecord", back_populates="chunks")
