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

## 4. Planned Mistral AI Integration

Mistral AI is the primary LLM provider for OpenScout. Gemini and OpenAI APIs are explicitly excluded.

### Core LLM Responsibilities
1. **Query Parsing & Intent Decomposition**:
   - Extract technical stack requirements (`Python`, `FastAPI`, `React`).
   - Extract domain constraints (`healthcare`, `e-commerce`).
   - Extract repository quality preferences (`beginner-friendly`, `good documentation`, `active maintenance`).
   - Output structured JSON matching backend Pydantic models via Mistral JSON mode.
2. **Recommendation Explanations**:
   - Synthesize a concise justification for why a discovered repository fits the user's specific request and skill level.
3. **Repository Comparison Engine**:
   - Compare architectural choices, documentation quality, and maintenance status across 2 to 4 projects.
4. **RAG-based Repository Chat**:
   - Answer queries grounded strictly in repository READMEs, setup guides, and code structure.

---

## 5. Planned GitHub API Integration

OpenScout uses the official GitHub REST API (v3) with personal access tokens (`GITHUB_TOKEN`) to fetch real-world data:
- **Repository Search**: Query repositories by topics, language, and keywords.
- **Metadata Verification**: Check repository activity (stars, forks, open issues, last push date, license).
- **Content Ingestion**: Fetch repository READMEs (`GET /repos/{owner}/{repo}/readme`), repository trees, and documentation files for RAG indexing.
- **Rate Limit Handling**: Implement token authentication, intelligent caching (in-memory or Redis/Postgres), and exponential backoff to handle GitHub rate limits gracefully.

---

## 6. Planned Semantic Search & Embedding Pipeline

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

## 7. Planned PostgreSQL and pgvector Integration

PostgreSQL serves as the single source of truth for repository cache, pre-computed embeddings, and chat histories.

### Key Data Entities
- **Repositories Table**: GitHub ID, owner, name, description, primary language, topics, stars, forks, license, default branch, last push timestamp, crawled README markdown.
- **Repository Embeddings Table**: Foreign key to repository, vector column (`vector(dim)`), chunk index, chunk text.
- **Search Queries / Analytics Table**: User query, extracted criteria, result count, execution latency.
- **Conversations & Messages Table**: Session ID, message role, content, repository context references for RAG.

---

## 8. Deployment Architecture (Vercel & Render)

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

## 9. Security & Secret Management Architecture

1. **Isolation of Secrets**: All API keys (`MISTRAL_API_KEY`, `GITHUB_TOKEN`, `DATABASE_URL`) exist exclusively in backend server environments. No secrets are bundled into client-side JS.
2. **CORS Whitelisting**: Strict origin validation prevents unauthorized cross-origin calls from arbitrary web origins.
3. **Input Sanitization**: Pydantic models validate all incoming payloads against injection, payload size limits, and type mismatches.
4. **Git Protection**: Robust `.gitignore` prevents inadvertent commits of `.env` or sensitive local configs.
