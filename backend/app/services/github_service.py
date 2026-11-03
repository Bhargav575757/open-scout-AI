import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings
from app.core.exceptions import (
    GitHubAPIException,
    GitHubAuthException,
    GitHubRateLimitException,
    GitHubResourceNotFoundException,
    GitHubUpstreamException,
    ValidationException,
)
from app.core.logging import get_logger
from app.schemas.repository import RepositoryResponse
from app.schemas.search import SearchResponse

logger = get_logger("app.services.github")

# Supported sort fields according to GitHub Search API documentation
SUPPORTED_GITHUB_SORTS = {"stars", "forks", "updated", "help-wanted-issues"}


class GitHubService:
    """
    Asynchronous service client for querying the official GitHub REST API (v3).
    Handles authentication, qualifiers, pagination, rate limits, and data normalization.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        token: Optional[str] = None,
        timeout: Optional[float] = None,
    ):
        self.base_url = (base_url or settings.GITHUB_API_BASE_URL).rstrip("/")
        self.token = token if token is not None else settings.GITHUB_TOKEN
        self.timeout = timeout if timeout is not None else settings.GITHUB_API_TIMEOUT

    def _get_headers(self) -> Dict[str, str]:
        """
        Constructs required HTTP headers for GitHub API communication.
        Never leaks the token in client-visible code or logs.
        """
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "OpenScout-App/0.4.0",
        }
        if self.token and self.token.strip():
            headers["Authorization"] = f"Bearer {self.token.strip()}"
        return headers

    def _build_search_query(
        self,
        query: str,
        language: Optional[str] = None,
        min_stars: Optional[int] = None,
    ) -> str:
        """
        Combines freeform text search with GitHub qualifiers (language:..., stars:>=...).
        """
        parts = [query.strip()]

        # Append language qualifier if specified and not already present in query
        if language and language.strip():
            clean_lang = language.strip()
            # Quote if language contains spaces or symbols (e.g. C++, C#)
            lang_qualifier = f'language:"{clean_lang}"' if (" " in clean_lang or "+" in clean_lang or "#" in clean_lang) else f"language:{clean_lang}"
            if f"language:" not in query.lower():
                parts.append(lang_qualifier)

        # Append stars qualifier if specified and not already in query
        if min_stars is not None and min_stars > 0:
            if "stars:" not in query.lower():
                parts.append(f"stars:>={min_stars}")

        return " ".join(parts)

    def _inspect_rate_limit(self, response: httpx.Response) -> Dict[str, Any]:
        """
        Extracts and logs GitHub rate-limit headers safely.
        """
        limit = response.headers.get("x-ratelimit-limit")
        remaining = response.headers.get("x-ratelimit-remaining")
        reset_epoch = response.headers.get("x-ratelimit-reset")

        rate_info: Dict[str, Any] = {
            "limit": int(limit) if limit and limit.isdigit() else None,
            "remaining": int(remaining) if remaining and remaining.isdigit() else None,
            "reset_timestamp": int(reset_epoch) if reset_epoch and reset_epoch.isdigit() else None,
        }

        if rate_info["reset_timestamp"]:
            reset_dt = datetime.fromtimestamp(rate_info["reset_timestamp"], tz=timezone.utc)
            rate_info["reset_time_utc"] = reset_dt.isoformat()

        logger.debug(
            "GitHub API Rate Limit: %s/%s remaining (resets at %s)",
            rate_info.get("remaining"),
            rate_info.get("limit"),
            rate_info.get("reset_time_utc", "unknown"),
        )
        return rate_info

    def _parse_repository(self, item: Dict[str, Any]) -> RepositoryResponse:
        """
        Extracts repository data from raw GitHub REST API dictionary into a Pydantic schema,
        safely handling null descriptions, missing licenses, and optional fields.
        """
        owner_data = item.get("owner") or {}
        owner_login = owner_data.get("login", "")
        owner_avatar = owner_data.get("avatar_url")

        license_data = item.get("license")
        license_str: Optional[str] = None
        if isinstance(license_data, dict):
            license_str = license_data.get("spdx_id") or license_data.get("name")
            if license_str == "NOASSERTION":
                license_str = license_data.get("name") or "Custom"

        stars = item.get("stargazers_count", 0) or 0
        forks = item.get("forks_count", 0) or 0

        return RepositoryResponse(
            id=item.get("id", ""),
            name=item.get("name", ""),
            full_name=item.get("full_name", ""),
            owner=owner_login,
            owner_avatar_url=owner_avatar,
            description=item.get("description"),
            html_url=item.get("html_url", ""),
            language=item.get("language"),
            stars=stars,
            forks=forks,
            stargazers_count=stars,
            forks_count=forks,
            open_issues_count=item.get("open_issues_count"),
            watchers_count=item.get("watchers_count"),
            topics=item.get("topics") or [],
            license=license_str,
            created_at=item.get("created_at"),
            updated_at=item.get("updated_at"),
            default_branch=item.get("default_branch", "main"),
        )

    async def _send_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> httpx.Response:
        """
        Sends an HTTP request with exponential backoff for transient 5xx errors.
        Does NOT retry authentication failures or rate limit exhaustion.
        """
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()
        max_retries = settings.GITHUB_MAX_RETRIES

        for attempt in range(max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.request(
                        method=method,
                        url=url,
                        headers=headers,
                        params=params,
                    )

                # Inspect rate-limit headers
                rate_info = self._inspect_rate_limit(response)

                # 1. Check for Rate Limit Exceeded (403 or 429)
                if response.status_code in (403, 429):
                    msg = response.text.lower()
                    if rate_info["remaining"] == 0 or "rate limit" in msg or "secondary rate limit" in msg:
                        logger.warning("GitHub rate limit exceeded: %s", rate_info)
                        raise GitHubRateLimitException(
                            message=(
                                "GitHub API rate limit exceeded. Please configure a personal GITHUB_TOKEN in your "
                                "backend environment for up to 5,000 requests/hour."
                            ),
                            details=rate_info,
                        )

                # 2. Check for Authentication Failure (401 Bad credentials)
                if response.status_code == 401:
                    logger.error("GitHub API authentication failed. Verify GITHUB_TOKEN.")
                    raise GitHubAuthException(
                        message="GitHub authentication failed. Please verify that your GITHUB_TOKEN is valid.",
                        details={"status": 401},
                    )

                # 3. Check for 404 Not Found
                if response.status_code == 404:
                    raise GitHubResourceNotFoundException(
                        message=f"Requested GitHub resource was not found at {endpoint}.",
                        details={"endpoint": endpoint, "status": 404},
                    )

                # 4. Check for Validation Error (422)
                if response.status_code == 422:
                    error_json = response.json() if response.content else {}
                    message = error_json.get("message", "GitHub validation error.")
                    raise ValidationException(
                        message=f"GitHub rejected query parameters: {message}",
                        details=error_json,
                    )

                # 5. Check for 5xx Server Errors (allow retry if attempts remaining)
                if response.status_code >= 500:
                    if attempt < max_retries:
                        backoff = 0.5 * (2**attempt)
                        logger.warning("GitHub returned %d. Retrying in %.2fs...", response.status_code, backoff)
                        await asyncio.sleep(backoff)
                        continue
                    raise GitHubUpstreamException(
                        message=f"GitHub API service unavailable (status {response.status_code}).",
                        details={"status": response.status_code},
                    )

                response.raise_for_status()
                return response

            except httpx.TimeoutException as exc:
                if attempt < max_retries:
                    backoff = 0.5 * (2**attempt)
                    logger.warning("Timeout contacting GitHub API. Retrying in %.2fs...", backoff)
                    await asyncio.sleep(backoff)
                    continue
                logger.error("GitHub API request timed out after %d attempts: %s", max_retries + 1, exc)
                raise GitHubUpstreamException(
                    message="Connection to GitHub API timed out. Please try again.",
                    details={"error": "timeout"},
                ) from exc

            except (GitHubRateLimitException, GitHubAuthException, GitHubResourceNotFoundException, ValidationException):
                # Never retry client / auth / rate-limit exceptions
                raise

            except httpx.HTTPError as exc:
                if attempt < max_retries:
                    backoff = 0.5 * (2**attempt)
                    logger.warning("HTTP error contacting GitHub. Retrying in %.2fs...", backoff)
                    await asyncio.sleep(backoff)
                    continue
                logger.error("GitHub API HTTP error: %s", exc)
                raise GitHubAPIException(
                    message=f"Failed to communicate with GitHub API: {str(exc)}",
                    details={"error": str(exc)},
                ) from exc

        raise GitHubUpstreamException("Failed to complete GitHub request after maximum retries.")

    async def search_repositories(
        self,
        query: str,
        language: Optional[str] = None,
        min_stars: Optional[int] = None,
        limit: int = 10,
        page: int = 1,
        sort: Optional[str] = None,
        order: str = "desc",
    ) -> SearchResponse:
        """
        Executes a repository search query against GET /search/repositories.
        """
        built_query = self._build_search_query(query, language=language, min_stars=min_stars)

        params: Dict[str, Any] = {
            "q": built_query,
            "page": max(1, page),
            "per_page": min(100, max(1, limit)),
        }

        # Apply sort only if it is a GitHub-supported sort keyword
        if sort and sort.lower() in SUPPORTED_GITHUB_SORTS:
            params["sort"] = sort.lower()
            params["order"] = order.lower() if order in ("asc", "desc") else "desc"

        logger.info("Querying GitHub Search API with q='%s', params=%s", built_query, params)

        response = await self._send_request("GET", "/search/repositories", params=params)
        data = response.json()

        total_count = data.get("total_count", 0)
        raw_items = data.get("items", [])

        parsed_items = [self._parse_repository(item) for item in raw_items]

        return SearchResponse(
            query=query,
            total_count=total_count,
            page=page,
            per_page=limit,
            items=parsed_items,
            total=total_count,
            results=parsed_items,
            limit=limit,
            message="Live GitHub repositories retrieved successfully.",
            status="success",
        )

    async def get_repository(self, repository_id: str) -> RepositoryResponse:
        """
        Retrieves detailed metadata for a repository by identifier:
        - owner/repo (e.g. 'healthtech-labs/medibot-ai')
        - numeric GitHub ID (e.g. '123456')
        - or searches by single name slug if not explicitly namespaced.
        """
        clean_id = repository_id.strip()

        # Case 1: owner/repo format
        if "/" in clean_id:
            parts = clean_id.split("/")
            if len(parts) == 2 and parts[0] and parts[1]:
                owner, repo = parts[0], parts[1]
                logger.info("Fetching repository details for owner='%s', repo='%s'", owner, repo)
                response = await self._send_request("GET", f"/repos/{owner}/{repo}")
                return self._parse_repository(response.json())

        # Case 2: numeric repository ID
        if clean_id.isdigit():
            logger.info("Fetching repository details for numeric id=%s", clean_id)
            response = await self._send_request("GET", f"/repositories/{clean_id}")
            return self._parse_repository(response.json())

        # Case 3: single slug name -> query GitHub to resolve exact repository
        logger.info("Resolving single slug identifier '%s' via GitHub Search", clean_id)
        search_res = await self.search_repositories(query=f"{clean_id} in:name", limit=1)
        if search_res.items:
            # Check if name matches exactly or closely
            for candidate in search_res.items:
                if candidate.name.lower() == clean_id.lower() or candidate.full_name.lower().endswith(f"/{clean_id.lower()}"):
                    return candidate
            return search_res.items[0]

        raise GitHubResourceNotFoundException(
            message=f"Repository '{clean_id}' was not found on GitHub.",
            details={"repository_id": clean_id},
        )


# Global singleton instance
github_service = GitHubService()

