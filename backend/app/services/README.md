# OpenScout Backend Services

This package encapsulates domain business logic, external API integrations, embedding generation, vector search, and RAG capabilities.

## Implemented Services

1. **GitHub REST API Service (`github_service.py`)**:
   - Asynchronous HTTP client communicating with `https://api.github.com`.
   - Supports repository searching via qualifiers (`language:Python`, `stars:>=50`, `sort`, `order`, pagination).
   - Fetches repository details by `owner/repo` or numeric repository ID.
   - Fetches repository README markdown via `get_repository_readme(owner, repo)`.
   - Safe data normalization mapping raw GitHub payloads to strongly-typed `RepositoryResponse` Pydantic models.
   - Comprehensive error and rate-limit handling (`X-RateLimit-*` headers, unauthenticated 60 req/hr vs token 5,000 req/hr).
   - Exponential backoff retry for transient network timeouts and 5xx errors.

2. **Mistral AI Service (`mistral_service.py`)**:
   - Asynchronous client communicating with the Mistral AI API (`mistral-small-latest`).
   - Uses official Mistral SDK with JSON output enforcement and structured prompt engineering.
   - Decomposes natural language queries into structured `ProjectRequirements` (domain, project type, programming languages, frameworks, difficulty, min stars, GitHub query).
   - Defends against hallucinations: distinguishes programming languages from frameworks (e.g. React vs JavaScript), strips unsupported qualifiers, and validates against Pydantic schemas.
   - Error handling for missing credentials (401), rate limits (429), malformed outputs (502), and transient retry backoff.

3. **Embedding Service (`embedding_service.py` - Phase 6)**:
   - Encodes text into 384-dimensional dense vectors using `sentence-transformers/all-MiniLM-L6-v2`.
   - Batch encoding with L2 cosine normalization (`normalize_embeddings=True`).
   - Thread-safe lazy model loading and LRU query embedding cache to avoid redundant model passes.
   - Cosine similarity calculation utilities.

4. **Documentation Ingestion Service (`ingestion_service.py` - Phase 6)**:
   - Fetches raw README markdown from GitHub REST API.
   - Cleans markdown noise (HTML tags, image badges, raw links, HTML comments, repeated newlines).
   - Sliding window chunking (`CHUNK_SIZE=600`, `CHUNK_OVERLAP=100`) preserving semantic paragraph continuity.
   - Batch-embeds chunks and upserts repository and chunk records into PostgreSQL with pgvector embeddings.

5. **Semantic Search Service (`semantic_search_service.py` - Phase 6)**:
   - Performs dense vector semantic similarity search using pgvector cosine distance operator `<=>`.
   - Normalizes vector distances to bounded similarity scores `[0.0, 1.0]`.
   - Automatic fallback to in-memory cosine matching when running in lightweight test/SQLite environments.

6. **RAG Service (`rag_service.py` - Phase 6)**:
   - Context-grounded Question Answering on indexed repository documentation.
   - Cosine similarity retrieval of top-K documentation chunks (`RAG_TOP_K=4`, threshold `0.25`).
   - Strict anti-hallucination system prompt constraining answers solely to retrieved context.
   - Returns citation sources with chunk snippet previews and similarity scores.
   - Persistent multi-turn conversations stored in `chat_conversations` and `chat_messages` tables.

7. **Repository Comparison Engine (`comparison_service.py`)**:
   - Reserved for Phase 7 multi-repository side-by-side matrices and AI justifications.
