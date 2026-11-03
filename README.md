# OpenScout

> AI-Powered Open Source Project Finder

OpenScout is an intelligent discovery platform that helps developers find, evaluate, compare, and understand GitHub repositories using conversational, natural language queries.

---

## 1. Project Introduction

Finding the right open-source library or starter template often requires hours of sifting through search results, documentation, star counts, and outdated issues. Traditional discovery fails when developers have multi-faceted, contextual requirements.

For example, a user can ask:
> *"I want to build an AI healthcare chatbot using Python, FastAPI and React. I am a beginner and prefer repositories with good documentation."*

OpenScout decodes user intent, extracts technical and domain constraints with Mistral AI, queries live GitHub repositories, computes semantic similarity using vector embeddings, ranks projects by real-world relevance, and provides an interactive RAG-based chatbot to explore codebases without clone friction.

---

## 2. Project Objectives

- **Natural Language Query Understanding**: Translate free-form developer queries into structured search criteria.
- **AI-Powered Requirement Extraction**: Extract language, framework, domain, experience level, and license preferences using Mistral AI.
- **Live GitHub Repository Search**: Search and verify active GitHub repositories via the GitHub REST API.
- **Semantic Repository Matching**: Perform dense vector similarity matching with Sentence Transformers and `pgvector`.
- **Intelligent Relevance Ranking**: Score candidate projects using a hybrid metric balancing semantic fit, documentation completeness, and repository health.
- **AI-Generated Explanations**: Explain why a recommended project satisfies the user's specific context and constraints.
- **Repository Comparison**: Compare multiple candidate repositories side-by-side across architecture, activity, and community support.
- **RAG Repository Chatbot**: Provide conversational Q&A grounded directly in indexed repository documentation, READMEs, and codebase structure.

---

## 3. Technology Stack

### Frontend
- **React.js 19**: Modern UI library with component-driven architecture.
- **TypeScript**: End-to-end static typing and interface contracts.
- **Vite 8**: High-performance frontend bundler and development server.
- **Tailwind CSS 4**: Utility-first styling framework with modern theme integration.

### Backend
- **Python 3.14 / 3.13**: High-performance, type-annotated application core.
- **FastAPI**: Modern, async-first web framework with automatic OpenAPI documentation.
- **Pydantic & Pydantic-Settings**: Strict data validation, schema enforcement, and environment configuration.
- **Uvicorn**: Lightning-fast ASGI production web server.

### AI & Data
- **Mistral API**: Primary LLM provider for intent extraction, query understanding, and RAG synthesis (`mistral-small-latest`).
- **Sentence Transformers**: Dense vector embeddings (`sentence-transformers/all-MiniLM-L6-v2`, 384 dimensions) for semantic repository and document matching.
- **GitHub REST API (v3)**: Official API for repository discovery, metadata verification, and documentation ingestion.
- **PostgreSQL + pgvector**: Relational storage and vector database for repository embeddings, chunk indexes, and conversational chat history.
- **SQLAlchemy & Alembic**: Async ORM and database schema migration management.

### Deployment & CI/CD
- **GitHub**: Git version control and GitHub Actions automation.
- **Vercel**: Edge-optimized hosting for the React SPA frontend.
- **Render**: Containerized deployment for the FastAPI backend and managed PostgreSQL database.

---

## 4. Project Directory Structure

```
OpenScout/
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route views & dashboards
│   │   ├── services/           # API clients & backend integrations
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript types & interfaces
│   │   ├── assets/             # Static graphics and icons
│   │   ├── App.tsx             # Root React component
│   │   └── main.tsx            # React application entrypoint
│   ├── public/                 # Static assets (favicons, icons)
│   ├── package.json            # Node dependencies and scripts
│   └── .env.example            # Frontend environment variable template
│
├── backend/
│   ├── app/
│   │   ├── api/                # Modular API endpoints & routers
│   │   ├── core/               # Configuration & security settings
│   │   ├── models/             # Database ORM models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # Business logic & external clients
│   │   └── main.py             # FastAPI entrypoint & middleware setup
│   ├── tests/                  # Pytest test suite
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Backend environment variable template
│
├── docs/
│   └── ARCHITECTURE.md         # Comprehensive system architecture documentation
│
├── .gitignore                  # Git exclusions for secrets and builds
└── README.md                   # Project overview and setup documentation
```

