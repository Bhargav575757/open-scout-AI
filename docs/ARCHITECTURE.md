# OpenScout System Architecture

## 1. System Overview

**OpenScout** is a production-grade, AI-powered open-source project discovery platform designed to help developers locate, evaluate, compare, and understand GitHub repositories using conversational, natural language queries.

Traditional code discovery relies on static keyword searches, stars, and tags, which fail when users express intent, stack constraints, or experience levels (e.g., *"I want to build an AI healthcare chatbot using Python, FastAPI and React. I am a beginner and prefer repositories with good documentation"*). OpenScout bridges this gap using intent extraction with Mistral AI, semantic vector search with pgvector, GitHub API verification, and Retrieval-Augmented Generation (RAG).

```
┌────────────────────────────────────────────────────────┐
│                   Vercel (Frontend)                    │
│      React 19 + TypeScript + Vite + Tailwind CSS       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Render (Backend)                     │
│            FastAPI + Pydantic + Uvicorn                │
│                                                        │
│  ┌───────────────┐ ┌────────────────┐ ┌─────────────┐  │
│  │ Mistral LLM   │ │ Sentence       │ │ GitHub REST │  │
│  │ Extraction    │ │ Transformers   │ │ Verification│  │
│  │ & Reasoning   │ │ Embeddings     │ │ & Ingestion │  │
│  └───────┬───────┘ └───────┬────────┘ └──────┬──────┘  │
└──────────┼─────────────────┼─────────────────┼─────────┘
           │                 │                 │
           ▼                 ▼                 ▼
   Mistral Cloud API         Managed PostgreSQL + pgvector
```

---

## 2. Frontend and Backend Responsibilities

### 2.1 Frontend (React + TypeScript + Vite)
- **User Interface & State Management**: Deliver an intuitive, responsive interface for natural language query input, search filtering, repository comparison, and interactive RAG chat.
- **Client-Side Validation & Formatting**: Handle query inputs, pagination states, debounced requests, and render Markdown/code blocks safely.
- **API Communication**: Communicate strictly with the OpenScout backend over typed REST endpoints using `fetch` or `axios`.
- **Zero Secrets Policy**: The frontend never holds credentials for Mistral, GitHub, or the database. All sensitive operations are delegated to the backend.

### 2.2 Backend (Python 3 + FastAPI)
- **API Gateway & Routing**: Expose versioned REST endpoints (`/api/v1/...`) with strict CORS enforcement, input validation via Pydantic models, and standardized error schemas.
- **Query Understanding & Requirement Extraction**: Coordinate calls to the Mistral AI API to decompose natural language queries into structured criteria (languages, frameworks, domain, beginner-friendliness, licensing).
- **Semantic & Hybrid Search Orchestration**: Generate vector embeddings for queries, execute cosine similarity search in `pgvector`, and cross-reference with GitHub metadata filters.
- **GitHub Ingestion & Verification**: Query the GitHub REST API to verify live repository status, fetch READMEs, star counts, open issues, and commit recency.
- **RAG & Chat Engine**: Manage conversational sessions, index repository READMEs and file trees, and generate context-grounded answers via Mistral.
- **Persistence Layer**: Manage database transactions, connection pooling, and schema migrations with PostgreSQL.

---

## 3. REST API Communication

The frontend and backend interact via standard JSON-over-HTTPS REST endpoints.

### API Contract Principles
- **Predictable Status Codes**: Standard HTTP codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `422 Unprocessable Entity`, `500 Internal Server Error`).
- **Pydantic Validation**: All request bodies and responses are validated against strongly typed Pydantic schemas.
- **Dynamic CORS**: Configurable via `FRONTEND_URL` and `ALLOWED_ORIGINS` environment variables, enabling smooth staging, preview, and production deployments without code edits.

### Endpoint Roadmap
| Method | Path | Phase | Description |
|---|---|---|---|
| `GET` | `/` | Phase 1 | Root service welcome message |
| `GET` | `/api/health` | Phase 1 | Operational health check |
| `POST` | `/api/search` | Phase 2+ | Natural language query search & recommendations |
| `GET` | `/api/repos/{owner}/{repo}` | Phase 3+ | Detailed repository view with AI breakdown |
| `POST` | `/api/repos/compare` | Phase 4+ | Multi-repository comparative analysis |
| `POST` | `/api/chat` | Phase 5+ | Repository-focused RAG Q&A session |

---

## 4. Mistral AI Query Understanding (Phase 5 Implemented)

