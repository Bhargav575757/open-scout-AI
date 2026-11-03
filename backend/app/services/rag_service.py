import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Union
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.exceptions import (
    MistralAPIException,
    RAGException,
    RepositoryNotIndexedException,
    ResourceNotFoundException,
)
from app.core.logging import get_logger
from app.models.chat import ChatConversation, ChatMessage
from app.models.documentation import RepositoryDocChunk
from app.models.repository import RepositoryRecord
from app.prompts.rag_prompts import RAG_CHAT_SYSTEM_PROMPT, RAG_CHAT_USER_TEMPLATE
from app.schemas.rag import ChatResponse, ChatSource
from app.services.embedding_service import embedding_service
from app.services.mistral_service import mistral_service

logger = get_logger("app.services.rag")


class RAGService:
    """
    RAG (Retrieval-Augmented Generation) service for repository documentation question-answering.
    Retrieves semantic document chunks from pgvector and synthesizes grounded answers with Mistral AI.
    """

    def __init__(self, top_k: Optional[int] = None):
        self.top_k = top_k or settings.RAG_TOP_K

    async def _resolve_repository(
        self,
        repo_id_or_slug: Union[int, str],
        db: AsyncSession,
    ) -> RepositoryRecord:
        """
        Locates the repository in PostgreSQL by internal ID, GitHub numeric ID, or 'owner/repo' slug.
        """
        query_val = str(repo_id_or_slug).strip()

        stmt = select(RepositoryRecord).where(
            (RepositoryRecord.id == int(query_val)) if query_val.isdigit() else False
        )
        res = await db.execute(stmt)
        record = res.scalars().first()

        if record is None and query_val.isdigit():
            # Check by github_id
            stmt = select(RepositoryRecord).where(RepositoryRecord.github_id == int(query_val))
            res = await db.execute(stmt)
            record = res.scalars().first()

        if record is None and "/" in query_val:
            # Check by full_name
            stmt = select(RepositoryRecord).where(RepositoryRecord.full_name.ilike(query_val))
            res = await db.execute(stmt)
            record = res.scalars().first()

        if record is None or not record.is_indexed:
            logger.warning("Repository '%s' not found or not indexed.", query_val)
            raise RepositoryNotIndexedException(
                f"Repository '{query_val}' has not been indexed yet. Please index its README before asking questions.",
                details={"repository": query_val},
            )

        return record

    async def retrieve_relevant_chunks(
        self,
        repository_id: int,
        question: str,
        db: AsyncSession,
    ) -> List[Tuple[RepositoryDocChunk, float]]:
        """
        Retrieves top-k documentation chunks for the repository using vector cosine similarity.
        """
        # Generate question embedding vector
        question_vector = embedding_service.generate_embedding(question)

        bind = db.bind or db.get_bind()
        dialect_name = bind.dialect.name if bind else "postgresql"

        chunk_results: List[Tuple[RepositoryDocChunk, float]] = []

        if dialect_name == "postgresql":
            try:
                # pgvector cosine distance: distance = 1 - cosine_similarity
                distance_col = RepositoryDocChunk.embedding.cosine_distance(question_vector).label("distance")
                stmt = (
                    select(RepositoryDocChunk, distance_col)
                    .where(
                        RepositoryDocChunk.repository_id == repository_id,
                        RepositoryDocChunk.embedding.isnot(None),
                    )
                    .order_by("distance")
                    .limit(self.top_k)
                )
                res = await db.execute(stmt)
                for chunk, dist in res.all():
                    sim = max(0.0, min(1.0, 1.0 - float(dist if dist is not None else 1.0)))
                    chunk_results.append((chunk, round(sim, 4)))
                return chunk_results
            except Exception as pg_err:
                logger.warning("PostgreSQL chunk retrieval failed, falling back to in-memory: %s", pg_err)

        # Fallback / SQLite mode (used in test suite or non-pg DB)
        stmt = select(RepositoryDocChunk).where(RepositoryDocChunk.repository_id == repository_id)
        res = await db.execute(stmt)
        all_chunks = res.scalars().all()

        scored: List[Tuple[RepositoryDocChunk, float]] = []
        for chk in all_chunks:
            if chk.embedding is not None:
                sim = embedding_service.compute_similarity(question_vector, chk.embedding)
            else:
                chk_emb = embedding_service.generate_embedding(chk.content)
                sim = embedding_service.compute_similarity(question_vector, chk_emb)
            scored.append((chk, round(sim, 4)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[: self.top_k]

    async def answer_question(
        self,
        repo_id_or_slug: Union[int, str],
        question: str,
        db: AsyncSession,
        conversation_id: Optional[str] = None,
    ) -> ChatResponse:
        """
        Executes end-to-end RAG pipeline:
        1. Resolves repository and checks index state
        2. Retrieves top-k relevant chunks from pgvector
        3. Synthesizes answer using Mistral AI
        4. Persists conversation and messages in PostgreSQL
        """
        clean_question = question.strip()
        repo = await self._resolve_repository(repo_id_or_slug, db)

        # Retrieve relevant chunks
        scored_chunks = await self.retrieve_relevant_chunks(repo.id, clean_question, db)

        sources: List[ChatSource] = []
        context_parts: List[str] = []

        for chk, sim in scored_chunks:
            header = chk.section_header or "Documentation"
            context_parts.append(f"### [Section: {header}]\n{chk.content}")
            sources.append(
                ChatSource(
                    chunk_index=chk.chunk_index,
                    section_header=chk.section_header,
                    snippet=chk.content[:250] + ("..." if len(chk.content) > 250 else ""),
                    similarity_score=sim,
                )
            )

        context_text = "\n\n".join(context_parts) if context_parts else "No documentation excerpts available."

        # Format prompt
        user_prompt = RAG_CHAT_USER_TEMPLATE.format(
            repository_name=repo.full_name,
            repository_description=repo.description or "Open source software project",
            context_chunks=context_text,
            question=clean_question,
        )

        # Query Mistral AI
        client = mistral_service.get_client()
        messages = [
            {"role": "system", "content": RAG_CHAT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        logger.info(
            "Querying Mistral AI for RAG answer on repo='%s', chunks=%d",
            repo.full_name,
            len(scored_chunks),
        )

        try:
            response = await client.chat.complete_async(
                model=mistral_service.model,
                messages=messages,
                timeout_ms=int(mistral_service.timeout * 1000),
            )
            raw_answer = response.choices[0].message.content
            answer = raw_answer if isinstance(raw_answer, str) else str(raw_answer)
        except Exception as exc:
            logger.error("Mistral AI call failed during RAG synthesis: %s", exc)
            raise RAGException(
                f"Failed to generate RAG response from Mistral AI: {str(exc)}",
                details={"error": str(exc)},
            ) from exc

        # Check for insufficient context indicators
        insufficient_phrases = [
            "not mentioned",
            "not detailed",
            "insufficient information",
            "does not contain",
            "no mention of",
        ]
        insufficient = any(phrase in answer.lower() for phrase in insufficient_phrases)

        # Persist conversation session
        conv_id = conversation_id.strip() if conversation_id and conversation_id.strip() else str(uuid.uuid4())
        stmt = select(ChatConversation).where(ChatConversation.id == conv_id)
        res = await db.execute(stmt)
        conversation = res.scalars().first()

        now = datetime.now(timezone.utc)

        if conversation is None:
            conversation = ChatConversation(
                id=conv_id,
                repository_id=repo.id,
                title=clean_question[:80],
                created_at=now,
                updated_at=now,
            )
            db.add(conversation)
            await db.flush()

        # Save user message and assistant answer
        user_msg = ChatMessage(
            conversation_id=conv_id,
            role="user",
            content=clean_question,
            sources=[],
            created_at=now,
        )
        assistant_msg = ChatMessage(
            conversation_id=conv_id,
            role="assistant",
            content=answer,
            sources=[s.model_dump() for s in sources],
            created_at=now,
        )

        db.add(user_msg)
        db.add(assistant_msg)
        conversation.updated_at = now

        await db.commit()

        return ChatResponse(
            conversation_id=conv_id,
            repository_id=repo.id,
            full_name=repo.full_name,
            question=clean_question,
            answer=answer,
            sources=sources,
            insufficient_context=insufficient,
        )

    async def get_conversation_history(
        self,
        conversation_id: str,
        db: AsyncSession,
    ) -> List[ChatMessage]:
        """
        Retrieves the chronologically ordered messages for a conversation session.
        """
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conversation_id.strip())
            .order_by(ChatMessage.created_at.asc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())


# Global singleton instance
rag_service = RAGService()
