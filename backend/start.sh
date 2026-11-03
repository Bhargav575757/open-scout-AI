#!/bin/sh
set -e

echo "Applying Alembic database migrations..."
if alembic upgrade head; then
    echo "Alembic migrations completed successfully."
else
    echo "Warning: Alembic migration encountered an issue or database is starting up. Continuing..."
fi

echo "Starting Uvicorn web server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"

