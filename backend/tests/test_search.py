from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_valid_search_request():
    payload = {
        "query": "AI healthcare chatbot using Python and React",
        "limit": 10,
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == payload["query"]
    assert data["limit"] == 10
    assert data["total"] == 0
    assert data["results"] == []
    assert data["status"] == "development"
    assert "Phase 4" in data["message"]


def test_search_with_optional_filters():
    payload = {
        "query": "FastAPI starter kit",
        "limit": 25,
        "language": "Python",
        "min_stars": 500,
    }
    response = client.post("/api/v1/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["limit"] == 25


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
