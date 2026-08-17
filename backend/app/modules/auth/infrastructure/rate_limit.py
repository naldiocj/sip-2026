"""Rate limiting para endpoints sensíveis (login, refresh, password).

Implementação baseada em Redis com atomicidade garantida via Lua script.
Utilizado nos endpoints de autenticação; extensível a outros endpoints sensíveis.

Quando o Redis está indisponível, o limite falha-open (o serviço não
deixa de funcionar) — o comportamento é observável nos logs.
"""

import structlog
from redis import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings
from app.shared.cache import get_redis

logger = structlog.get_logger("auth.rate_limit")

# Lua script for atomic INCR + EXPIRE to prevent race conditions.
# Returns the new count after increment.
_LUA_INCR_EXPIRE = """
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current = redis.call("incr", key)
if current == 1 then
    redis.call("expire", key, window)
end
return current
"""


class RateLimiter:
    """Limita tentativas por chave (IP, username, etc.) numa janela."""

    def __init__(self) -> None:
        self._redis: Redis | None = None

    def _client(self) -> Redis:
        if self._redis is None:
            self._redis = get_redis()
        return self._redis

    def is_allowed(
        self, key: str, limit: int | None = None, window_seconds: int | None = None
    ) -> bool:
        """Regista uma tentativa e devolve True se dentro do limite."""
        settings = get_settings()
        if not settings.rate_limit_enabled:
            return True
        limit = limit or settings.login_rate_limit_attempts
        window_seconds = window_seconds or settings.login_rate_limit_window_seconds

        redis_key = f"rl:{key}"
        try:
            client = self._client()
            attempts = int(client.eval(_LUA_INCR_EXPIRE, 1, redis_key, limit, window_seconds))
            return attempts <= limit
        except RedisError:
            logger.warning("rate_limit_redis_unavailable", key=key)
            return True

    def remaining(self, key: str) -> int:
        """Tentativas restantes para a chave."""
        settings = get_settings()
        try:
            client = self._client()
            attempts = int(client.get(f"rl:{key}") or 0)
            return max(settings.login_rate_limit_attempts - attempts, 0)
        except RedisError:
            return settings.login_rate_limit_attempts
