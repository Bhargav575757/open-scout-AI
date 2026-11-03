import asyncio
import json
import re
from typing import Any, Dict, List, Optional
import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.core.exceptions import (
    MistralAPIException,
    MistralAuthException,
    MistralMalformedResponseException,
    MistralRateLimitException,
    MistralUpstreamException,
    ValidationException,
)
from app.core.logging import get_logger
from app.prompts.query_understanding import (
    QUERY_UNDERSTANDING_SYSTEM_PROMPT,
    QUERY_UNDERSTANDING_USER_TEMPLATE,
)
from app.schemas.query_understanding import ProjectRequirements

logger = get_logger("app.services.mistral")

# Known frameworks/libraries that an LLM might mistakenly classify as programming languages
KNOWN_FRAMEWORKS = {
    "react",
    "react.js",
    "reactjs",
    "vue",
    "vue.js",
    "vuejs",
    "angular",
    "angularjs",
    "svelte",
    "next.js",
    "nextjs",
    "nuxt",
    "nuxtjs",
    "fastapi",
    "django",
    "flask",
    "express",
    "express.js",
    "expressjs",
    "spring",
    "spring boot",
    "rails",
    "ruby on rails",
    "laravel",
    "asp.net",
    "pytorch",
    "tensorflow",
    "keras",
    "scikit-learn",
    "tailwind",
    "tailwindcss",
}