Mistral AI is the primary LLM provider for OpenScout. The platform utilizes `mistral-small-latest` via the official Mistral Python SDK with structured JSON enforcement:

### Core Responsibilities
1. **Query Parsing & Intent Decomposition (`POST /api/v1/understand-query`)**:
   - Decomposes free-form natural language queries into strongly-typed `ProjectRequirements`.
   - Extracts technical domain (`Healthcare AI`, `DevOps`, `FinTech`), archetype (`Chatbot`, `REST API`), and target experience level (`Beginner`, `Intermediate`, `Advanced`).
   - Distinguishes programming languages (e.g., Python, TypeScript) from frameworks (e.g., React, FastAPI), preventing LLM hallucinations.
   - Extracts minimum star thresholds and documentation preferences.
   - Formulates optimized GitHub search queries (`github_search_query`).
2. **AI-Powered Repository Discovery (`POST /api/v1/ai-search`)**:
   - Chains Mistral requirement extraction directly to `GitHubService.search_repositories`.
   - Applies extracted or overridden language qualifiers and star minimums.
   - Returns both extracted requirements and verified, live GitHub repositories.
3. **Resilience & Security**:
   - Strict API key isolation (`MISTRAL_API_KEY` exists exclusively in backend settings).
   - Fast failure for invalid credentials (HTTP 401) and rate limits (HTTP 429).
   - Exponential backoff retry on transient 5xx errors or network timeouts.
   - Fallback and input length validation guarding against prompt injections.

---

## 5. GitHub REST API Integration (Phase 4 Implemented)

OpenScout uses the official GitHub REST API (v3) with personal access tokens (`GITHUB_TOKEN`) or safe unauthenticated fallback to fetch live open-source repositories:
- **Repository Search (`POST /api/v1/search`)**: Asynchronously queries `https://api.github.com/search/repositories` using `httpx.AsyncClient`. Constructs valid GitHub qualifiers (`language:"Python"`, `stars:>=50`) and strips non-GitHub sort options to prevent 422 errors.
- **Repository Metadata (`GET /api/v1/repositories/{id}`)**: Fetches complete repository details by `owner/repo` or numeric GitHub repository ID (`GET https://api.github.com/repositories/{id}`).
- **Data Normalization & Resilience**: Maps raw GitHub payloads safely into Pydantic models with null-safe handlers for empty descriptions, null licenses, and missing languages.
- **Rate Limit & Error Handling**: Inspects `X-RateLimit-*` headers, surfaces precise status codes (403 for rate limits with reset timestamp, 401 for bad tokens, 404 for missing repositories), and performs exponential backoff on transient 5xx/network errors.
- **Token Security**: The token is consumed exclusively by the backend `GitHubService` via `GITHUB_TOKEN` environment variable and is never exposed to the frontend.

---

## 6. Semantic Search & Embedding Pipeline (Phase 6 Implemented)

To match user queries with repositories that may not share identical keywords, OpenScout implements semantic vector search:

```
[User Query] ──> [Sentence Transformers] ──> [Query Vector (384-d)]
                                                        │
                                                        ▼
                                              [pgvector Index]
                                          (Cosine Distance Search)
                                                        │
                                                        ▼
[Candidate Repos] <── [Hybrid Filtering] <── [Top-K Candidates]
(Min Stars, Language, License)
```

1. **Embedding Generation**: Utilize `SentenceTransformers` (e.g., `all-MiniLM-L6-v2` or Mistral Embeddings) to encode repository summaries and documentation into dense vector representations.
2. **Vector Indexing**: Store 384/1024-dimensional vectors in PostgreSQL using the `pgvector` extension with HNSW or IVFFlat indexing for fast approximate nearest neighbor search.
3. **Hybrid Ranking**: Combine semantic cosine similarity scores with GitHub quality metrics (stars, recency, documentation completeness) to produce a unified relevance score.

---

## 7. PostgreSQL and pgvector Integration (Phase 6 Implemented)

PostgreSQL serves as the single source of truth for repository cache, pre-computed embeddings, and chat histories.

### Key Data Entities & Schema
- **`repositories` Table**:
  - `id` (BigInteger PK): GitHub numeric repository ID.
  - `name`, `full_name`, `owner`: Repository identification.
  - `description`: Repository overview.
  - `html_url`, `language`, `topics`, `stargazers_count`, `forks_count`, `open_issues_count`, `license_name`.
  - `readme_content`: Full crawled markdown content.
  - `embedding`: 384-dimensional dense vector (`Vector(384)`).
  - `is_indexed`: Boolean flag indicating documentation indexing status.
  - `last_indexed_at`: Timestamp of most recent documentation ingestion.
