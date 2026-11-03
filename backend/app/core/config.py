from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application settings loaded from environment variables and .env file.
    Provides type-safe configuration with sensible development defaults.
    """

    APP_NAME: str = Field(default="OpenScout API", description="Name of the application")
    APP_VERSION: str = Field(default="0.6.0", description="Semver application version")
    DEBUG: bool = Field(default=False, description="Enable debug mode and verbose logging")
    API_V1_PREFIX: str = Field(default="/api/v1", description="Prefix for Version 1 API endpoints")
    PORT: int = Field(default=8000, description="Port on which the application listens")

    # Frontend & CORS Configuration
    FRONTEND_URL: str = Field(
        default="http://localhost:5173",
        description="Primary frontend origin allowed for CORS requests",
    )
    ALLOWED_ORIGINS: str = Field(
        default="",
        description="Optional comma-separated list of additional allowed CORS origins",
    )

    # GitHub REST API Configuration (Phase 4)
    GITHUB_TOKEN: str = Field(
        default="",
        description="GitHub Personal Access Token for authenticated repository search and higher rate limits",
    )
    GITHUB_API_BASE_URL: str = Field(
        default="https://api.github.com",
        description="Official GitHub REST API base URL",
    )
    GITHUB_API_TIMEOUT: float = Field(
        default=10.0,
        description="HTTP request timeout in seconds for GitHub API calls",
    )
    GITHUB_MAX_RETRIES: int = Field(
        default=2,
        description="Maximum retry attempts for transient GitHub errors (5xx/timeouts)",
    )

    # Mistral AI Configuration (Phase 5)
    MISTRAL_API_KEY: str = Field(
        default="",
        description="Mistral AI API Key for natural language query understanding",
    )
    MISTRAL_MODEL: str = Field(
        default="mistral-small-latest",
        description="Mistral AI model identifier for query understanding and reasoning",
    )
    MISTRAL_API_TIMEOUT: float = Field(
        default=30.0,
        description="HTTP request timeout in seconds for Mistral API calls",
    )
    MISTRAL_MAX_RETRIES: int = Field(
        default=2,
        description="Maximum retry attempts for transient Mistral errors (5xx/timeouts)",
    )

    # Database Configuration (Phase 6 - PostgreSQL + pgvector)
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/openscout",
        description="PostgreSQL async connection string with pgvector extension",
    )
    DATABASE_ECHO: bool = Field(
        default=False,
        description="Enable SQLAlchemy SQL query echo logging",
    )

    # Embedding & RAG Configuration (Phase 6)
    EMBEDDING_MODEL: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        description="HuggingFace model path for dense vector embeddings",
    )
    EMBEDDING_DIMENSION: int = Field(
        default=384,
        description="Dimension size of output embedding vectors",
    )
    DOC_MAX_CHARS: int = Field(
        default=50000,
        description="Maximum raw documentation character limit per repository",
    )
    CHUNK_SIZE: int = Field(
        default=600,
        description="Character size of text chunks for documentation indexing",
    )
    CHUNK_OVERLAP: int = Field(
        default=100,
        description="Character overlap between consecutive chunks",
    )
    RAG_TOP_K: int = Field(
        default=4,
        description="Number of most relevant chunks retrieved for RAG context synthesis",
    )

    # Logging Configuration
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level: DEBUG, INFO, WARNING, ERROR, CRITICAL",
    )

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    @property
    def cors_origins(self) -> List[str]:
        """
        Dynamically derives the list of allowed CORS origins from FRONTEND_URL
        and ALLOWED_ORIGINS, normalizing trailing slashes for exact browser matching.
        """
        origins: List[str] = []

        if self.FRONTEND_URL:
            clean = self.FRONTEND_URL.strip().rstrip("/")
            if clean:
                origins.append(clean)

        if self.ALLOWED_ORIGINS:
            for item in self.ALLOWED_ORIGINS.split(","):
                clean = item.strip().rstrip("/")
                if clean and clean not in origins:
                    origins.append(clean)

        # Fallback default for local development
        if not origins:
            origins.append("http://localhost:5173")

        return origins


settings = Settings()
