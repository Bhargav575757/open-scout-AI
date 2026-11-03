from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_history_returns_empty_collection():
    response = client.get("/api/v1/history")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) == 0
    assert data["total"] == 0
    assert "Phase 4+" in data["message"]

