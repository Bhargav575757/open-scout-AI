# 🚀 OpenScout – AI-Powered Open Source Project Finder

**Discover, Explore, and Understand Open-Source Projects with AI.**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/Bhargav575757/open-scout-AI)
[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://openscout-ai-dun.vercel.app/)

## 🌐 Live Demo

**Try OpenScout:** https://openscout-ai-dun.vercel.app/

**GitHub Repository:** https://github.com/Bhargav575757/open-scout-AI

---

## 📌 Overview

OpenScout is an AI-powered open-source project discovery platform that helps developers find, evaluate, compare, and understand GitHub repositories using natural language queries.

Instead of manually searching through hundreds of repositories, users can describe their project requirements in simple English. OpenScout understands the query and discovers relevant repositories using AI-powered search and GitHub data.

### Example Query

> Find beginner-friendly AI healthcare chatbot projects using Python, FastAPI, and React with good documentation.

OpenScout analyzes the requirements and helps users discover relevant open-source projects.

---

## ✨ Key Features

- **AI-Powered Query Understanding:** Understands natural language queries using Mistral AI.
- **Semantic Repository Search:** Finds relevant repositories based on meaning and context.
- **Live GitHub Search:** Retrieves repository information using the GitHub REST API.
- **Repository Analysis:** Helps users evaluate repositories and their documentation.
- **AI-Powered Chatbot:** Answers questions using indexed repository documentation.
- **RAG-Based Retrieval:** Retrieves relevant information from repository content before generating responses.
- **Vector Embeddings:** Uses Sentence Transformers to represent repository content.
- **Repository Discovery:** Helps developers find projects based on technologies, difficulty, and requirements.

---

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS 4

### Backend
- Python
- FastAPI
- Pydantic
- Uvicorn

### AI and Machine Learning
- Mistral AI (`mistral-small-latest`)
- Sentence Transformers
- `all-MiniLM-L6-v2`
- Retrieval-Augmented Generation (RAG)
- Semantic Search

### Database
- PostgreSQL
- pgvector
- SQLAlchemy
- Alembic

### External APIs
- GitHub REST API
- Mistral AI API

### Deployment
- Vercel – Frontend
- Backend hosting – deployment configuration depends on the active backend service
- PostgreSQL – database hosting depends on the configured provider

---

## 🏗️ System Architecture

```text
             USER
               |
               v
       REACT FRONTEND
               |
               v
        FASTAPI BACKEND
               |
       +-------+--------+
       |                |
       v                v
  MISTRAL AI       GITHUB REST API
       |                |
       v                v
 QUERY UNDERSTANDING  REPOSITORY DATA
       |                |
       +-------+--------+
               |
               v
       SEMANTIC SEARCH
               |
               v
       SENTENCE TRANSFORMERS
               |
               v
        VECTOR DATABASE
         POSTGRESQL
          + pgvector
               |
               v
        RAG RETRIEVAL
               |
               v
        AI CHATBOT
               |
               v
       RESULTS TO USER
```

---

## 🔍 How OpenScout Works

1. The user enters a project requirement in natural language.
2. Mistral AI analyzes the query and extracts relevant requirements.
3. The backend searches GitHub for matching repositories.
4. Repository information is processed and converted into embeddings where applicable.
5. Semantic search helps identify relevant repositories.
6. PostgreSQL with pgvector stores and retrieves indexed vector data.
7. The RAG pipeline retrieves relevant repository information.
8. Mistral AI generates responses based on the retrieved context.
9. The frontend displays the results to the user.

---

## 📂 Project Structure

```text
open-scout-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   └── database/
│   │
│   ├── requirements.txt
│   └── alembic/
│
├── docs/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Bhargav575757/open-scout-AI.git
cd open-scout-AI
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup

Open another terminal:

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment.

**Windows:**

```bash
.venv\Scripts\activate
```

**Linux/macOS:**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn app.main:app --app-dir backend --reload --port 8000
```

### 4. Database Setup

If using the provided Docker Compose configuration:

```bash
docker compose up -d
```

Run database migrations using the project's configured Alembic setup:

```bash
alembic upgrade head
```

---

## 🔑 Environment Variables

Create a `.env` file based on `.env.example`.

Example configuration:

```env
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173

MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_MODEL=mistral-small-latest

GITHUB_TOKEN=your_github_token

DATABASE_URL=your_postgresql_database_url

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

VITE_API_BASE_URL=http://localhost:8000
```

**Important:** Never expose Mistral API keys, GitHub tokens, or database credentials in frontend code or public repositories.

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend welcome endpoint |
| GET | `/api/health` | Health check |
| POST | `/api/v1/understand-query` | Understand natural language queries |
| POST | `/api/v1/search/semantic-search` | Perform semantic search |
| POST | `/api/v1/repositories/{owner}/{repo}/index` | Index repository content |
| GET | `/api/v1/repositories/{owner}/{repo}/index-status` | Check indexing status |
| POST | `/api/v1/chat` | Ask questions through AI chatbot |
| GET | `/api/v1/chat/{conversation_id}/messages` | Retrieve conversation messages |

---

## 🧠 Retrieval-Augmented Generation (RAG)

OpenScout uses Retrieval-Augmented Generation to improve the relevance of chatbot responses.

### RAG Workflow

1. Repository documentation is collected and indexed.
2. Text is divided into smaller chunks.
3. Sentence Transformers converts chunks into vector embeddings.
4. Embeddings are stored in PostgreSQL using pgvector.
5. When a user asks a question, relevant chunks are retrieved.
6. Retrieved context is passed to Mistral AI.
7. Mistral generates a response grounded in the retrieved information.

**Benefits:**
- More relevant answers.
- Context-aware repository assistance.
- Better use of repository documentation.
- Reduced dependence on the model's general knowledge alone.

---

## 🚀 Deployment

### Frontend – Vercel

1. Open Vercel.
2. Import the GitHub repository.
3. Set the root directory to `frontend`.
4. Configure the build command:

```bash
npm run build
```

5. Set the output directory to:

```text
dist
```

6. Configure `VITE_API_BASE_URL` with the deployed backend URL.
7. Deploy the frontend.

### Backend – Hosting Provider

Configure the backend service with:

**Root directory:**

```text
backend
```

**Build command:**

```bash
pip install -r requirements.txt
```

**Start command:**

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Configure the required environment variables and PostgreSQL database connection in the hosting provider.

---

## 🎯 Use Cases

- Finding beginner-friendly open-source projects.
- Discovering AI and machine learning repositories.
- Exploring projects based on programming languages.
- Finding repositories for academic projects.
- Understanding unfamiliar GitHub repositories.
- Asking questions about repository documentation.
- Exploring projects based on technology requirements.

---

## 🛣️ Future Enhancements

- Multi-repository comparison engine.
- Advanced AI-generated repository explanations.
- Improved ranking and recommendation algorithms.
- Production hardening and performance optimization.
- CI/CD integration.
- Expanded repository documentation support.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Push the branch.
6. Submit a pull request.

---

## 👨‍💻 Author

**OpenScout Development Team**

GitHub: https://github.com/Bhargav575757/open-scout-AI

---

## 📄 License

This project is intended for educational and development purposes. Add or update the repository's license file to specify the applicable license.

---

<p align="center">
  <b>OpenScout – Discover Open Source Projects Smarter with AI 🚀</b>
</p>
