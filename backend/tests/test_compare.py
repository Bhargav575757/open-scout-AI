from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_valid_comparison_request():
    payload = {
        "repository_ids": ["medibot-ai-fastapi", "health-assistant-core"]
    }
    response = client.post("/api/v1/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    assert data["repository_ids"] == payload["repository_ids"]
    assert data["status"] == "development"
    assert "Phase 5" in data["message"]


def test_comparison_too_few_repositories():
    payload = {
        "repository_ids": ["medibot-ai-fastapi"]
    }
    response = client.post("/api/v1/compare", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"


def test_comparison_too_many_repositories():
    payload = {
        "repository_ids": ["repo-1", "repo-2", "repo-3", "repo-4", "repo-5"]
    }
    response = client.post("/api/v1/compare", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"


def test_comparison_duplicate_repositories():
    payload = {
        "repository_ids": ["medibot-ai", "medibot-ai"]
    }
    response = client.post("/api/v1/compare", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"


def test_comparison_empty_string_identifier():
    payload = {
        "repository_ids": ["medibot-ai", "   "]
    }
    response = client.post("/api/v1/compare", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"
