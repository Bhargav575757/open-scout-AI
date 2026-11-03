from typing import Any, List, Optional
import numpy as np

from app.core.config import settings
from app.core.exceptions import OpenScoutException
from app.core.logging import get_logger

logger = get_logger("app.services.embedding")


class EmbeddingServiceException(OpenScoutException):
    """Raised when dense embedding generation fails."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="EMBEDDING_SERVICE_ERROR",
            status_code=500,
            details=details,
        )


class EmbeddingService:
    """
    Service client for generating dense vector embeddings using Sentence Transformers.
    Caches model weights in memory to ensure high-throughput inference without re-instantiation.
    """

    def __init__(
        self,
        model_name: Optional[str] = None,
        dimension: Optional[int] = None,
        model: Optional[Any] = None,
    ):
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self.dimension = dimension or settings.EMBEDDING_DIMENSION
        self._model = model

    def get_model(self) -> Any:
        """
        Lazily loads the configured SentenceTransformer model.
        """
        if self._model is not None:
            return self._model

        logger.info("Loading SentenceTransformer embedding model: '%s'...", self.model_name)
        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
            logger.info(
                "Successfully loaded embedding model '%s' (output dimension: %d).",
                self.model_name,
                self.dimension,
            )
            return self._model
        except Exception as exc:
            logger.error("Failed to load SentenceTransformer model '%s': %s", self.model_name, exc, exc_info=True)
            raise EmbeddingServiceException(
                f"Failed to load embedding model '{self.model_name}': {str(exc)}",
                details={"model_name": self.model_name, "error": str(exc)},
            ) from exc

    def preprocess_text(self, text: str) -> str:
        """
        Standardizes and normalizes text before embedding generation.
        Removes excess whitespace while preserving semantic punctuation.
        """
        if not text:
            return ""
        return " ".join(text.strip().split())

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a normalized 384-dimensional dense vector for a single text string.
        """
        clean_text = self.preprocess_text(text)
        if not clean_text:
            # Return normalized zero vector
            return [0.0] * self.dimension

        batch_result = self.generate_batch_embeddings([clean_text])
        return batch_result[0]

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates normalized dense embeddings for a batch of strings.
        """
        if not texts:
            return []

        cleaned_texts = [self.preprocess_text(t) for t in texts]
        non_empty_indices = [i for i, t in enumerate(cleaned_texts) if len(t) > 0]

        # Initialize output vectors with zeros
        results: List[List[float]] = [[0.0] * self.dimension for _ in range(len(texts))]
        if not non_empty_indices:
            return results

        texts_to_embed = [cleaned_texts[i] for i in non_empty_indices]

        try:
            model = self.get_model()
            # Generate embeddings with L2 normalization for accurate cosine similarity
            embeddings = model.encode(
                texts_to_embed,
                normalize_embeddings=True,
                show_progress_bar=False,
                batch_size=32,
            )

            # Convert numpy array / tensors to Python floats
            if hasattr(embeddings, "tolist"):
                embeddings_list = embeddings.tolist()
            else:
                embeddings_list = [list(map(float, vec)) for vec in embeddings]

            for original_idx, vec in zip(non_empty_indices, embeddings_list):
                # Verify dimension matches configured expectation
                if len(vec) != self.dimension:
                    logger.warning(
                        "Embedding dimension mismatch: expected %d, got %d. Truncating or padding.",
                        self.dimension,
                        len(vec),
                    )
                    if len(vec) > self.dimension:
                        vec = vec[: self.dimension]
                    else:
                        vec = vec + [0.0] * (self.dimension - len(vec))
                results[original_idx] = vec

            return results

        except Exception as exc:
            logger.error("Failed to generate batch embeddings: %s", exc, exc_info=True)
            raise EmbeddingServiceException(
                f"Error generating embeddings: {str(exc)}",
                details={"count": len(texts), "error": str(exc)},
            ) from exc

    def compute_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Computes cosine similarity between two normalized vectors.
        Returns a float between 0.0 and 1.0.
        """
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        v1 = np.array(vec1, dtype=np.float32)
        v2 = np.array(vec2, dtype=np.float32)
        dot = float(np.dot(v1, v2))
        # Clamp to [0.0, 1.0] for normalized positive space
        return max(0.0, min(1.0, dot))


# Global singleton instance
embedding_service = EmbeddingService()
