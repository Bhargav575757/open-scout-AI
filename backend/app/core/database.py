import asyncio
from typing import AsyncGenerator, Optional
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings
from app.core.exceptions import DatabaseConnectionException, DatabaseException
from app.core.logging import get_logger
from app.models.base import Base

logger = get_logger("app.core.database")

# Global engine and sessionmaker instances
_engine: Optional[AsyncEngine] = None
_sessionmaker: Optional[async_sessionmaker[AsyncSession]] = None


def get_normalized_database_url(url: Optional[str] = None) -> str:
    """
    Ensures the database connection URL uses an async-compatible driver.
    Converts 'postgresql://' to 'postgresql+asyncpg://'.
    Normalizes 'sslmode=' to 'ssl=' for asyncpg compatibility.
    """
    raw = (url or settings.DATABASE_URL).strip()
    if not raw:
        # Fallback to local default
        return "postgresql+asyncpg://postgres:postgres@localhost:5432/openscout"
    if raw.startswith("postgresql://"):
        raw = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql+asyncpg://", 1)
    elif raw.startswith("sqlite://") and not raw.startswith("sqlite+aiosqlite://"):
        raw = raw.replace("sqlite://", "sqlite+aiosqlite://", 1)

    # Supabase / PostgreSQL query params:
    # asyncpg expects 'ssl' parameter instead of 'sslmode'
    if "sslmode=" in raw:
        raw = raw.replace("sslmode=", "ssl=")

    return raw


def get_engine() -> AsyncEngine:
    """
    Returns or lazily creates the async SQLAlchemy engine.
    """
    global _engine
    if _engine is None:
        db_url = get_normalized_database_url()
        is_sqlite = db_url.startswith("sqlite")
        connect_args = {"check_same_thread": False} if is_sqlite else {}

        _engine = create_async_engine(
            db_url,
            echo=settings.DATABASE_ECHO,
            connect_args=connect_args,
            pool_pre_ping=True,
            future=True,
        )
        logger.info("Initialized AsyncEngine for database URL: %s", db_url.split("@")[-1] if "@" in db_url else db_url)
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    """
    Returns or lazily creates the async session factory.
    """
    global _sessionmaker
    if _sessionmaker is None:
        engine = get_engine()
        _sessionmaker = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _sessionmaker


async def check_database_health() -> bool:
    """
    Verifies that the database is reachable and accepting queries.
    Raises DatabaseConnectionException if connection fails.
    """
    engine = get_engine()
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except (OperationalError, OSError, ConnectionRefusedError) as exc:
        logger.error("Database health check failed: %s", str(exc))
        raise DatabaseConnectionException(
            "Could not connect to PostgreSQL database. Please ensure the database service is running.",
            details={"error": str(exc)},
        ) from exc
    except Exception as exc:
        logger.error("Unexpected error during database health check: %s", str(exc))
        raise DatabaseException(f"Database error: {str(exc)}") from exc


async def init_db(engine: Optional[AsyncEngine] = None) -> None:
    """
    Initializes database schema. Enables pgvector extension if on PostgreSQL,
    then executes create_all for all defined SQLAlchemy models.
    """
    active_engine = engine or get_engine()
    try:
        async with active_engine.begin() as conn:
            db_url = str(active_engine.url)
            if "postgresql" in db_url:
                try:
                    await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                    logger.info("pgvector extension verified or created.")
                except Exception as ext_err:
                    logger.warning("Could not execute CREATE EXTENSION vector: %s", ext_err)

            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables successfully synchronized.")
    except Exception as exc:
        logger.error("Database table initialization failed: %s", str(exc))
        raise DatabaseConnectionException(
            f"Failed to initialize database tables: {str(exc)}",
            details={"error": str(exc)},
        ) from exc


async def close_db() -> None:
    """
    Closes database engine connections gracefully.
    """
    global _engine, _sessionmaker
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _sessionmaker = None
        logger.info("Database connections closed.")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an active async SQLAlchemy session.
    Commits on successful completion or rolls back on exception.
    """
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
