# OpenScout Backend Services

This package encapsulates domain business logic and external API integrations.

## Implemented Services (Phase 4 & 5)

1. **GitHub REST API Service (`github_service.py`)**:
   - Asynchronous HTTP client communicating with `https://api.github.com`.
   - Supports repository searching via qualifiers (`language:Python`, `stars:>=50`, `sort`, `order`, pagination).
   - Safe data normalization mapping raw GitHub payloads to strongly-typed `RepositoryResponse` Pydantic models.
   - Comprehensive error and rate-limit handling (`X-RateLimit-*` headers, unauthenticated 60 req/hr vs token 5,000 req/hr).
   - Exponential backoff retry for transient network timeouts and 5xx errors.

2. **Mistral AI Service (`mistral_service.py`)**:
   - Asynchronous client communicating with the Mistral AI API (`mistral-small-latest`).
   - Uses official Mistral SDK with JSON output enforcement and structured prompt engineering.
   - Decomposes natural language queries into structured `ProjectRequirements` (domain, project type, programming languages, frameworks, difficulty, min stars, GitHub query).
   - Defends against hallucinations: distinguishes programming languages from frameworks (e.g. React vs JavaScript), strips unsupported qualifiers, and validates against Pydantic schemas.
   - Error handling for missing credentials (401), rate limits (429), malformed outputs (502), and transient retry backoff.

3. **Embedding & Semantic Search Service (`embedding_service.py`)**:
   - Generates dense vector embeddings using Sentence Transformers.
   - Executes cosine distance vector searches against `pgvector` indexes in PostgreSQL.

4. **Repository Comparison Engine (`comparison_service.py`)**:
   - Synthesizes side-by-side matrices comparing architectural patterns, licenses, and community activity.

5. **RAG Chat Engine (`rag_service.py`)**:
   - Ingests repository documentation and README markdown into chunked embeddings for interactive codebase Q&A.