class MistralService:
    """
    Asynchronous service client for Mistral AI API integration.
    Understands natural language queries and extracts structured technical requirements.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
        max_retries: Optional[int] = None,
        client: Optional[Any] = None,
    ):
        self.api_key = api_key if api_key is not None else settings.MISTRAL_API_KEY
        self.model = model if model is not None else settings.MISTRAL_MODEL
        self.timeout = timeout if timeout is not None else settings.MISTRAL_API_TIMEOUT
        self.max_retries = max_retries if max_retries is not None else settings.MISTRAL_MAX_RETRIES
        self._client = client

    def get_client(self) -> Any:
        """
        Lazily initializes the Mistral SDK client.
        Raises MistralAuthException if the API key is unconfigured.
        """
        if self._client is not None:
            return self._client

        clean_key = (self.api_key or "").strip()
        if not clean_key:
            logger.error("Mistral AI API key is not configured.")
            raise MistralAuthException(
                "Mistral API key is not configured. Please set MISTRAL_API_KEY in your backend environment."
            )

        from mistralai.client import Mistral

        self._client = Mistral(api_key=clean_key)
        return self._client

    def _sanitize_requirements(self, req: ProjectRequirements) -> ProjectRequirements:
        """
        Post-processes extracted requirements to ensure framework vs language separation
        and data integrity before being passed downstream.
        """
        valid_languages: List[str] = []
        shifted_frameworks: List[str] = list(req.frameworks)

        for lang in req.programming_languages:
            if lang.lower() in KNOWN_FRAMEWORKS:
                # Reclassify mistakenly identified framework
                if lang not in shifted_frameworks:
                    shifted_frameworks.append(lang)
            else:
                valid_languages.append(lang)

        req.programming_languages = valid_languages
        req.frameworks = shifted_frameworks
        return req

    def _extract_json_payload(self, raw_content: str) -> Dict[str, Any]:
        """
        Safely extracts and parses JSON payload from the raw LLM completion string.
        Handles markdown fences and unexpected surrounding text.
        """
        if not raw_content or not raw_content.strip():
            raise MistralMalformedResponseException("Mistral AI returned an empty response.")

        text = raw_content.strip()

        # Strip markdown fences if present
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        # If still surrounded by other text, locate outermost braces
        if not (text.startswith("{") and text.endswith("}")):
            start_idx = text.find("{")
            end_idx = text.rfind("}")
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                text = text[start_idx : end_idx + 1]

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as exc:
            logger.error("Malformed JSON received from Mistral AI: %s", raw_content)
            raise MistralMalformedResponseException(
                f"Failed to parse JSON response from Mistral AI: {str(exc)}"
            ) from exc

        if not isinstance(parsed, dict):
            raise MistralMalformedResponseException(
                f"Mistral AI returned invalid JSON structure: expected object, got {type(parsed).__name__}"
            )

        return parsed

    async def understand_query(self, query: str) -> ProjectRequirements:
        """
        Processes a natural language developer query and extracts structured ProjectRequirements.
        Implements retries for transient errors while failing fast on auth/rate limits.
        """
        clean_query = query.strip()
        if not clean_query:
            raise ValidationException("Query string cannot be empty or purely whitespace.")

        if len(clean_query) > 1000:
            raise ValidationException("Query string exceeds maximum allowed length of 1000 characters.")

        client = self.get_client()
        messages = [
            {"role": "system", "content": QUERY_UNDERSTANDING_SYSTEM_PROMPT},
            {"role": "user", "content": QUERY_UNDERSTANDING_USER_TEMPLATE.format(query=clean_query)},
        ]

        attempt = 0
        last_exception: Optional[Exception] = None

        while attempt <= self.max_retries:
            attempt += 1
            try:
                logger.info(
                    "Sending query understanding request to Mistral model='%s' (attempt %d/%d)",
                    self.model,
                    attempt,
                    self.max_retries + 1,
                )

                response = await client.chat.complete_async(
                    model=self.model,
                    messages=messages,
                    response_format={"type": "json_object"},
                    timeout_ms=int(self.timeout * 1000),
                )

                if not response.choices or not response.choices[0].message:
                    raise MistralMalformedResponseException("Mistral AI returned a response with no choices.")

                raw_content = response.choices[0].message.content
                if not isinstance(raw_content, str):
                    raise MistralMalformedResponseException("Mistral AI returned a non-string message content.")

                parsed_json = self._extract_json_payload(raw_content)

                try:
                    requirements = ProjectRequirements.model_validate(parsed_json)
                except ValidationError as exc:
                    logger.error("ProjectRequirements validation failed against Mistral output: %s", parsed_json)
                    raise MistralMalformedResponseException(
                        f"Mistral AI response did not match expected ProjectRequirements schema: {str(exc)}"
                    ) from exc

                sanitized = self._sanitize_requirements(requirements)
                logger.info(
                    "Successfully understood query: domain=%s, type=%s, langs=%s, frameworks=%s, difficulty=%s",
                    sanitized.domain,
                    sanitized.project_type,
                    sanitized.programming_languages,
                    sanitized.frameworks,
                    sanitized.difficulty,
                )
                return sanitized

            except (MistralAuthException, MistralRateLimitException, MistralMalformedResponseException, ValidationException):
                # Never retry client auth, rate limit, schema validation, or user input errors
                raise

            except Exception as exc:
                last_exception = exc
                status_code: Optional[int] = None

                # Check if SDKError or httpx HTTPStatusError
                if hasattr(exc, "raw_response") and hasattr(exc.raw_response, "status_code"):
                    status_code = exc.raw_response.status_code
                elif hasattr(exc, "status_code"):
                    status_code = getattr(exc, "status_code")

                # Handle HTTP 401 Unauthorized
                if status_code == 401:
                    logger.error("Mistral authentication error (401 Bad API Key).")
                    raise MistralAuthException(
                        "Mistral API authentication failed. Please verify that your MISTRAL_API_KEY is valid.",
                        details={"status_code": 401},
                    ) from exc

                # Handle HTTP 429 Rate Limit
                if status_code == 429:
                    logger.warning("Mistral AI rate limit reached (429 Too Many Requests).")
                    raise MistralRateLimitException(
                        "Mistral AI API rate limit exceeded. Please wait a moment before retrying.",
                        details={"status_code": 429},
                    ) from exc

                # Handle transient 5xx or network/timeout errors
                is_timeout = isinstance(exc, (httpx.TimeoutException, asyncio.TimeoutError))
                is_transient_http = status_code in (500, 502, 503, 504) if status_code else False
                is_network_error = isinstance(exc, (httpx.NetworkError, httpx.ConnectError))

                if (is_timeout or is_transient_http or is_network_error) and attempt <= self.max_retries:
                    backoff = 0.5 * (2 ** (attempt - 1))
                    logger.warning(
                        "Transient error contacting Mistral AI (attempt %d/%d): %s. Retrying in %.1fs...",
                        attempt,
                        self.max_retries + 1,
                        str(exc),
                        backoff,
                    )
                    await asyncio.sleep(backoff)
                    continue

                logger.error("Failed to query Mistral AI: %s", str(exc), exc_info=True)
                raise MistralUpstreamException(
                    "Mistral AI is currently unreachable or experiencing service degradation. Please try again later.",
                    details={"error": str(exc)},
                ) from exc

        # If loop exhausts
        raise MistralUpstreamException(
            "Mistral AI request failed after maximum retries.",
            details={"error": str(last_exception) if last_exception else "Unknown error"},
        )


mistral_service = MistralService()

