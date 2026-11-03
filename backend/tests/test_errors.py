from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_nonexistent_route_returns_404_json():
    response = client.get("/api/v1/nonexistent-route")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "detail" in data


def test_validation_error_structure():
    response = client.post("/api/v1/search", json={})
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "REQUEST_VALIDATION_ERROR"
    assert isinstance(data["error"]["details"], list)
    assert len(data["error"]["details"]) > 0
    assert "field" in data["error"]["details"][0]
    assert "message" in data["error"]["details"][0]


def test_process_time_header_present():
    response = client.get("/")
    assert response.status_code == 200
    assert "X-Process-Time" in response.headers
    assert response.headers["X-Process-Time"].endswith("ms")
