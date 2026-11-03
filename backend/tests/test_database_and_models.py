from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from sqlalchemy.exc import OperationalError

from app.core.database import check_database_health, get_normalized_database_url
from app.core.exceptions import DatabaseConnectionException
from app.models.chat import ChatConversation, ChatMessage
from app.models.documentation import RepositoryDocChunk
from app.models.repository import RepositoryRecord


def test_database_url_normalization():
    """Test URL normalization converts postgresql:// to postgresql+asyncpg:// and normalizes sslmode."""
    pg_url = "postgresql://user:pass@localhost:5432/testdb"
    normalized = get_normalized_database_url(pg_url)
    assert normalized == "postgresql+asyncpg://user:pass@localhost:5432/testdb"

    asyncpg_url = "postgresql+asyncpg://user:pass@localhost:5432/testdb"
    assert get_normalized_database_url(asyncpg_url) == asyncpg_url

    render_url = "postgres://user:pass@host.render.com:5432/db"
    assert get_normalized_database_url(render_url) == "postgresql+asyncpg://user:pass@host.render.com:5432/db"

    sqlite_url = "sqlite:///test.db"
    assert get_normalized_database_url(sqlite_url) == "sqlite+aiosqlite:///test.db"

    # Supabase session pooler connection URL test
    supabase_url = "postgresql://postgres.myproject:secretpassword@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
    expected_supabase = "postgresql+asyncpg://postgres.myproject:secretpassword@aws-0-us-east-1.pooler.supabase.com:5432/postgres?ssl=require"
    assert get_normalized_database_url(supabase_url) == expected_supabase

    # Fallback when empty or None
    assert get_normalized_database_url("   ") == "postgresql+asyncpg://postgres:postgres@localhost:5432/openscout"


def test_model_instantiation():
    """Test creating SQLAlchemy database model instances with appropriate attributes."""
    repo = RepositoryRecord(
        github_id=12345,
        owner="test-owner",
        name="test-repo",
        full_name="test-owner/test-repo",
        description="A test repository for unit testing",
        html_url="https://github.com/test-owner/test-repo",
        language="Python",
        stars=100,
        forks=20,
        open_issues=5,
        topics=["python", "ai"],
        license="MIT",
        is_indexed=True,
    )
    assert repo.full_name == "test-owner/test-repo"
    assert repo.stars == 100
    assert repo.is_indexed is True

    chunk = RepositoryDocChunk(
        repository_id=1,
        chunk_index=0,
        section_header="Architecture",
        content="This project follows a modular 3-tier architecture.",
        token_count=8,
    )
    assert chunk.section_header == "Architecture"
    assert chunk.chunk_index == 0

    conv = ChatConversation(
        id="conv-uuid-123",
        repository_id=1,
        title="Installation Questions",
    )
    assert conv.id == "conv-uuid-123"

    msg = ChatMessage(
        conversation_id="conv-uuid-123",
        role="user",
        content="How do I get started?",
    )
    assert msg.role == "user"


@pytest.mark.anyio
async def test_database_health_check_failure():
    """Test that connection error raises DatabaseConnectionException."""
    mock_engine = MagicMock()
    mock_connect = MagicMock()
    mock_connect.__aenter__.side_effect = OperationalError("Connection refused", None, None)
    mock_engine.connect.return_value = mock_connect

    with patch("app.core.database.get_engine", return_value=mock_engine):
        with pytest.raises(DatabaseConnectionException) as exc_info:
            await check_database_health()

        assert exc_info.value.status_code == 503
        assert "Could not connect" in exc_info.value.message


@pytest.mark.anyio
async def test_database_health_check_success():
    """Test successful database connection check."""
    mock_engine = MagicMock()
    mock_conn = AsyncMock()
    mock_connect = MagicMock()
    mock_connect.__aenter__.return_value = mock_conn
    mock_engine.connect.return_value = mock_connect

    with patch("app.core.database.get_engine", return_value=mock_engine):
        healthy = await check_database_health()
        assert healthy is True
