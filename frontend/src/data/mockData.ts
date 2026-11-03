import type { Repository, SearchHistoryItem, QuickStat } from '../types'

export const DEMO_DATA_BADGE_TEXT = 'Demo Prototype Data — Phase 2 UI Simulation'

export const mockExamplePrompts: string[] = [
  'AI-powered healthcare chatbot using Python, FastAPI and React',
  'Full-stack e-commerce application with Next.js and Stripe',
  'Machine learning recommendation system with PyTorch',
  'Real-time collaborative markdown editor with WebSockets',
  'High-throughput API gateway with Go and Redis',
]

export const mockRepositories: Repository[] = [
  {
    id: 'medibot-ai-fastapi',
    name: 'MediBot-AI',
    owner: 'healthtech-labs',
    ownerAvatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=60',
    description: 'HIPAA-compliant conversational AI chatbot for clinical triage, symptoms inquiry, and patient appointment scheduling.',
    language: 'Python',
    stars: 8420,
    forks: 1140,
    watchers: 320,
    openIssues: 24,
    license: 'Apache-2.0',
    lastUpdated: '2 days ago',
    topics: ['healthcare', 'chatbot', 'fastapi', 'react', 'clinical-nlp', 'hipaa', 'mistral-ai'],
    difficulty: 'Beginner',
    matchReason: 'Directly implements healthcare conversational workflows using FastAPI on the backend and React on the frontend. Includes end-to-end Docker setup and step-by-step beginner guides.',
    githubUrl: 'https://github.com/healthtech-labs/medibot-ai',
    readmePreview: `# MediBot AI 🩺
An open-source, HIPAA-compliant patient communication and symptom triage chatbot.

## Architecture
- **Backend:** FastAPI + Python 3.11 with asynchronous endpoint design.
- **Frontend:** React + Tailwind CSS client with responsive chat widgets.
- **LLM Integration:** Pluggable provider interface (Mistral, Local Llama).
- **Storage:** PostgreSQL + pgvector for medical knowledge retrieval.

## Quick Start
1. Clone the repository
2. Set up environment variables
3. Run with Docker Compose`,
    installationInstructions: `git clone https://github.com/healthtech-labs/medibot-ai.git
cd medibot-ai
cp .env.example .env
docker compose up -d`,
    docQualityScore: 96,
    technologies: ['FastAPI', 'Python', 'React', 'Docker', 'PostgreSQL', 'Tailwind CSS'],
    suitabilitySummary: 'Exceptional fit for beginners building medical chatbots; features modular code, explicit type annotations, and full architectural diagrams.',
    defaultBranch: 'main',
  },
  {
    id: 'health-assistant-core',
    name: 'HealthAssistant-Core',
    owner: 'care-collective',
    ownerAvatar: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&auto=format&fit=crop&q=60',
    description: 'Extensible telehealth agent foundation featuring automated patient intake, medical history summarization, and EHR interoperability.',
    language: 'Python',
    stars: 12350,
    forks: 1890,
    watchers: 450,
    openIssues: 58,
    license: 'MIT',
    lastUpdated: '1 week ago',
    topics: ['telehealth', 'fastapi', 'python', 'react-spa', 'ehr-integration', 'langchain'],
    difficulty: 'Intermediate',
    matchReason: 'Production-ready FastAPI backend with FHIR standard compliance. Offers a cleanly decoupled React dashboard for clinical staff and patient messaging.',
    githubUrl: 'https://github.com/care-collective/health-assistant-core',
    readmePreview: `# HealthAssistant-Core
A modular telehealth orchestration platform built with FastAPI and React.

## Key Capabilities
- FHIR / HL7 compliant data models.
- Asynchronous Celery background workers for clinical document OCR.
- Real-time WebSockets consultation room.`,
    installationInstructions: `git clone https://github.com/care-collective/health-assistant-core.git
cd health-assistant-core
pip install -r backend/requirements.txt
cd frontend && npm install && npm run dev`,
    docQualityScore: 89,
    technologies: ['Python', 'FastAPI', 'React', 'Celery', 'Redis', 'FHIR'],
    suitabilitySummary: 'Ideal for intermediate teams needing FHIR EHR compliance and modular webhook architecture.',
    defaultBranch: 'main',
  },
  {
    id: 'commerce-forge',
    name: 'CommerceForge',
    owner: 'open-storefront',
    ownerAvatar: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=100&auto=format&fit=crop&q=60',
    description: 'Modern headless e-commerce engine with Next.js App Router, Stripe checkout, inventory management, and multi-currency support.',
    language: 'TypeScript',
    stars: 19400,
    forks: 3200,
    watchers: 780,
    openIssues: 42,
    license: 'MIT',
    lastUpdated: 'Yesterday',
    topics: ['ecommerce', 'nextjs', 'typescript', 'stripe', 'tailwind', 'graphql'],
    difficulty: 'Beginner',
    matchReason: 'Turnkey full-stack e-commerce starter with plug-and-play Stripe checkout, zero-config mock database seeders, and beginner-focused video walkthroughs.',
    githubUrl: 'https://github.com/open-storefront/commerce-forge',
    readmePreview: `# CommerceForge 🛍️
High-performance headless e-commerce store built for scale.

## Features
- Server-side rendered product catalog with ISR.
- Integrated Stripe Elements checkout.
- Admin dashboard with order tracking and inventory alerts.`,
    installationInstructions: `git clone https://github.com/open-storefront/commerce-forge.git
cd commerce-forge
npm install
npm run dev`,
    docQualityScore: 94,
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'Tailwind CSS', 'Prisma'],
    suitabilitySummary: 'Best-in-class e-commerce starter with enterprise-grade UI components and extensive documentation.',
    defaultBranch: 'main',
  },
  {
    id: 'rec-engine-pro',
    name: 'RecEngine-PyTorch',
    owner: 'deep-recs',
    ownerAvatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=60',
    description: 'Neural collaborative filtering and two-tower recommendation framework for e-commerce, content platforms, and personalized feeds.',
    language: 'Python',
    stars: 15200,
    forks: 2450,
    watchers: 610,
    openIssues: 33,
    license: 'BSD-3-Clause',
    lastUpdated: '3 days ago',
    topics: ['machine-learning', 'recommender-systems', 'pytorch', 'deep-learning', 'vector-search'],
    difficulty: 'Advanced',
    matchReason: 'Implements production two-tower deep learning embeddings with ONNX runtime export, benchmarking scripts on MovieLens datasets, and Redis vector caching.',
    githubUrl: 'https://github.com/deep-recs/rec-engine-pytorch',
    readmePreview: `# RecEngine PyTorch ⚡
Deep learning recommendation system with real-time inference support.

## Algorithms Included
- Deep Factorization Machines (DeepFM).
- Two-Tower Neural Collaborative Filtering.
- Graph Neural Networks for Cold-Start Items.`,
    installationInstructions: `pip install recengine-pytorch
# or from source:
git clone https://github.com/deep-recs/rec-engine-pytorch.git
cd rec-engine-pytorch && pip install -e .`,
    docQualityScore: 91,
    technologies: ['PyTorch', 'Python', 'CUDA', 'ONNX', 'Redis', 'FastAPI'],
    suitabilitySummary: 'Superior performance for data scientists building high-volume personalization feeds.',
    defaultBranch: 'master',
  },
  {
    id: 'sync-canvas',
    name: 'SyncCanvas',
    owner: 'collab-tools',
    ownerAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
    description: 'Real-time collaborative whiteboard and markdown document editor using CRDTs (Yjs), WebSockets, and React canvas.',
    language: 'TypeScript',
    stars: 10800,
    forks: 920,
    watchers: 290,
    openIssues: 19,
    license: 'MIT',
    lastUpdated: '4 days ago',
    topics: ['collaborative-editor', 'yjs', 'crdt', 'websockets', 'react', 'canvas'],
    difficulty: 'Intermediate',
    matchReason: 'Clean separation between the WebSocket sync server and the React UI. Provides conflict-free collaborative editing with cursor presence awareness.',
    githubUrl: 'https://github.com/collab-tools/sync-canvas',
    readmePreview: `# SyncCanvas 🎨
Zero-conflict real-time collaborative workspace powered by Yjs and WebSockets.

## Capabilities
- Multi-user cursor tracking.
- Offline-first mutation sync.
- Markdown export with live LaTeX math rendering.`,
    installationInstructions: `git clone https://github.com/collab-tools/sync-canvas.git
cd sync-canvas
npm install
npm run start:all`,
    docQualityScore: 88,
    technologies: ['TypeScript', 'React', 'Yjs', 'WebSockets', 'Node.js', 'Canvas API'],
    suitabilitySummary: 'Great for understanding CRDTs, multi-user awareness, and low-latency canvas rendering.',
    defaultBranch: 'main',
  },
  {
    id: 'gofast-mesh',
    name: 'GoFast-Mesh',
    owner: 'cloud-infra',
    ownerAvatar: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&auto=format&fit=crop&q=60',
    description: 'Sub-millisecond API gateway and service mesh sidecar written in Go with dynamic routing, circuit breaking, and OpenTelemetry tracing.',
    language: 'Go',
    stars: 23100,
    forks: 3840,
    watchers: 940,
    openIssues: 65,
    license: 'Apache-2.0',
    lastUpdated: '12 hours ago',
    topics: ['go', 'gateway', 'service-mesh', 'grpc', 'opentelemetry', 'microservices'],
    difficulty: 'Advanced',
    matchReason: 'High throughput, zero memory allocation HTTP/2 and gRPC proxy with dynamic configuration updates via etcd.',
    githubUrl: 'https://github.com/cloud-infra/gofast-mesh',
    readmePreview: `# GoFast-Mesh 🚀
High-performance cloud-native API gateway built in pure Go.

## Benchmarks
- 150k RPS per single core instance.
- p99 latency < 0.8ms under heavy TLS load.`,
    installationInstructions: `go install github.com/cloud-infra/gofast-mesh/cmd/mesh@latest
mesh run --config config.yaml`,
    docQualityScore: 95,
    technologies: ['Go', 'gRPC', 'HTTP/2', 'Redis', 'OpenTelemetry', 'eBPF'],
    suitabilitySummary: 'Indispensable for DevOps and backend architects requiring ultra-low latency API proxies.',
    defaultBranch: 'main',
  },
]