---

## 5. Frontend Installation Instructions

Ensure you have **Node.js (>= 18.x)** and **npm** installed.

```powershell
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Build the frontend to verify TypeScript types and bundling
npm run build
```

---

## 6. Backend Installation Instructions

Ensure you have **Python 3.10+** installed.

```powershell
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 7. Environment Variable Setup

### Backend (`backend/.env`)
Copy the example file to create your local `.env`:
```powershell
cd backend
Copy-Item .env.example .env
```

Configuration keys:
| Variable | Description | Default |
|---|---|---|
| `FRONTEND_URL` | Allowed origin for frontend CORS | `http://localhost:5173` |
| `ALLOWED_ORIGINS` | Optional comma-separated extra CORS origins | *(empty)* |
| `MISTRAL_API_KEY` | Mistral AI API key (Backend only) | `your_mistral_api_key` |
| `MISTRAL_MODEL` | Mistral model identifier | `mistral-small-latest` |
| `GITHUB_TOKEN` | GitHub Personal Access Token (Backend only) | *(empty for unauthenticated search)* |
| `DATABASE_URL` | PostgreSQL connection string with pgvector | `postgresql+asyncpg://postgres:postgres@localhost:5432/openscout` |
| `EMBEDDING_MODEL` | HuggingFace sentence embedding model | `sentence-transformers/all-MiniLM-L6-v2` |
| `EMBEDDING_DIMENSION` | Dimensionality of dense vector embeddings | `384` |

### Frontend (`frontend/.env`)
Copy the example file to create your local `.env`:
```powershell
cd frontend
Copy-Item .env.example .env
```

Configuration keys:
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL accessible by browser | `http://localhost:8000` |

> **Security Rule**: API keys (`MISTRAL_API_KEY`, `GITHUB_TOKEN`, `DATABASE_URL`) must never be placed in frontend environment files or client-side code.

---

## 8. Commands to Run Frontend, Backend, and Database

### Running Database (PostgreSQL + pgvector via Docker)
From the project root:
```powershell
docker compose up -d
```

### Running Database Migrations (Alembic)
```powershell
cd backend
..\backend\.venv\Scripts\alembic upgrade head
```

### Running Backend (FastAPI)
From the project root:
```powershell
# Activate the virtual environment
.\backend\.venv\Scripts\Activate.ps1

# Start the development server
uvicorn app.main:app --app-dir backend --reload --port 8000
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Running Frontend (Vite)
From the project root in a separate terminal:
```powershell
cd frontend
npm run dev
```
- Frontend application URL: [http://localhost:5173](http://localhost:5173)

### Running Automated Backend Tests
```powershell
.\backend\.venv\Scripts\pytest backend/tests
```

### Verification Endpoints
- **Root**: `GET http://localhost:8000/`
- **Health**: `GET http://localhost:8000/api/health`
- **AI Query Understanding**: `POST http://localhost:8000/api/v1/understand-query`
- **Semantic Vector Search**: `POST http://localhost:8000/api/v1/search/semantic-search`
- **Index Repository**: `POST http://localhost:8000/api/v1/repositories/{owner}/{repo}/index`
- **Index Status**: `GET http://localhost:8000/api/v1/repositories/{owner}/{repo}/index-status`
- **RAG Chat**: `POST http://localhost:8000/api/v1/chat`
- **Chat History**: `GET http://localhost:8000/api/v1/chat/{conversation_id}/messages`

---

## 9. Deployment Guide

### A. Pushing to GitHub

1. Ensure all your local changes are committed:
   ```bash
   git add -A
   git commit -m "feat: complete project and production deployment setup"
   ```
