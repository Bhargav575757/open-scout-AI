from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.core.exceptions import GitHubResourceNotFoundException
from app.main import app
from app.schemas.repository import RepositoryResponse

client = TestClient(app)

MOCK_REPO_RESPONSE = RepositoryResponse(
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
    default_branch="main",
)


def test_get_repository_by_valid_owner_repo_success():
    with patch("app.api.routes.repositories.github_service.get_repository", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = MOCK_REPO_RESPONSE

        response = client.get("/api/v1/repositories/healthtech-labs/medibot-ai")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "medibot-ai"
        assert data["full_name"] == "healthtech-labs/medibot-ai"
        assert data["stars"] == 8420
        assert data["license"] == "Apache-2.0"


def test_get_repository_by_numeric_id_success():
    with patch("app.api.routes.repositories.github_service.get_repository", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = MOCK_REPO_RESPONSE

        response = client.get("/api/v1/repositories/123456")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "medibot-ai"


def test_get_repository_not_found_returns_404():
    with patch("app.api.routes.repositories.github_service.get_repository", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = GitHubResourceNotFoundException(
            message="Repository 'nonexistent-user/nonexistent-repo' was not found on GitHub."
        )

        response = client.get("/api/v1/repositories/nonexistent-user/nonexistent-repo")
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "GITHUB_REPOSITORY_NOT_FOUND"


def test_get_repository_by_invalid_characters_returns_422():
    response = client.get("/api/v1/repositories/invalid repository id!")
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