export const mockSearchHistory: SearchHistoryItem[] = [
  {
    id: 'hist-1',
    query: 'AI healthcare chatbot using Python, FastAPI and React for beginners',
    date: 'Today, 2:45 PM',
    resultsCount: 2,
    tags: ['Python', 'FastAPI', 'Healthcare', 'Beginner'],
  },
  {
    id: 'hist-2',
    query: 'Full-stack e-commerce application with Next.js and Stripe integration',
    date: 'Yesterday, 10:15 AM',
    resultsCount: 1,
    tags: ['TypeScript', 'Next.js', 'E-commerce'],
  },
  {
    id: 'hist-3',
    query: 'Machine learning recommendation system with PyTorch',
    date: 'Nov 1, 2026',
    resultsCount: 1,
    tags: ['Machine Learning', 'PyTorch', 'Python'],
  },
  {
    id: 'hist-4',
    query: 'Real-time collaborative markdown editor with WebSockets',
    date: 'Oct 29, 2026',
    resultsCount: 1,
    tags: ['TypeScript', 'React', 'WebSockets'],
  },
  {
    id: 'hist-5',
    query: 'Ultra low latency Go API gateway with telemetry',
    date: 'Oct 26, 2026',
    resultsCount: 1,
    tags: ['Go', 'Microservices', 'Gateway'],
  },
]

