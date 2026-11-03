import json
from unittest.mock import AsyncMock, MagicMock
import httpx
import pytest
from mistralai.client.errors import SDKError

from app.core.exceptions import (
    MistralAuthException,
    MistralMalformedResponseException,
    MistralRateLimitException,
    MistralUpstreamException,
    ValidationException,
)
from app.services.mistral_service import MistralService


def create_mock_completion(content_dict_or_str):
    if isinstance(content_dict_or_str, dict):
        content_str = json.dumps(content_dict_or_str)
    else:
        content_str = str(content_dict_or_str)

    mock_choice = MagicMock()
    mock_choice.message.content = content_str
    mock_resp = MagicMock()
    mock_resp.choices = [mock_choice]
    return mock_resp


@pytest.mark.anyio
async def test_successful_query_understanding():
    """1. Test successful natural language query understanding."""
    expected_data = {
        "domain": "Healthcare AI",
        "project_type": "Chatbot",
        "programming_languages": ["Python"],
        "frameworks": ["FastAPI", "React"],
        "technologies": ["NLP", "AI"],
        "difficulty": "Beginner",
        "min_stars": 100,
        "documentation_preference": "Good documentation preferred",
        "keywords": ["healthcare chatbot", "medical AI"],
        "github_search_query": "healthcare chatbot",
        "summary": "Beginner-friendly AI healthcare chatbot using Python and React.",
    }

    mock_client = MagicMock()
    mock_client.chat.complete_async = AsyncMock(return_value=create_mock_completion(expected_data))

    service = MistralService(api_key="mock_key", client=mock_client)
    result = await service.understand_query(
        "I am a beginner and want to build an AI-powered healthcare chatbot using Python, React and FastAPI."
    )

    assert result.domain == "Healthcare AI"
    assert result.project_type == "Chatbot"
    assert result.programming_languages == ["Python"]
    assert "React" in result.frameworks
    assert "FastAPI" in result.frameworks
    assert result.difficulty == "Beginner"
    assert result.min_stars == 100
    assert result.github_search_query == "healthcare chatbot"
    assert "healthcare" in result.summary.lower()


@pytest.mark.anyio
async def test_missing_api_key_raises_auth_exception():
    """2. Test missing API key raises MistralAuthException without calling network."""
    service = MistralService(api_key="", client=None)
    with pytest.raises(MistralAuthException) as exc_info:
        await service.understand_query("Any query")

    assert exc_info.value.status_code == 401
    assert "not configured" in exc_info.value.message.lower()


@pytest.mark.anyio
async def test_invalid_api_key_raises_auth_exception():
    """3. Test invalid API key (HTTP 401) raises MistralAuthException and does not retry."""
    raw_response = httpx.Response(401, json={"message": "Unauthorized API key"})
    sdk_err = SDKError("Unauthorized", raw_response=raw_response)

    mock_client = MagicMock()
    mock_client.chat.complete_async = AsyncMock(side_effect=sdk_err)

    service = MistralService(api_key="invalid_key", client=mock_client, max_retries=2)
    with pytest.raises(MistralAuthException) as exc_info:
        await service.understand_query("Python project")

    assert exc_info.value.status_code == 401
    assert mock_client.chat.complete_async.call_count == 1  # Verify no retry on 401


@pytest.mark.anyio
async def test_rate_limit_response_raises_rate_limit_exception():
    """4. Test rate limit (HTTP 429) raises MistralRateLimitException."""
    raw_response = httpx.Response(429, json={"message": "Rate limit exceeded"})
    sdk_err = SDKError("Rate limit", raw_response=raw_response)

    mock_client = MagicMock()
    mock_client.chat.complete_async = AsyncMock(side_effect=sdk_err)

    service = MistralService(api_key="mock_key", client=mock_client, max_retries=2)
    with pytest.raises(MistralRateLimitException) as exc_info:
        await service.understand_query("Python project")

    assert exc_info.value.status_code == 429
    assert mock_client.chat.complete_async.call_count == 1  # Verify no retry loop on 429


@pytest.mark.anyio
async def test_network_timeout_retries_and_raises_upstream_exception():
    """5. Test network timeout retries up to max_retries then raises MistralUpstreamException."""
    mock_client = MagicMock()
    mock_client.chat.complete_async = AsyncMock(
        side_effect=httpx.TimeoutException("Read timeout to Mistral")
    )

    service = MistralService(api_key="mock_key", client=mock_client, max_retries=1)
    with pytest.raises(MistralUpstreamException) as exc_info:
        await service.understand_query("Machine learning project")

    assert exc_info.value.status_code == 502
    assert mock_client.chat.complete_async.call_count == 2  # 1 initial + 1 retry


