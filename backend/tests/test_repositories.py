from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_repository_by_valid_slug_returns_404():
    response = client.get("/api/v1/repositories/medibot-ai-fastapi")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "RESOURCE_NOT_FOUND"
    assert "medibot-ai-fastapi" in data["error"]["message"]
    assert "Phase 4" in data["error"]["message"]


def test_get_repository_by_valid_owner_repo_returns_404():
    response = client.get("/api/v1/repositories/healthtech-labs/medibot-ai")
    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "RESOURCE_NOT_FOUND"


def test_get_repository_by_invalid_characters_returns_422():
    # Characters like space, semicolons, brackets should trigger validation error
    response = client.get("/api/v1/repositories/invalid repository id!")
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
