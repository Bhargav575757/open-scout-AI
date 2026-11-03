from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.models.documentation import RepositoryDocChunk
from app.models.repository import RepositoryRecord
from app.schemas.repository import RepositoryResponse
from app.schemas.search import SearchResponse
from app.services.embedding_service import embedding_service
from app.services.github_service import github_service

logger = get_logger("app.services.semantic_search")


class SemanticSearchService:
    """
    Executes semantic vector similarity searches over indexed GitHub repositories
    and their documentation chunks using Sentence Transformers and pgvector.
    """

    def __init__(self):
        pass

    async def search_repositories(
        self,
        query: str,
        db: AsyncSession,
        language: Optional[str] = None,
        min_stars: Optional[int] = None,
        limit: int = 10,
        page: int = 1,
    ) -> Dict[str, Any]:
        """
        Generates query embedding, searches pgvector embeddings in PostgreSQL,
        and returns ranked repository results with similarity scores.
        """
        clean_query = query.strip()
        logger.info("Executing semantic search for query: '%s' (limit=%d)", clean_query, limit)

        # 1. Generate query embedding vector
        query_vector = embedding_service.generate_embedding(clean_query)

        # 2. Inspect active database dialect
        bind = db.bind or db.get_bind()
        dialect_name = bind.dialect.name if bind else "postgresql"

        candidate_repos: Dict[int, Dict[str, Any]] = {}

        if dialect_name == "postgresql":
            try:
                # Use pgvector cosine distance operator (<=>)
                distance_col = RepositoryRecord.embedding.cosine_distance(query_vector).label("distance")
                stmt = select(RepositoryRecord, distance_col).where(
                    RepositoryRecord.is_indexed.is_(True),
                    RepositoryRecord.embedding.isnot(None),
                )

                if language and language.strip() and language != "All Languages":
                    stmt = stmt.where(RepositoryRecord.language.ilike(language.strip()))
                if min_stars and min_stars > 0:
                    stmt = stmt.where(RepositoryRecord.stars >= min_stars)

                stmt = stmt.order_by("distance").limit(limit * 2)
                res = await db.execute(stmt)
                rows = res.all()

                for repo_rec, dist in rows:
                    similarity = max(0.0, min(1.0, 1.0 - float(dist if dist is not None else 1.0)))
                    candidate_repos[repo_rec.id] = {
                        "record": repo_rec,
                        "similarity": round(similarity, 4),
                        "best_chunk": None,
                    }

                # Also search doc chunks for finer-grained conceptual matches
                chunk_dist_col = RepositoryDocChunk.embedding.cosine_distance(query_vector).label("distance")
                chunk_stmt = select(RepositoryDocChunk, chunk_dist_col).where(
                    RepositoryDocChunk.embedding.isnot(None)
                ).order_by("distance").limit(limit * 3)

                chunk_res = await db.execute(chunk_stmt)
                chunk_rows = chunk_res.all()

                for chunk_rec, dist in chunk_rows:
                    similarity = max(0.0, min(1.0, 1.0 - float(dist if dist is not None else 1.0)))
                    repo_id = chunk_rec.repository_id
                    if repo_id in candidate_repos:
                        if similarity > candidate_repos[repo_id]["similarity"]:
                            candidate_repos[repo_id]["similarity"] = round(similarity, 4)
                            candidate_repos[repo_id]["best_chunk"] = chunk_rec.section_header

            except Exception as pg_err:
                logger.warning("PostgreSQL pgvector query failed, falling back to in-memory similarity: %s", pg_err)
                dialect_name = "fallback"

        if dialect_name != "postgresql" or not candidate_repos:
            # Fallback or SQLite/in-memory mode for unit tests and local non-pg instances
            stmt = select(RepositoryRecord).where(RepositoryRecord.is_indexed.is_(True))
            if language and language.strip() and language != "All Languages":
                stmt = stmt.where(RepositoryRecord.language.ilike(language.strip()))
            if min_stars and min_stars > 0:
                stmt = stmt.where(RepositoryRecord.stars >= min_stars)

            res = await db.execute(stmt)
            records = res.scalars().all()

            for repo_rec in records:
                score = 0.0
                if repo_rec.embedding is not None:
                    score = embedding_service.compute_similarity(query_vector, repo_rec.embedding)
                else:
                    # Synthesize basic text similarity if embedding was not precomputed
                    summary = f"{repo_rec.name} {repo_rec.description or ''} {' '.join(repo_rec.topics or [])}"
                    summary_emb = embedding_service.generate_embedding(summary)
                    score = embedding_service.compute_similarity(query_vector, summary_emb)

                candidate_repos[repo_rec.id] = {
                    "record": repo_rec,
                    "similarity": round(score, 4),
                    "best_chunk": None,
                }

        # Sort candidates descending by similarity
        sorted_candidates = sorted(
            candidate_repos.values(),
            key=lambda x: x["similarity"],
            reverse=True,
        )

        # Pagination slice
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paged_candidates = sorted_candidates[start_idx:end_idx]

        items: List[RepositoryResponse] = []
        for cand in paged_candidates:
            rec: RepositoryRecord = cand["record"]
            sim = cand["similarity"]
            match_pct = int(sim * 100)
            chunk_note = f" in '{cand['best_chunk']}'" if cand["best_chunk"] else ""
            match_reason = f"Semantic match ({match_pct}% relevance{chunk_note}) for '{clean_query}'"

            repo_resp = RepositoryResponse(
                id=rec.github_id,
                name=rec.name,
                full_name=rec.full_name,
                owner=rec.owner,
                owner_avatar_url=f"https://github.com/{rec.owner}.png",
                description=rec.description or "No description provided.",
                html_url=rec.html_url,
                language=rec.language or "Various",
                stars=rec.stars,
                forks=rec.forks,
                open_issues_count=rec.open_issues,
                watchers_count=rec.stars,
                topics=rec.topics or [],
                license=rec.license,
                created_at=rec.created_at,
                updated_at=rec.updated_at,
                default_branch=rec.default_branch,
                match_reason=match_reason,
                similarity_score=sim,
                is_indexed=True,
            )
            items.append(repo_resp)

        return {
            "query": clean_query,
            "total_count": len(sorted_candidates),
            "page": page,
            "per_page": limit,
            "items": items,
        }


# Global singleton instance
semantic_search_service = SemanticSearchService()
