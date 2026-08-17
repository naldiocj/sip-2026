"""Abstração de cache (Redis).

NÃO espalhar Redis pela aplicação sem necessidade.
Todo o acesso deve passar por esta abstração.
"""

from functools import lru_cache

from redis import Redis

from app.core.config import get_settings


@lru_cache
def get_redis() -> Redis:
    """Cliente Redis (lazy, criado uma única vez por processo)."""
    return Redis.from_url(
        get_settings().redis_url,
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
    )


def ping_redis() -> bool:
    try:
        return bool(get_redis().ping())
    except Exception:
        return False
