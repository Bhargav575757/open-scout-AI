from fastapi import APIRouter
from app.api.routes.chat import router as chat_router
from app.api.routes.compare import router as compare_router
from app.api.routes.health import router as health_router
from app.api.routes.history import router as history_router
from app.api.routes.repositories import router as repositories_router
from app.api.routes.search import router as search_router

# Version 1 API router
api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(health_router)
api_v1_router.include_router(search_router)
api_v1_router.include_router(repositories_router)
api_v1_router.include_router(compare_router)
api_v1_router.include_router(history_router)
api_v1_router.include_router(chat_router)

# Legacy router maintaining Phase 1 compatibility (GET /api/health)
legacy_router = APIRouter(prefix="/api")
legacy_router.include_router(health_router)

# Combined top-level router
api_router = APIRouter()
api_router.include_router(api_v1_router)
api_router.include_router(legacy_router)