@pytest.mark.anyio
async def test_malformed_json_raises_malformed_response_exception():
    """6. Test malformed non-JSON output from LLM raises MistralMalformedResponseException."""
    mock_client = MagicMock()
    mock_client.chat.complete_async = AsyncMock(
        return_value=create_mock_completion("Here is the JSON you requested: {broken json : missing value")
    )

    service = MistralService(api_key="mock_key", client=mock_client)
    with pytest.raises(MistralMalformedResponseException) as exc_info:
        await service.understand_query("Healthcare app")

    assert exc_info.value.status_code == 502


@pytest.mark.anyio
async def test_invalid_structured_output_raises_malformed_response_exception():
    """7. Test invalid schema fields (e.g. negative min_stars) raise schema validation exception."""
    invalid_schema_data = {
        "domain": "Healthcare",
        "min_stars": -50,  # Negative stars violates ge=0
        "github_search_query": "healthcare",
        "summary": "Healthcare project",
    }
    mock_client = MagicMock()
    mock_client.chat.complete_async = AsyncMock(
        return_value=create_mock_completion(invalid_schema_data)
    )

    service = MistralService(api_key="mock_key", client=mock_client)
    with pytest.raises(MistralMalformedResponseException) as exc_info:
        await service.understand_query("Healthcare app")

    assert exc_info.value.status_code == 502


@pytest.mark.anyio
async def test_empty_query_raises_validation_exception():
    """8. Test empty or purely whitespace query raises ValidationException without contacting API."""
    mock_client = MagicMock()
    service = MistralService(api_key="mock_key", client=mock_client)

    with pytest.raises(ValidationException):
        await service.understand_query("")

    with pytest.raises(ValidationException):
        await service.understand_query("     ")

    assert mock_client.chat.complete_async.call_count == 0


@pytest.mark.anyio
async def test_query_without_specified_technologies():
    """9. Test query where no explicit technologies or languages were mentioned."""
    expected_data = {
        "domain": "Project Management",
        "project_type": "CLI Tool",
        "programming_languages": [],
        "frameworks": [],
        "technologies": ["Task Management"],
        "difficulty": "Unknown",
        "min_stars": None,
        "documentation_preference": None,
        "keywords": ["task manager", "todo CLI"],
        "github_search_query": "task manager CLI",
        "summary": "Project management CLI tool for tracking tasks.",
    }

    mock_client = MagicMock()
    mock_client.chat.complete_async = AsyncMock(return_value=create_mock_completion(expected_data))

    service = MistralService(api_key="mock_key", client=mock_client)
    result = await service.understand_query("I want a simple task management CLI tool")

    assert result.programming_languages == []
    assert result.frameworks == []
    assert result.difficulty == "Unknown"
    assert result.github_search_query == "task manager CLI"


@pytest.mark.anyio
async def test_query_with_multiple_programming_languages():
    """10. Test query with multiple programming languages extracted correctly."""
    expected_data = {
        "domain": "DevOps",
        "project_type": "Microservices",
        "programming_languages": ["Python", "Go"],
        "frameworks": ["FastAPI"],
        "technologies": ["Docker", "Kubernetes"],
        "difficulty": "Advanced",
        "min_stars": 500,
        "documentation_preference": None,
        "keywords": ["microservices docker go python"],
        "github_search_query": "microservices docker",
        "summary": "Advanced microservices setup using Python and Go.",
    }

    mock_client = MagicMock()
    mock_client.chat.complete_async = AsyncMock(return_value=create_mock_completion(expected_data))

    service = MistralService(api_key="mock_key", client=mock_client)
    result = await service.understand_query("Advanced microservices in Python and Go with Docker")

    assert result.programming_languages == ["Python", "Go"]
    assert result.frameworks == ["FastAPI"]
    assert result.difficulty == "Advanced"
    assert result.min_stars == 500


@pytest.mark.anyio
async def test_distinction_between_languages_and_frameworks():
    """11. Test that frameworks mistakenly placed in programming_languages are sanitized to frameworks."""
    # Model hallucinated React in programming_languages
    hallucinated_data = {
        "domain": "E-Commerce",
        "project_type": "Web Application",
        "programming_languages": ["React", "TypeScript"],  # React is a framework, NOT a language
        "frameworks": ["Next.js"],
        "technologies": ["Stripe"],
        "difficulty": "Intermediate",
        "min_stars": 200,
        "documentation_preference": None,
        "keywords": ["ecommerce store", "online shop"],
        "github_search_query": "ecommerce store nextjs",
        "summary": "Intermediate e-commerce web application with TypeScript and React.",
    }

    mock_client = MagicMock()
    mock_client.chat.complete_async = AsyncMock(return_value=create_mock_completion(hallucinated_data))

    service = MistralService(api_key="mock_key", client=mock_client)
    result = await service.understand_query("E-commerce store using React and TypeScript")

    # Verify React was removed from programming_languages and added to frameworks
    assert result.programming_languages == ["TypeScript"]
    assert "React" in result.frameworks
    assert "Next.js" in result.frameworks

