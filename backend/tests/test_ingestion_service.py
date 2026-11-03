from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import IngestionException
from app.models.repository import RepositoryRecord
from app.schemas.repository import RepositoryResponse
from app.services.ingestion_service import IngestionService

SAMPLE_MARKDOWN = """# MediBot AI
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://shields.io)
<div align="center">
  <img src="logo.png" alt="Logo" />
</div>

## Overview
MediBot is an open-source clinical assistant chatbot using FastAPI and React.

## Installation
Run the following commands to install dependencies:
```bash
pip install -r requirements.txt
npm install
```

## Usage
Start the development server with:
```bash
uvicorn app.main:app --reload
```
"""


def test_clean_markdown():
    """Test markdown cleaning removes badges and HTML while preserving headers and code."""
    service = IngestionService()
    cleaned = service.clean_markdown(SAMPLE_MARKDOWN)

    assert "[![Build]" not in cleaned
    assert "https://img.shields.io" not in cleaned
    assert "<div" not in cleaned
    assert "<img" not in cleaned
    assert "## Overview" in cleaned
    assert "## Installation" in cleaned
    assert "pip install" in cleaned


def test_chunk_documentation():
    """Test documentation chunking creates meaningful chunks with section headers."""
    service = IngestionService(chunk_size=200, chunk_overlap=40)
    cleaned = service.clean_markdown(SAMPLE_MARKDOWN)
    chunks = service.chunk_documentation(cleaned)

    assert len(chunks) >= 3
    headers = [h for h, _ in chunks]
    assert any("Overview" in (h or "") for h in headers)
    assert any("Installation" in (h or "") for h in headers)
    assert any("Usage" in (h or "") for h in headers)


@pytest.mark.anyio
async def test_readme_ingestion_failure_no_readme():
    """Test that repository without README raises IngestionException."""
    service = IngestionService()
    mock_db = MagicMock(spec=AsyncSession)

    with patch(
        "app.services.ingestion_service.github_service.get_repository_readme",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(IngestionException) as exc_info:
            await service.index_repository("owner", "noreadme-repo", mock_db)

        assert "does not have a README file" in exc_info.value.message


@pytest.mark.anyio
async def test_successful_indexing_and_duplicate_prevention():
    """Test repository indexing creates or updates repository record without duplicates."""
    service = IngestionService()

    mock_db = AsyncMock(spec=AsyncSession)
    # Mock database select returning existing record
    existing_repo = RepositoryRecord(
        id=42,
        github_id=9999,
        owner="owner",
        name="test-repo",
        full_name="owner/test-repo",
        is_indexed=False,
    )
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = existing_repo
    mock_db.execute.return_value = mock_result

    sample_meta = RepositoryResponse(
        id=9999,
        name="test-repo",
        full_name="owner/test-repo",
        owner="owner",
        html_url="https://github.com/owner/test-repo",
        stars=150,
        forks=20,
    )

    with patch(
        "app.services.ingestion_service.github_service.get_repository_readme",
        new_callable=AsyncMock,
        return_value=SAMPLE_MARKDOWN,
    ), patch(
        "app.services.ingestion_service.github_service.get_repository",
        new_callable=AsyncMock,
        return_value=sample_meta,
    ), patch(
        "app.services.ingestion_service.embedding_service.generate_batch_embeddings",
        return_value=[[0.1] * 384] * 5,
    ), patch(
        "app.services.ingestion_service.embedding_service.generate_embedding",
        return_value=[0.1] * 384,
    ):
        result = await service.index_repository("owner", "test-repo", mock_db)

        assert result["is_indexed"] is True
        assert result["repository_id"] == 42
        assert result["full_name"] == "owner/test-repo"
        assert result["chunks_count"] > 0
        mock_db.commit.assert_awaited_once()
