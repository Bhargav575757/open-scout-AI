import json
from unittest.mock import AsyncMock, patch
import httpx
import pytest

from app.core.exceptions import (
    GitHubAuthException,
    GitHubRateLimitException,
    GitHubResourceNotFoundException,
    GitHubUpstreamException,
)
from app.services.github_service import GitHubService

SAMPLE_GITHUB_SEARCH_RESPONSE = {
    "total_count": 100,
    "incomplete_results": False,
    "items": [
        {
            "id": 123456,
            "name": "medibot-ai",
            "full_name": "healthtech-labs/medibot-ai",
            "owner": {
                "login": "healthtech-labs",
                "avatar_url": "https://avatars.githubusercontent.com/u/101?v=4",
            },
            "description": "Conversational AI healthcare chatbot",
            "html_url": "https://github.com/healthtech-labs/medibot-ai",
            "language": "Python",
            "stargazers_count": 8420,
            "forks_count": 1140,
            "open_issues_count": 24,
            "watchers_count": 320,
            "topics": ["healthcare", "chatbot", "fastapi"],
            "license": {
                "key": "apache-2.0",
                "name": "Apache License 2.0",
                "spdx_id": "Apache-2.0",
            },
            "created_at": "2024-01-15T12:00:00Z",
            "updated_at": "2026-11-01T08:30:00Z",
            "default_branch": "main",
        }
    ],
}

SAMPLE_NULL_FIELDS_REPO = {
    "id": 789101,
    "name": "minimal-repo",
    "full_name": "solo-dev/minimal-repo",
    "owner": {
        "login": "solo-dev",
        "avatar_url": None,
    },
    "description": None,
    "html_url": "https://github.com/solo-dev/minimal-repo",
    "language": None,
    "stargazers_count": 0,
    "forks_count": 0,
    "open_issues_count": None,
    "watchers_count": None,
    "topics": None,
    "license": None,
    "created_at": None,
    "updated_at": None,
    "default_branch": "master",
}


@pytest.mark.anyio
async def test_successful_repository_search():
    service = GitHubService(token="test_dummy_token")

    mock_resp = httpx.Response(
        status_code=200,
        content=json.dumps(SAMPLE_GITHUB_SEARCH_RESPONSE).encode(),
        headers={"x-ratelimit-limit": "5000", "x-ratelimit-remaining": "4990"},
        request=httpx.Request("GET", "https://api.github.com/search/repositories"),
    )

    with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_resp
        result = await service.search_repositories(
            query="AI healthcare chatbot",
            language="Python",
            min_stars=10,
            limit=10,
            page=1,
            sort="stars",
        )

        assert result.total_count == 100
        assert len(result.items) == 1
        repo = result.items[0]
        assert repo.name == "medibot-ai"
        assert repo.full_name == "healthtech-labs/medibot-ai"
        assert repo.owner == "healthtech-labs"
        assert repo.stars == 8420
        assert repo.license == "Apache-2.0"
        assert repo.language == "Python"


@pytest.mark.anyio
async def test_empty_search_result():
    service = GitHubService(token="")

    mock_resp = httpx.Response(
        status_code=200,
        content=json.dumps({"total_count": 0, "items": []}).encode(),
        headers={"x-ratelimit-limit": "60", "x-ratelimit-remaining": "59"},
        request=httpx.Request("GET", "https://api.github.com/search/repositories"),
    )

    with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_resp
        result = await service.search_repositories(query="nonexistent_xyz_query_12345")

        assert result.total_count == 0
        assert len(result.items) == 0


@pytest.mark.anyio
async def test_repository_details_by_owner_repo():
    service = GitHubService()

    single_repo = SAMPLE_GITHUB_SEARCH_RESPONSE["items"][0]
    mock_resp = httpx.Response(
        status_code=200,
        content=json.dumps(single_repo).encode(),
        headers={"x-ratelimit-limit": "5000", "x-ratelimit-remaining": "4980"},
        request=httpx.Request("GET", "https://api.github.com/repos/healthtech-labs/medibot-ai"),
    )

    with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_resp
        repo = await service.get_repository("healthtech-labs/medibot-ai")

        assert repo.name == "medibot-ai"
        assert repo.full_name == "healthtech-labs/medibot-ai"
        assert repo.stars == 8420


