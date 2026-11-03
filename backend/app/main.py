from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.schemas.health import RootResponse

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="OpenScout - AI-Powered Open Source Project Discovery Platform Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS dynamically from environment configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get(
    "/",
    response_model=RootResponse,
    status_code=status.HTTP_200_OK,
    summary="Root Endpoint",
    description="Welcome endpoint for the OpenScout API service.",
    tags=["Root"],
)
async def read_root() -> RootResponse:
    return RootResponse(message="Welcome to OpenScout API")
