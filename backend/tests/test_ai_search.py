from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
import pytest

from app.core.exceptions import GitHubRateLimitException, MistralAuthException
from app.main import app
from app.schemas.query_understanding import ProjectRequirements
from app.schemas.repository import RepositoryResponse
from app.schemas.search import SearchResponse

client = TestClient(app)

SAMPLE_REQUIREMENTS = ProjectRequirements(
    domain="Healthcare AI",
    project_type="Chatbot",
    programming_languages=["Python"],
    frameworks=["FastAPI", "React"],
    technologies=["AI", "NLP"],
    difficulty="Beginner",
    min_stars=100,
    documentation_preference="Good documentation preferred",
    keywords=["healthcare chatbot", "medical AI"],
    github_search_query="healthcare chatbot",
    summary="Beginner-friendly AI healthcare chatbot using Python and React.",
)

SAMPLE_REPO = RepositoryResponse(
    id=101,
    name="health-bot",
    full_name="org/health-bot",
    owner="org",
    owner_avatar_url="https://avatars.githubusercontent.com/u/101?v=4",
    description="An open source AI healthcare chatbot",
    html_url="https://github.com/org/health-bot",
    language="Python",
    stars=350,
    forks=45,
    open_issues_count=4,
    watchers_count=350,
    topics=["healthcare", "chatbot", "python", "fastapi"],
    license="MIT",
    created_at="2024-01-01T00:00:00Z",
    updated_at="2024-02-01T00:00:00Z",
    default_branch="main",
)


def test_understand_query_success():
    """Test successful query understanding route /api/v1/understand-query."""
    with patch(
        "app.api.routes.search.mistral_service.understand_query",
        new_callable=AsyncMock,
        return_value=SAMPLE_REQUIREMENTS,
    ) as mock_understand:
        response = client.post(
            "/api/v1/understand-query",
            json={"query": "I want to build an AI healthcare chatbot with Python"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["requirements"]["domain"] == "Healthcare AI"
        assert data["requirements"]["project_type"] == "Chatbot"
        assert data["requirements"]["programming_languages"] == ["Python"]
        assert "FastAPI" in data["requirements"]["frameworks"]
        assert data["requirements"]["min_stars"] == 100
        mock_understand.assert_awaited_once()


def test_understand_query_empty_returns_422():
    """Test empty query returns 422 Unprocessable Content."""
    response = client.post(
        "/api/v1/understand-query",
        json={"query": "   "},
    )
    assert response.status_code == 422
    assert "error" in response.json()


def test_understand_query_auth_failure_returns_401():
    """Test unconfigured or bad Mistral key returns 401."""
    with patch(
        "app.api.routes.search.mistral_service.understand_query",
        new_callable=AsyncMock,
        side_effect=MistralAuthException("Mistral API key not configured."),
    ):
        response = client.post(
            "/api/v1/understand-query",
            json={"query": "Healthcare chatbot in Python"},
        )
        assert response.status_code == 401
        data = response.json()
        assert data["error"]["code"] == "MISTRAL_AUTH_FAILED"


def test_ai_search_successful_integration():
    """12. Test successful AI search integration with mocked GitHubService."""
    mock_search_response = SearchResponse(
        query="healthcare chatbot",
        total_count=1,
        page=1,
        per_page=10,
        items=[SAMPLE_REPO],
    )

    with patch(
        "app.api.routes.search.mistral_service.understand_query",
        new_callable=AsyncMock,
        return_value=SAMPLE_REQUIREMENTS,
    ), patch(
        "app.api.routes.search.github_service.search_repositories",
        new_callable=AsyncMock,
        return_value=mock_search_response,
    ) as mock_gh:
        response = client.post(
            "/api/v1/ai-search",
            json={
                "query": "I want a beginner-friendly healthcare chatbot with Python and React",
                "page": 1,
                "per_page": 10,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["query"] == "I want a beginner-friendly healthcare chatbot with Python and React"
        assert data["requirements"]["domain"] == "Healthcare AI"
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "health-bot"

        # Check that github_service was called with parameters derived from Mistral requirements
        mock_gh.assert_awaited_once_with(
            query="healthcare chatbot",
            language="Python",
            min_stars=100,
            limit=10,
            page=1,
            sort=None,
            order="desc",
        )


def test_ai_search_github_failure_after_query_understanding():
    """13. Test GitHub failure after successful query understanding returns proper error."""
    with patch(
        "app.api.routes.search.mistral_service.understand_query",
        new_callable=AsyncMock,
        return_value=SAMPLE_REQUIREMENTS,
    ), patch(
        "app.api.routes.search.github_service.search_repositories",
        new_callable=AsyncMock,
        side_effect=GitHubRateLimitException("GitHub rate limit reached."),
    ):
        response = client.post(
            "/api/v1/ai-search",
            json={"query": "Healthcare chatbot with Python"},
        )
        assert response.status_code == 403
        data = response.json()
        assert data["error"]["code"] == "GITHUB_RATE_LIMIT_EXCEEDED"


def test_existing_direct_search_remains_functional():
    """14. Test existing direct GitHub search endpoint POST /api/v1/search remains functional."""
    mock_search_response = SearchResponse(
        query="fastapi",
        total_count=1,
        page=1,
        per_page=10,
        items=[SAMPLE_REPO],
    )

    with patch(
        "app.api.routes.search.github_service.search_repositories",
        new_callable=AsyncMock,
        return_value=mock_search_response,
    ) as mock_gh:
        response = client.post(
            "/api/v1/search",
            json={"query": "fastapi", "language": "Python", "min_stars": 50},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "fastapi"
        assert len(data["items"]) == 1
        mock_gh.assert_awaited_once_with(
            query="fastapi",
            language="Python",
            min_stars=50,
            limit=10,
            page=1,
            sort=None,
            order="desc",
        )
