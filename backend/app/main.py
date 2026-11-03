import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import get_logger, setup_logging
from app.schemas.common import RootResponse

logger = get_logger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle event manager handling initialization and graceful shutdown.
    """
    setup_logging()
    logger.info(
        "Starting %s v%s (environment: %s, debug: %s)",
        settings.APP_NAME,
        settings.APP_VERSION,
        "development" if settings.DEBUG else "production",
        settings.DEBUG,
    )
    logger.info("Configured CORS allowed origins: %s", settings.cors_origins)

    # Safe database verification on startup
    try:
        from app.core.database import init_db
        await init_db()
    except Exception as db_err:
        logger.warning("Database schema auto-sync skipped during startup: %s", db_err)

    yield

    # Graceful database teardown on shutdown
    try:
        from app.core.database import close_db
        await close_db()
    except Exception as close_err:
        logger.warning("Error closing database connections during shutdown: %s", close_err)

    logger.info("Shutting down %s gracefully...", settings.APP_NAME)


# Initialize FastAPI instance
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Open-Source Project Discovery Platform Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Register centralized custom exception handlers
register_exception_handlers(app)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    """
    Logs every inbound HTTP request with processing latency and appends
    an X-Process-Time header. Avoids logging query parameters or bodies that might contain secrets.
    """
    start_time = time.perf_counter()
    response: Response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000.0

    response.headers["X-Process-Time"] = f"{duration_ms:.2f}ms"

    # Avoid cluttering logs with polling endpoints unless debug is enabled
    if not (request.url.path.endswith("/health") and not settings.DEBUG):
        logger.info(
            "%s %s -> %d (%.2fms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )

    return response


# Include modular API routers
app.include_router(api_router)


@app.get(
    "/",
    response_model=RootResponse,
    status_code=status.HTTP_200_OK,
    summary="Root Welcome Endpoint",
    description="Returns service name, semantic version, and API documentation path.",
    tags=["Root"],
)
async def read_root() -> RootResponse:
    return RootResponse(
        message="Welcome to OpenScout API",
        version=settings.APP_VERSION,
        docs_url="/docs",
    )
