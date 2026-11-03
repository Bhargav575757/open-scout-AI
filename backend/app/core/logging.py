import logging
import sys
from app.core.config import settings

# Sensitive keywords that should never be printed in plain text
SENSITIVE_PATTERNS = ["api_key", "token", "password", "secret", "authorization"]


class SensitiveDataFilter(logging.Filter):
    """
    Ensures accidental inclusion of sensitive keywords or tokens in log records
    is caught and masked.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern in SENSITIVE_PATTERNS:
                if pattern in record.msg.lower() and "=" in record.msg:
                    record.msg = f"[REDACTED CONTENT - CONTAINS {pattern.upper()}]"
        return True


def setup_logging() -> None:
    """
    Configures application-wide structured console logging.
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    log_format = (
        "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    )

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Avoid duplicate handlers on reload
    if not root_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)
        formatter = logging.Formatter(log_format, datefmt="%Y-%m-%d %H:%M:%S")
        handler.setFormatter(formatter)
        handler.addFilter(SensitiveDataFilter())
        root_logger.addHandler(handler)

    # Quiet overly noisy external loggers if in non-debug mode
    if not settings.DEBUG:
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured logger instance for a given module name.
    """
    return logging.getLogger(name)

