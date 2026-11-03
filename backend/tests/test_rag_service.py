from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import RAGException, RepositoryNotIndexedException
from app.models.documentation import RepositoryDocChunk
from app.models.repository import RepositoryRecord
from app.services.rag_service import RAGService


@pytest.mark.anyio
async def test_repository_not_indexed_raises_exception():
    """Test questioning a repository that is not indexed raises RepositoryNotIndexedException."""
    service = RAGService()
    mock_db = AsyncMock(spec=AsyncSession)

    # Return None for query
    mock_res = MagicMock()
    mock_res.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_res

    with pytest.raises(RepositoryNotIndexedException):
        await service.answer_question("unindexed/repo", "How do I install this?", mock_db)


@pytest.mark.anyio
async def test_rag_answer_with_context():
    """Test successful RAG answer generation using retrieved chunks."""
    service = RAGService()
    mock_db = AsyncMock(spec=AsyncSession)

    indexed_repo = RepositoryRecord(
        id=1,
        github_id=123,
        owner="owner",
        name="medibot",
        full_name="owner/medibot",
        description="Healthcare assistant",
        is_indexed=True,
    )
    chunk = RepositoryDocChunk(
        id=10,
        repository_id=1,
        chunk_index=0,
        section_header="Installation",
        content="Run pip install -r requirements.txt to install dependencies.",
    )

    mock_repo_res = MagicMock()
    mock_repo_res.scalars.return_value.first.return_value = indexed_repo

    mock_db.execute.return_value = mock_repo_res

    mock_mistral_response = MagicMock()
    mock_mistral_response.choices = [
        MagicMock(message=MagicMock(content="To install MediBot, run `pip install -r requirements.txt`."))
    ]

    with patch.object(service, "retrieve_relevant_chunks", new_callable=AsyncMock, return_value=[(chunk, 0.88)]), \
         patch("app.services.rag_service.mistral_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.chat.complete_async = AsyncMock(return_value=mock_mistral_response)
        mock_get_client.return_value = mock_client

        response = await service.answer_question(
            "owner/medibot",
            "How do I install this project?",
            mock_db,
        )

        assert response.repository_id == 1
        assert response.full_name == "owner/medibot"
        assert "pip install" in response.answer
        assert len(response.sources) == 1
        assert response.sources[0].section_header == "Installation"
        assert response.insufficient_context is False


@pytest.mark.anyio
async def test_rag_insufficient_context_flag():
    """Test that insufficient context phrases set insufficient_context=True."""
    service = RAGService()
    mock_db = AsyncMock(spec=AsyncSession)

    indexed_repo = RepositoryRecord(
        id=1,
        github_id=123,
        owner="owner",
        name="medibot",
        full_name="owner/medibot",
        is_indexed=True,
    )
    mock_repo_res = MagicMock()
    mock_repo_res.scalars.return_value.first.return_value = indexed_repo
    mock_db.execute.return_value = mock_repo_res

    mock_mistral_response = MagicMock()
    mock_mistral_response.choices = [
        MagicMock(
            message=MagicMock(
                content="Based on the available documentation in this repository, this information is not mentioned."
            )
        )
    ]

    with patch.object(service, "retrieve_relevant_chunks", new_callable=AsyncMock, return_value=[]), \
         patch("app.services.rag_service.mistral_service.get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.chat.complete_async = AsyncMock(return_value=mock_mistral_response)
        mock_get_client.return_value = mock_client

        response = await service.answer_question(
            "owner/medibot",
            "What is the CEO's favorite movie?",
            mock_db,
        )

        assert response.insufficient_context is True
        assert "not mentioned" in response.answer.lower()
