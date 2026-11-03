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

### AI & Data (Planned for Subsequent Phases)
- **Mistral API**: Primary LLM provider for intent extraction, reasoning, comparison, and RAG synthesis.
- **Sentence Transformers**: Dense vector embeddings for semantic code and document matching.
- **GitHub REST API (v3)**: Official API for repository discovery, metadata verification, and content ingestion.
- **PostgreSQL + pgvector**: Relational storage and vector database for similarity search and query caching.

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
| Variable | Description | Phase 1 Default |
|---|---|---|
| `FRONTEND_URL` | Allowed origin for frontend CORS | `http://localhost:5173` |
| `ALLOWED_ORIGINS` | Optional comma-separated extra CORS origins | *(empty)* |
| `MISTRAL_API_KEY` | Mistral AI API key (Backend only) | *(Leave empty for Phase 1)* |
| `GITHUB_TOKEN` | GitHub Personal Access Token (Backend only) | *(Leave empty for Phase 1)* |
| `DATABASE_URL` | PostgreSQL connection string with pgvector | *(Leave empty for Phase 1)* |

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

## 8. Commands to Run Frontend and Backend

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
  ```json
  {
    "message": "Welcome to OpenScout API"
  }
  ```
- **Health**: `GET http://localhost:8000/api/health`
  ```json
  {
    "status": "healthy",
    "service": "OpenScout Backend"
  }
  ```

---

## 9. Development Roadmap

- [x] **Phase 1: Project Initialization and Architecture Setup** *(Completed)*
  - Modular project structure, TypeScript/Vite/Tailwind setup, FastAPI core architecture, CORS configuration, health endpoints, environment templates, and comprehensive documentation.
- [x] **Phase 2: Complete Frontend UI Development** *(Completed)*
  - Modern developer-first UI (dark/light theme, Landing Page, Discover Projects with live filters, Repository Details, Multi-Repository Comparison matrix, Search History, Responsive Navigation & layout).
- [x] **Phase 3: FastAPI Backend Architecture** *(Completed)*
  - Production-ready FastAPI architecture with Pydantic v2 schemas, centralized settings, structured JSON/color logging, global error handling middleware, and modular routers (`/api/v1/search`, `/api/v1/repositories`, `/api/v1/compare`, `/api/v1/history`).
- [x] **Phase 4: GitHub REST API Integration** *(Completed)*
  - Async GitHub REST API client using HTTPX, live repository search with qualifiers (`language:`, `stars:>=`), owner/repo and ID lookup, rate-limit header parsing (`X-RateLimit-*`), exponential backoff on transient errors, and end-to-end integration with the React Discover and Repository Details UI.
- [ ] **Phase 5: Mistral AI Intent Extraction & Semantic Search**
  - Natural language intent extraction with Mistral AI, prompt engineering with structured Pydantic outputs, Sentence Transformers embeddings, and pgvector semantic matching.
- [ ] **Phase 6: Multi-Repository Comparison Engine & AI Explanations**
  - Side-by-side technical comparison matrices, documentation depth scoring, and tailored AI justifications.
- [ ] **Phase 7: RAG-Powered Repository Q&A Chatbot**
  - In-browser repository documentation chunking, contextual vector retrieval, and conversational query handling.
- [ ] **Phase 8: Production Hardening, CI/CD, and Cloud Deployment**
  - GitHub Actions CI/CD pipelines, Vercel frontend deployment, and Render backend & managed database provisioning.

