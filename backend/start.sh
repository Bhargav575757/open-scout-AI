#!/bin/sh
set -e

# Run database migrations unless explicitly skipped (e.g. when Render preDeployCommand is used)
if [ "${SKIP_STARTUP_MIGRATIONS}" = "true" ] || [ "${SKIP_STARTUP_MIGRATIONS}" = "1" ]; then
    echo "Skipping startup migrations because SKIP_STARTUP_MIGRATIONS is enabled."
else
    echo "Applying Alembic database migrations..."
    alembic upgrade head
    echo "Alembic migrations completed successfully."
fi

echo "Starting Uvicorn web server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