export const mockQuickStats: QuickStat[] = [
  {
    label: 'Indexed Repositories',
    value: '14,820+',
    change: '+380 this week',
    trend: 'up',
    description: 'Curated open-source projects across 32 languages',
  },
  {
    label: 'Intent Search Matches',
    value: '98.4%',
    change: '+1.2% accuracy',
    trend: 'up',
    description: 'Verified technical stack and intent alignment',
  },
  {
    label: 'Avg. Recommendation Fit',
    value: '94/100',
    change: 'High confidence',
    trend: 'neutral',
    description: 'Documentation depth and maintenance score',
  },
  {
    label: 'Community Projects',
    value: '1,250+',
    change: 'Open contributors',
    trend: 'up',
    description: 'Community-validated architectural blueprints',
  },
]

export const mockPopularTechTags = [
  'Python',
  'FastAPI',
  'React',
  'TypeScript',
  'Next.js',
  'PyTorch',
  'Go',
  'PostgreSQL',
  'Docker',
  'Tailwind CSS',
  'GraphQL',
  'WebSockets',
]

export const mockSuggestedCategories = [
  {
    title: 'AI & Healthcare Chatbots',
    description: 'HIPAA-aware bots, patient intake systems, and clinical NLP pipelines.',
    query: 'AI-powered healthcare chatbot using Python, FastAPI and React',
    count: '24 projects',
  },
  {
    title: 'Full-Stack Modern E-Commerce',
    description: 'Headless storefronts, Stripe checkouts, and microservice inventories.',
    query: 'Full-stack e-commerce application with Next.js and Stripe',
    count: '42 projects',
  },
  {
    title: 'Machine Learning & Embeddings',
    description: 'Two-tower recommendation, neural collaborative filtering, and vector search.',
    query: 'Machine learning recommendation system with PyTorch',
    count: '31 projects',
  },
  {
    title: 'Real-Time Collaboration',
    description: 'CRDTs, Yjs canvases, shared markdown pads, and live presence.',
    query: 'Real-time collaborative markdown editor with WebSockets',
    count: '18 projects',
  },
]