- **`repository_doc_chunks` Table**:
  - `id` (Integer PK): Autoincrementing chunk ID.
  - `repository_id` (BigInteger FK -> `repositories.id`): Associated repository.
  - `chunk_index` (Integer): Sequence order within document.
  - `chunk_text` (Text): Cleaned text chunk.
  - `embedding`: 384-dimensional dense vector (`Vector(384)`).
  - `token_count` (Integer): Estimated token count.
- **`chat_conversations` Table**:
  - `id` (String PK): UUID identifier for conversational thread.
  - `repository_id` (BigInteger FK -> `repositories.id`): Target repository for RAG.
  - `created_at`, `updated_at`: Timestamps.
- **`chat_messages` Table**:
  - `id` (Integer PK): Message ID.
  - `conversation_id` (String FK -> `chat_conversations.id`): Conversation session.
  - `role` (String): `user`, `assistant`, or `system`.
  - `content` (Text): Message text.
  - `sources` (JSON): Referenced chunk citations and similarity scores.

### Database Migrations
- Managed via Alembic (`backend/alembic`).
- Migration `001_initial_phase6_schema.py` ensures the `CREATE EXTENSION IF NOT EXISTS vector` SQL command executes before table creation.
- Local execution via Docker Compose (`docker-compose.yml` running `pgvector/pgvector:pg16`).

---

## 8. RAG Chatbot Architecture (Phase 6 Implemented)

The RAG chatbot (`RAGService`) enables conversational exploration of repository documentation:

1. **Context Retrieval**:
   - Embeds user question via `EmbeddingService`.
   - Executes vector similarity search on `repository_doc_chunks` scoped to `repository_id`.
   - Retrieves top-K chunks (`RAG_TOP_K=4`) exceeding similarity threshold (`0.25`).
2. **Grounded Generation via Mistral AI**:
   - Strict system prompt instructs the model to answer based **exclusively** on the provided documentation chunks.
   - If information is absent or insufficient, explicitly sets `has_sufficient_context = false` and informs the user rather than hallucinating details.
3. **Citations & Multi-Turn History**:
   - Returns structured `sources` with snippet previews, chunk IDs, and similarity scores.
   - Saves conversations and messages in PostgreSQL; client can fetch full history via `GET /api/v1/chat/{conversation_id}/messages`.

---

## 9. Deployment Architecture (Vercel & Render)

```
                       ┌─────────────────────────┐
                       │     DNS / Cloudflare    │
                       └────────────┬────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            │                                               │
            ▼                                               ▼
┌───────────────────────┐                       ┌───────────────────────┐
│     Vercel (Edge)     │                       │     Render (Web)      │
│  Static Assets & SPA  │                       │  FastAPI Application  │
│  React + Tailwind     │ ── API Requests ────> │  Uvicorn Worker       │
│  Custom Domain        │                       │  Auto-TLS & Scaling   │
└───────────────────────┘                       └───────────┬───────────┘
                                                            │
                                        ┌───────────────────┴───────────────────┐
                                        ▼                                       ▼
                            ┌───────────────────────┐               ┌───────────────────────┐
                            │  Render / Supabase PG │               │   Mistral AI Cloud    │
                            │  PostgreSQL + pgvector│               │   API Endpoints       │
                            └───────────────────────┘               └───────────────────────┘
```

### Vercel (Frontend)
- Continuous deployment directly from the `main` branch.
- Single-page application rewriting (`/index.html`).
- Environment variable `VITE_API_BASE_URL` pointing to the Render backend service.

### Render (Backend)
- Web Service running `uvicorn app.main:app --host 0.0.0.0 --port 10000`.
- Environment variables configured via Render dashboard (`FRONTEND_URL`, `MISTRAL_API_KEY`, `GITHUB_TOKEN`, `DATABASE_URL`).
- Native PostgreSQL database with `pgvector` extension enabled.

---

## 10. Security & Secret Management Architecture

1. **Isolation of Secrets**: All API keys (`MISTRAL_API_KEY`, `GITHUB_TOKEN`, `DATABASE_URL`) exist exclusively in backend server environments. No secrets are bundled into client-side JS.
2. **CORS Whitelisting**: Strict origin validation prevents unauthorized cross-origin calls from arbitrary web origins.
3. **Input Sanitization**: Pydantic models validate all incoming payloads against injection, payload size limits, and type mismatches.
4. **Git Protection**: Robust `.gitignore` prevents inadvertent commits of `.env` or sensitive local configs.

