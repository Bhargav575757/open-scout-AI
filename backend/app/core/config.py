import os
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application settings loaded from environment variables and .env file.
    Provides type-safe configuration with sensible development defaults.
    """

    APP_NAME: str = Field(default="OpenScout API", description="Name of the application")
    APP_VERSION: str = Field(default="0.3.0", description="Semver application version")
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

    # Future AI & External Service Integrations (Phase 4+)
    # Secrets are strictly managed in server environments and never exposed to clients
    MISTRAL_API_KEY: str = Field(
        default="",
        description="Mistral AI API Key for intent extraction and reasoning",
    )
    GITHUB_TOKEN: str = Field(
        default="",
        description="GitHub Personal Access Token for repository discovery and verification",
    )
    DATABASE_URL: str = Field(
        default="",
        description="PostgreSQL connection string with pgvector extension",
    )

    # Logging Configuration
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level: DEBUG, INFO, WARNING, ERROR, CRITICAL",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
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
