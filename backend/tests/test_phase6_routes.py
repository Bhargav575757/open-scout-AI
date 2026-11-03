from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
import pytest

from app.core.database import get_db
from app.main import app
from app.models.chat import ChatMessage
from app.schemas.rag import ChatResponse, ChatSource
from app.schemas.repository import RepositoryResponse

client = TestClient(app)

SAMPLE_REPO = RepositoryResponse(
    id=101,
    name="health-bot",
    full_name="org/health-bot",
    owner="org",
    html_url="https://github.com/org/health-bot",
    language="Python",
    stars=350,
    forks=45,
    similarity_score=0.92,
    is_indexed=True,
)


@pytest.fixture
def mock_db_session():
    async def _mock_db():
        yield AsyncMock()

    app.dependency_overrides[get_db] = _mock_db
    yield
    app.dependency_overrides.pop(get_db, None)


def test_semantic_search_route(mock_db_session):
    """Test POST /api/v1/semantic-search returns matched repositories with similarity scores."""
    mock_search_result = {
        "query": "healthcare chatbot",
        "total_count": 1,
        "page": 1,
        "per_page": 10,
        "items": [SAMPLE_REPO],
    }

    with patch(
        "app.api.routes.search.semantic_search_service.search_repositories",
        new_callable=AsyncMock,
        return_value=mock_search_result,
    ):
        response = client.post(
            "/api/v1/semantic-search",
            json={"query": "healthcare chatbot", "limit": 10, "page": 1},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "healthcare chatbot"
        assert len(data["items"]) == 1
        assert data["items"][0]["similarity_score"] == 0.92
        assert data["items"][0]["is_indexed"] is True


def test_index_repository_route(mock_db_session):
    """Test POST /api/v1/repositories/{owner}/{repo}/index triggers documentation ingestion."""
    mock_index_result = {
        "repository_id": 42,
        "full_name": "org/health-bot",
        "is_indexed": True,
        "indexed_at": "2024-02-01T00:00:00Z",
        "chunks_count": 8,
        "clean_char_length": 1500,
    }

    with patch(
        "app.api.routes.repositories.ingestion_service.index_repository",
        new_callable=AsyncMock,
        return_value=mock_index_result,
    ):
        response = client.post(
            "/api/v1/repositories/org/health-bot/index",
            json={"force_refresh": False},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["repository_id"] == 42
        assert data["chunks_count"] == 8


def test_index_status_route(mock_db_session):
    """Test GET /api/v1/repositories/{owner}/{repo}/index-status returns index state."""
    mock_status_result = {
        "repository_id": 42,
        "full_name": "org/health-bot",
        "is_indexed": True,
        "indexed_at": "2024-02-01T00:00:00Z",
        "chunks_count": 8,
    }

    with patch(
        "app.api.routes.repositories.ingestion_service.get_index_status",
        new_callable=AsyncMock,
        return_value=mock_status_result,
    ):
        response = client.get("/api/v1/repositories/org/health-bot/index-status")

        assert response.status_code == 200
        data = response.json()
        assert data["is_indexed"] is True
        assert data["chunks_count"] == 8


def test_chat_route(mock_db_session):
    """Test POST /api/v1/chat produces RAG response with sources."""
    mock_chat_response = ChatResponse(
        conversation_id="conv-123",
        repository_id=42,
        full_name="org/health-bot",
        question="How do I install this?",
        answer="Install via `pip install -r requirements.txt`.",
        sources=[
            ChatSource(
                chunk_index=0,
                section_header="Installation",
                snippet="pip install -r requirements.txt",
                similarity_score=0.89,
            )
        ],
        insufficient_context=False,
    )

    with patch(
        "app.api.routes.chat.rag_service.answer_question",
        new_callable=AsyncMock,
        return_value=mock_chat_response,
    ):
        response = client.post(
            "/api/v1/chat",
            json={"repository_id": "org/health-bot", "question": "How do I install this?"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == "conv-123"
        assert "pip install" in data["answer"]
        assert len(data["sources"]) == 1
        assert data["sources"][0]["section_header"] == "Installation"


def test_chat_messages_route(mock_db_session):
    """Test GET /api/v1/chat/{conversation_id}/messages returns message history."""
    msg = ChatMessage(
        id=1,
        conversation_id="conv-123",
        role="user",
        content="Hello bot",
        sources=[],
    )

    with patch(
        "app.api.routes.chat.rag_service.get_conversation_history",
        new_callable=AsyncMock,
        return_value=[msg],
    ):
        response = client.get("/api/v1/chat/conv-123/messages")
        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == "conv-123"
        assert len(data["messages"]) == 1
        assert data["messages"][0]["content"] == "Hello bot"
