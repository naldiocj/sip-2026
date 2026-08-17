"""Logging estruturado.

Os logs permitem identificar: timestamp, level, service, request_id,
correlation_id, user_id (quando disponível), endpoint, duration, error.
Nunca gravar passwords, tokens ou dados sensíveis.
"""

import logging
import sys

import structlog


def setup_logging() -> None:
    level = logging.getLevelName("INFO")

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=level,
    )

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    logger = structlog.get_logger(name or "sip")
    return logger  # type: ignore[no-any-return]