2. Create a new repository on [GitHub](https://github.com/new) (e.g. `openscout`).
3. Link your local repository and push:
   ```bash
   # Rename branch to main if needed
   git branch -M main

   # Add your GitHub remote repository
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/openscout.git

   # Push code to GitHub
   git push -u origin main
   ```

> **Security Note**: All secrets (`.env`, credentials, local database caches) are protected by `.gitignore` and `.dockerignore`. Only `.env.example` templates are tracked in Git.

---

### B. Deploying Frontend to Vercel

The frontend is a modern React 19 + Vite SPA optimized for Vercel edge deployment with client-side routing support via `vercel.json`.

#### Option 1: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and click **"Add New..."** -> **"Project"**.
2. Connect your GitHub account and import your `openscout` repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: The public URL of your deployed backend (e.g. `https://openscout-backend.onrender.com`).
5. Click **Deploy**. Vercel will build and assign you a production URL (e.g. `https://openscout.vercel.app`).

#### Option 2: Deploying from Repository Root
A root [vercel.json](file:///c:/OpenScoutAI/vercel.json) is also provided. If you import the root repository without changing the root directory, Vercel will automatically build the `frontend` folder and route all SPA traffic to `/index.html`.

---

### C. Deploying Backend (Render / Railway / Container)

#### Option 1: Deploy on Render
1. Go to [render.com](https://render.com) and click **"New Web Service"**.
2. Connect your GitHub repository.
3. Configure:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token.
   - `MISTRAL_API_KEY`: Your Mistral AI API key.
   - `MISTRAL_MODEL`: `mistral-small-latest`.
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://openscout.vercel.app`).
   - `DATABASE_URL`: Your PostgreSQL connection string with `pgvector` (e.g. from Render PostgreSQL or Supabase).
   - `EMBEDDING_MODEL`: `sentence-transformers/all-MiniLM-L6-v2`.
   - `EMBEDDING_DIMENSION`: `384`.

#### Option 2: Deploy with Docker
A production [Dockerfile](file:///c:/OpenScoutAI/backend/Dockerfile) is provided in `backend/`:
```bash
docker build -t openscout-backend -f backend/Dockerfile backend/
docker run -p 8000:8000 --env-file backend/.env openscout-backend
```

---

## 10. Development Roadmap

- [x] **Phase 1: Project Initialization and Architecture Setup** *(Completed)*
  - Modular project structure, TypeScript/Vite/Tailwind setup, FastAPI core architecture, CORS configuration, health endpoints, environment templates, and comprehensive documentation.
- [x] **Phase 2: Complete Frontend UI Development** *(Completed)*
  - Modern developer-first UI (dark/light theme, Landing Page, Discover Projects with live filters, Repository Details, Multi-Repository Comparison matrix, Search History, Responsive Navigation & layout).
- [x] **Phase 3: FastAPI Backend Architecture** *(Completed)*
  - Production-ready FastAPI architecture with Pydantic v2 schemas, centralized settings, structured JSON/color logging, global error handling middleware, and modular routers (`/api/v1/search`, `/api/v1/repositories`, `/api/v1/compare`, `/api/v1/history`).
- [x] **Phase 4: GitHub REST API Integration** *(Completed)*
  - Async GitHub REST API client using HTTPX, live repository search with qualifiers (`language:`, `stars:>=`), owner/repo and ID lookup, rate-limit header parsing (`X-RateLimit-*`), exponential backoff on transient errors, and end-to-end integration with the React Discover and Repository Details UI.
- [x] **Phase 5: Mistral AI Integration & Natural Language Query Understanding** *(Completed)*
  - Official Mistral Python SDK (`mistral-small-latest`), structured prompt engineering, `ProjectRequirements` schema validation, defense against hallucinated languages vs frameworks, `POST /api/v1/understand-query`, end-to-end `POST /api/v1/ai-search` chained to GitHubService, and interactive frontend "Understanding your requirements" UI.
- [x] **Phase 6: Semantic Search, PostgreSQL, pgvector and RAG Chatbot** *(Completed)*
  - PostgreSQL schema and `pgvector` vector extension, Alembic async database migrations (`alembic/versions`), Docker Compose service (`pgvector/pgvector:pg16`), Sentence Transformers embedding engine (`sentence-transformers/all-MiniLM-L6-v2`, 384 dimensions), documentation crawler & markdown chunker (`ingestion_service.py`), semantic repository search engine (`semantic_search_service.py`), grounded RAG Q&A engine with citation tracking and persistence (`rag_service.py`), and React frontend integration (Semantic Search mode, similarity badges, interactive repository chatbot widget with index triggering and source citations).
- [ ] **Phase 7: Multi-Repository Comparison Engine & AI Explanations**
  - Side-by-side technical comparison matrices, documentation depth scoring, and tailored AI justifications.
- [ ] **Phase 8: Advanced Production Hardening, CI/CD, and Cloud Deployment**
  - GitHub Actions CI/CD pipelines, Vercel frontend deployment, and Render backend & managed database provisioning.

