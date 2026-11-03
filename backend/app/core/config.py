from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "OpenScout API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"

    # Environment configuration
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = ""

    # Future integration configuration (Phase 2+)
    MISTRAL_API_KEY: str = ""
    GITHUB_TOKEN: str = ""
    DATABASE_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        """
        Builds the list of allowed CORS origins dynamically from FRONTEND_URL
        and optional ALLOWED_ORIGINS comma-separated list.
        """
        origins: List[str] = []

        if self.FRONTEND_URL:
            # Add with and without trailing slash for robust CORS matching
            clean_url = self.FRONTEND_URL.strip().rstrip("/")
            if clean_url:
                origins.append(clean_url)

        if self.ALLOWED_ORIGINS:
            for item in self.ALLOWED_ORIGINS.split(","):
                clean = item.strip().rstrip("/")
                if clean and clean not in origins:
                    origins.append(clean)

        return origins or ["http://localhost:5173"]


settings = Settings()
