# OpenScout Backend Services

This package encapsulates domain business logic and external API integrations for subsequent development phases.

## Planned Services (Phase 4+)

1. **Mistral AI Service (`mistral_service.py`)**:
   - Manages communication with the Mistral AI API.
   - Decomposes natural language queries into technical constraints, language requirements, and beginner/advanced indicators.
   - Generates contextual explanations for why a repository fits the user's intent.

2. **GitHub API Client (`github_service.py`)**:
   - Interacts with GitHub REST API (v3) using `GITHUB_TOKEN`.
   - Fetches live repository metadata, stars, forks, active issues, commit recency, and README contents.
   - Handles API rate-limiting, caching, and exponential backoff.

3. **Embedding & Semantic Search Service (`embedding_service.py`)**:
   - Generates dense vector embeddings using Sentence Transformers.
   - Executes cosine distance vector searches against `pgvector` indexes in PostgreSQL.
   - Implements hybrid ranking combining semantic relevance scores with documentation quality metrics.

4. **Repository Comparison Engine (`comparison_service.py`)**:
   - Synthesizes side-by-side matrices comparing architectural patterns, licenses, and community activity across 2 to 4 repositories.

5. **RAG Chat Engine (`rag_service.py`)**:
   - Ingests repository documentation and README markdown into chunked embeddings.
   - Coordinates conversational question-answering sessions grounded strictly in repository source documents.
