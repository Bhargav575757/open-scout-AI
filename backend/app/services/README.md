# OpenScout Backend Services

This package encapsulates domain business logic and external API integrations.

## Implemented Services (Phase 4)

1. **GitHub REST API Service (`github_service.py`)**:
   - Asynchronous HTTP client communicating with `https://api.github.com`.
   - Supports repository searching via qualifiers (`language:Python`, `stars:>=50`, `sort`, `order`, pagination).
   - Safe data normalization mapping raw GitHub payloads to strongly-typed `RepositoryResponse` Pydantic models.
   - Comprehensive error and rate-limit handling (`X-RateLimit-*` headers, unauthenticated 60 req/hr vs token 5,000 req/hr).
   - Exponential backoff retry for transient network timeouts and 5xx errors.

## Planned Services (Phase 5+)

2. **Mistral AI Service (`mistral_service.py`)**:
   - Manages communication with the Mistral AI API for query parsing and requirement extraction.
   - Generates contextual explanations for repository recommendations.

3. **Embedding & Semantic Search Service (`embedding_service.py`)**:
   - Generates dense vector embeddings using Sentence Transformers.
   - Executes cosine distance vector searches against `pgvector` indexes in PostgreSQL.

4. **Repository Comparison Engine (`comparison_service.py`)**:
   - Synthesizes side-by-side matrices comparing architectural patterns, licenses, and community activity.

5. **RAG Chat Engine (`rag_service.py`)**:
   - Ingests repository documentation and README markdown into chunked embeddings for interactive codebase Q&A.
