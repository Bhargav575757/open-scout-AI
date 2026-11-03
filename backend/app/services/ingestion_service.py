import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    GitHubResourceNotFoundException,
    IngestionException,
    ResourceNotFoundException,
)
from app.core.logging import get_logger
from app.models.documentation import RepositoryDocChunk
from app.models.repository import RepositoryRecord
from app.services.embedding_service import embedding_service
from app.services.github_service import github_service

logger = get_logger("app.services.ingestion")


class IngestionService:
    """
    Service responsible for fetching repository README documentation from GitHub,
    cleaning markdown, chunking into semantic segments, generating vector embeddings,
    and persisting the structured index in PostgreSQL with pgvector.
    """

    def __init__(
        self,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
        max_chars: Optional[int] = None,
    ):
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP
        self.max_chars = max_chars or settings.DOC_MAX_CHARS

    def clean_markdown(self, raw_md: str) -> str:
        """
        Strips noise from raw markdown while preserving meaningful documentation,
        section headings, bullet points, and code instructions.
        """
        if not raw_md:
            return ""

        # Enforce maximum character limit to prevent resource exhaustion
        text = raw_md[: self.max_chars]

        # 1. Remove HTML comments
        text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)

        # 2. Remove SVG/shield badges like [![Build](https://img.shields.io/...)](...)
        text = re.sub(r"\[!\[.*?\]\(.*?\)\]\(.*?\)", "", text)
        text = re.sub(r"!\[.*?\]\(.*?\)", "", text)

        # 3. Strip common HTML tags (<div ...>, </p>, <br/>, <img ...>)
        text = re.sub(r"<[^>]+>", " ", text)

        # 4. Normalize multiple blank lines into at most two
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    def chunk_documentation(self, cleaned_md: str) -> List[Tuple[Optional[str], str]]:
        """
        Divides documentation text into meaningful chunks, preserving section headers.
        Returns a list of (section_header, chunk_content) tuples.
        """
        if not cleaned_md:
            return []

        # Split into sections based on markdown headings (# Heading, ## Subheading)
        heading_pattern = re.compile(r"^(#{1,4}\s+.+)$", re.MULTILINE)
        splits = heading_pattern.split(cleaned_md)

        sections: List[Tuple[Optional[str], str]] = []
        current_header: Optional[str] = "Overview"

        i = 0
        while i < len(splits):
            part = splits[i].strip()
            if not part:
                i += 1
                continue

            if heading_pattern.match(splits[i]):
                # Strip markdown hashes for a clean header label
                current_header = re.sub(r"^#{1,4}\s+", "", part).strip()
                i += 1
                if i < len(splits):
                    section_body = splits[i].strip()
                    if section_body:
                        sections.append((current_header, section_body))
                    i += 1
            else:
                sections.append((current_header, part))
                i += 1

        # Now subdivide oversized sections with overlap
        chunks: List[Tuple[Optional[str], str]] = []

        for header, body in sections:
            if len(body) <= self.chunk_size:
                chunks.append((header, body))
            else:
                # Sliding window chunking
                start = 0
                while start < len(body):
                    end = start + self.chunk_size
                    # Try to break on newline or space boundary if not at end
                    if end < len(body):
                        break_pos = body.rfind("\n", start, end)
                        if break_pos == -1 or break_pos < start + (self.chunk_size // 2):
                            break_pos = body.rfind(" ", start, end)
                        if break_pos != -1 and break_pos > start:
                            end = break_pos

                    chunk_text = body[start:end].strip()
                    if chunk_text:
                        chunks.append((header, chunk_text))

                    start = end - self.chunk_overlap
                    if start >= len(body) or end >= len(body):
                        break

        # Impose a hard ceiling of 40 chunks per repository to keep inference fast
        return chunks[:40]

    async def index_repository(
        self,
        owner: str,
        repo: str,
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Retrieves README from GitHub, creates or updates the RepositoryRecord,
        chunks documentation, generates vector embeddings, and stores in PostgreSQL.
        """
        full_name = f"{owner.strip().lower()}/{repo.strip().lower()}"
        logger.info("Starting documentation ingestion for repository: %s", full_name)

        # 1. Fetch README content from GitHub REST API
        raw_readme = await github_service.get_repository_readme(owner, repo)
        if not raw_readme or not raw_readme.strip():
            logger.warning("Repository %s has no README content available to index.", full_name)
            raise IngestionException(
                f"Repository '{full_name}' does not have a README file to index.",
                details={"owner": owner, "repo": repo},
            )

        # 2. Fetch repository metadata from GitHub to ensure up-to-date record
        repo_data = await github_service.get_repository(f"{owner}/{repo}")

        # 3. Clean markdown and chunk
        clean_text = self.clean_markdown(raw_readme)
        raw_chunks = self.chunk_documentation(clean_text)

        if not raw_chunks:
            raise IngestionException(
                f"Failed to generate documentation chunks from '{full_name}' README.",
                details={"clean_text_length": len(clean_text)},
            )

        logger.info("Generated %d chunks from %s documentation.", len(raw_chunks), full_name)

        # 4. Generate batch embeddings for all chunks
        chunk_texts_for_embedding = [
            f"{header or ''}: {content}" for header, content in raw_chunks
        ]
        chunk_embeddings = embedding_service.generate_batch_embeddings(chunk_texts_for_embedding)

        # 5. Generate repository-level summary embedding
        repo_summary = (
            f"{repo_data.full_name} {repo_data.description or ''} "
            f"{' '.join(repo_data.topics or [])} {repo_data.language or ''}"
        )
        repo_embedding = embedding_service.generate_embedding(repo_summary)

        # 6. Database upsert: locate existing repository record or create new
        stmt = select(RepositoryRecord).where(
            (RepositoryRecord.full_name.ilike(full_name)) | (RepositoryRecord.github_id == repo_data.id)
        )
        result = await db.execute(stmt)
        repo_record = result.scalars().first()

        now = datetime.now(timezone.utc)

        if repo_record is None:
            repo_record = RepositoryRecord(
                github_id=repo_data.id,
                owner=repo_data.owner,
                name=repo_data.name,
                full_name=repo_data.full_name,
                description=repo_data.description,
                html_url=str(repo_data.html_url),
                language=repo_data.language,
                stars=repo_data.stars,
                forks=repo_data.forks,
                open_issues=repo_data.open_issues_count or 0,
                topics=repo_data.topics or [],
                license=repo_data.license,
                default_branch=repo_data.default_branch or "main",
                readme_raw=raw_readme[: self.max_chars],
                readme_clean=clean_text,
                is_indexed=True,
                indexed_at=now,
                embedding=repo_embedding,
            )
            db.add(repo_record)
            await db.flush()  # populate repo_record.id
        else:
            # Update existing record
            repo_record.description = repo_data.description
            repo_record.stars = repo_data.stars
            repo_record.forks = repo_data.forks
            repo_record.topics = repo_data.topics or []
            repo_record.readme_raw = raw_readme[: self.max_chars]
            repo_record.readme_clean = clean_text
            repo_record.is_indexed = True
            repo_record.indexed_at = now
            repo_record.embedding = repo_embedding

            # Delete old chunks prior to re-indexing
            await db.execute(
                delete(RepositoryDocChunk).where(RepositoryDocChunk.repository_id == repo_record.id)
            )

        # 7. Insert new chunk records
        doc_chunk_models: List[RepositoryDocChunk] = []
        for idx, ((header, content), emb) in enumerate(zip(raw_chunks, chunk_embeddings)):
            chunk_model = RepositoryDocChunk(
                repository_id=repo_record.id,
                chunk_index=idx,
                section_header=header,
                content=content,
                token_count=len(content.split()),
                embedding=emb,
                created_at=now,
            )
            doc_chunk_models.append(chunk_model)

        db.add_all(doc_chunk_models)
        await db.commit()
        await db.refresh(repo_record)

        logger.info(
            "Successfully indexed repository %s (ID: %d) with %d chunks.",
            full_name,
            repo_record.id,
            len(doc_chunk_models),
        )

        return {
            "repository_id": repo_record.id,
            "full_name": repo_record.full_name,
            "is_indexed": True,
            "indexed_at": repo_record.indexed_at.isoformat() if repo_record.indexed_at else None,
            "chunks_count": len(doc_chunk_models),
            "clean_char_length": len(clean_text),
        }

    async def get_index_status(
        self,
        owner: str,
        repo: str,
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Checks whether a repository has been indexed in PostgreSQL and returns chunk count.
        """
        full_name = f"{owner.strip().lower()}/{repo.strip().lower()}"
        stmt = select(RepositoryRecord).where(RepositoryRecord.full_name.ilike(full_name))
        result = await db.execute(stmt)
        record = result.scalars().first()

        if record is None or not record.is_indexed:
            return {
                "full_name": f"{owner}/{repo}",
                "is_indexed": False,
                "indexed_at": None,
                "chunks_count": 0,
            }

        # Count chunks
        chunk_count_stmt = select(RepositoryDocChunk).where(RepositoryDocChunk.repository_id == record.id)
        chunk_res = await db.execute(chunk_count_stmt)
        chunks = chunk_res.scalars().all()

        return {
            "repository_id": record.id,
            "full_name": record.full_name,
            "is_indexed": True,
            "indexed_at": record.indexed_at.isoformat() if record.indexed_at else None,
            "chunks_count": len(chunks),
        }


# Global singleton instance
ingestion_service = IngestionService()
