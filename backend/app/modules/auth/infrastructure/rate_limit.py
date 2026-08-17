"""Rate limiting para endpoints sensíveis (login, refresh, password).

Implementação simples baseada em Redis (janela fixa). Utilizado nos
endpoints de autenticação; extensível a outros endpoints sensíveis.

Quando o Redis está indisponível, o limite falha-open (o serviço não
deixa de funcionar) — o comportamento é observável nos logs.
"""

import structlog
from redis import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings
from app.shared.cache import get_redis

logger = structlog.get_logger("auth.rate_limit")


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
            attempts = int(client.incr(redis_key))
            if attempts == 1:
                client.expire(redis_key, window_seconds)
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
