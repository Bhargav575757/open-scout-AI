from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.repository import RepositoryResponse
from app.schemas.search import SearchResponse

client = TestClient(app)

MOCK_SEARCH_RESULT = SearchResponse(
    query="AI healthcare chatbot using Python and React",
    total_count=1,
    page=1,
    per_page=10,
    items=[
        RepositoryResponse(
            id=123456,
            name="medibot-ai",
            full_name="healthtech-labs/medibot-ai",
            owner="healthtech-labs",
            owner_avatar_url="https://avatars.githubusercontent.com/u/101?v=4",
            description="Conversational AI healthcare chatbot",
            html_url="https://github.com/healthtech-labs/medibot-ai",
            language="Python",
            stars=8420,
            forks=1140,
            topics=["healthcare", "chatbot"],
            license="Apache-2.0",
        )
    ],
    total=1,
    limit=10,
    status="success",
    message="Live GitHub repositories retrieved successfully.",
)


def test_valid_search_request():
    payload = {
        "query": "AI healthcare chatbot using Python and React",
        "limit": 10,
    }
    with patch("app.api.routes.search.github_service.search_repositories", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = MOCK_SEARCH_RESULT

        response = client.post("/api/v1/search", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == payload["query"]
        assert data["per_page"] == 10
        assert data["total_count"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "medibot-ai"
        assert data["items"][0]["stars"] == 8420


def test_search_with_optional_filters():
    payload = {
        "query": "FastAPI starter kit",
        "limit": 25,
        "language": "Python",
        "min_stars": 500,
        "page": 2,
        "sort": "stars",
    }
    with patch("app.api.routes.search.github_service.search_repositories", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = MOCK_SEARCH_RESULT

        response = client.post("/api/v1/search", json=payload)
        assert response.status_code == 200
        mock_search.assert_called_once_with(
            query="FastAPI starter kit",
            language="Python",
            min_stars=500,
            limit=25,
            page=2,
            sort="stars",
            order="desc",
        )


def test_empty_query_rejection():
    payload = {
        "query": "",
        "limit": 10,
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"


def test_whitespace_query_rejection():
    payload = {
        "query": "    ",
        "limit": 10,
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"


def test_query_exceeding_max_length_rejection():
    payload = {
        "query": "A" * 501,
        "limit": 10,
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"


def test_invalid_limit_below_minimum():
    payload = {
        "query": "Valid query",
        "limit": 0,
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"


def test_invalid_limit_above_maximum():
    payload = {
        "query": "Valid query",
        "limit": 51,
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"


def test_missing_query_field():
    payload = {
        "limit": 10,
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"