@pytest.mark.anyio
async def test_repository_details_by_numeric_id():
    service = GitHubService()

    single_repo = SAMPLE_GITHUB_SEARCH_RESPONSE["items"][0]
    mock_resp = httpx.Response(
        status_code=200,
        content=json.dumps(single_repo).encode(),
        headers={"x-ratelimit-limit": "5000", "x-ratelimit-remaining": "4980"},
        request=httpx.Request("GET", "https://api.github.com/repositories/123456"),
    )

    with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_resp
        repo = await service.get_repository("123456")

        assert repo.name == "medibot-ai"
        assert repo.id == 123456


@pytest.mark.anyio
async def test_missing_token_unauthenticated_request():
    service = GitHubService(token="")
    headers = service._get_headers()
    assert "Authorization" not in headers
    assert headers["Accept"] == "application/vnd.github+json"


@pytest.mark.anyio
async def test_rate_limit_exceeded_response():
    service = GitHubService(token="")

    mock_resp = httpx.Response(
        status_code=403,
        content=json.dumps({"message": "API rate limit exceeded"}).encode(),
        headers={
            "x-ratelimit-limit": "60",
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": "1799999999",
        },
        request=httpx.Request("GET", "https://api.github.com/search/repositories"),
    )

    with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_resp
        with pytest.raises(GitHubRateLimitException) as exc_info:
            await service.search_repositories(query="test")

        assert "rate limit exceeded" in str(exc_info.value).lower()
        assert exc_info.value.status_code == 403


@pytest.mark.anyio
async def test_authentication_failure():
    service = GitHubService(token="invalid_bad_token")

    mock_resp = httpx.Response(
        status_code=401,
        content=json.dumps({"message": "Bad credentials"}).encode(),
        request=httpx.Request("GET", "https://api.github.com/search/repositories"),
    )

    with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_resp
        with pytest.raises(GitHubAuthException) as exc_info:
            await service.search_repositories(query="test")

        assert "authentication failed" in str(exc_info.value).lower()
        assert exc_info.value.status_code == 401


@pytest.mark.anyio
async def test_network_timeout():
    service = GitHubService()

    with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_request:
        mock_request.side_effect = httpx.TimeoutException("Connection timed out")
        with pytest.raises(GitHubUpstreamException) as exc_info:
            await service.search_repositories(query="test")

        assert "timed out" in str(exc_info.value).lower()


@pytest.mark.anyio
async def test_null_repository_fields_handled_safely():
    service = GitHubService()

    mock_resp = httpx.Response(
        status_code=200,
        content=json.dumps({
            "total_count": 1,
            "items": [SAMPLE_NULL_FIELDS_REPO],
        }).encode(),
        request=httpx.Request("GET", "https://api.github.com/search/repositories"),
    )

    with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_resp
        res = await service.search_repositories(query="minimal")

        repo = res.items[0]
        assert repo.name == "minimal-repo"
        assert repo.description is None
        assert repo.language is None
        assert repo.license is None
        assert repo.owner == "solo-dev"
        assert repo.owner_avatar_url is None
        assert repo.topics == []


@pytest.mark.anyio
async def test_query_filtering_and_pagination_parameters():
    service = GitHubService()

    with patch.object(service, "_send_request", new_callable=AsyncMock) as mock_send:
        mock_send.return_value = httpx.Response(
            status_code=200,
            content=json.dumps({"total_count": 0, "items": []}).encode(),
            request=httpx.Request("GET", "https://api.github.com/search/repositories"),
        )

        await service.search_repositories(
            query="chatbot",
            language="TypeScript",
            min_stars=50,
            limit=25,
            page=3,
            sort="stars",
            order="desc",
        )

        mock_send.assert_called_once()
        args, kwargs = mock_send.call_args
        params = kwargs.get("params") or args[2]

        assert params["page"] == 3
        assert params["per_page"] == 25
        assert params["sort"] == "stars"
        assert params["order"] == "desc"
        assert "language:TypeScript" in params["q"]
        assert "stars:>=50" in params["q"]
