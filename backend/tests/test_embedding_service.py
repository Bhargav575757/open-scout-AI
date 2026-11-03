from unittest.mock import MagicMock
import numpy as np
import pytest

from app.services.embedding_service import EmbeddingService, EmbeddingServiceException


def test_embedding_generation_mock_model():
    """Test generating embeddings with expected dimension and normalization."""
    mock_model = MagicMock()
    # Mock return 384-dimensional vector
    mock_vec = np.ones(384, dtype=np.float32)
    mock_vec = mock_vec / np.linalg.norm(mock_vec)
    mock_model.encode.return_value = [mock_vec]

    service = EmbeddingService(dimension=384, model=mock_model)
    emb = service.generate_embedding("Open source healthcare chatbot in Python")

    assert len(emb) == 384
    assert isinstance(emb, list)
    assert isinstance(emb[0], float)
    norm = np.linalg.norm(np.array(emb))
    assert abs(norm - 1.0) < 1e-4


def test_empty_text_returns_zero_vector():
    """Test empty string input returns zero vector without invoking model."""
    mock_model = MagicMock()
    service = EmbeddingService(dimension=384, model=mock_model)

    emb = service.generate_embedding("")
    assert len(emb) == 384
    assert all(v == 0.0 for v in emb)
    assert mock_model.encode.call_count == 0


def test_batch_embedding_generation():
    """Test batch embedding generation with multiple strings."""
    mock_model = MagicMock()
    v1 = np.ones(384, dtype=np.float32) / np.sqrt(384)
    v2 = np.ones(384, dtype=np.float32) / np.sqrt(384)
    mock_model.encode.return_value = [v1, v2]

    service = EmbeddingService(dimension=384, model=mock_model)
    results = service.generate_batch_embeddings(["Repo 1 description", "Repo 2 description"])

    assert len(results) == 2
    assert len(results[0]) == 384
    assert len(results[1]) == 384


def test_compute_similarity_exact_vectors():
    """Test cosine similarity for identical and orthogonal vectors."""
    service = EmbeddingService(dimension=384)
    v1 = [1.0] + [0.0] * 383
    v2 = [1.0] + [0.0] * 383
    v3 = [0.0, 1.0] + [0.0] * 382

    sim_identical = service.compute_similarity(v1, v2)
    assert abs(sim_identical - 1.0) < 1e-4

    sim_orthogonal = service.compute_similarity(v1, v3)
    assert abs(sim_orthogonal - 0.0) < 1e-4


def test_model_loading_failure_raises_exception():
    """Test handling of model loading failure."""
    service = EmbeddingService(model_name="nonexistent/invalid-model-name-xyz", model=None)
    with pytest.raises(EmbeddingServiceException) as exc_info:
        service.get_model()

    assert "Failed to load embedding model" in exc_info.value.message
