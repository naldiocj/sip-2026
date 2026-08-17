"""Middleware de correlação.

Garante X-Request-ID e X-Correlation-ID em todas as respostas.
Se o cliente não enviar, gera automaticamente.
O mesmo correlation_id pode ser propagado para logs, filas e workers.
"""

import time
import uuid
from collections.abc import Awaitable, Callable
from typing import Any

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import Settings
from app.core.context import correlation_id_var, request_id_var


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: Any, settings: Settings) -> None:
        super().__init__(app)
        self.settings = settings

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        request_id = request.headers.get(self.settings.request_id_header) or str(uuid.uuid4())
        correlation_id = request.headers.get(self.settings.correlation_id_header) or str(
            uuid.uuid4()
        )

        request_id_var.set(request_id)
        correlation_id_var.set(correlation_id)
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            correlation_id=correlation_id,
            service=self.settings.otel_service_name,
        )

        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        response.headers[self.settings.request_id_header] = request_id
        response.headers[self.settings.correlation_id_header] = correlation_id

        structlog.get_logger("http").info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )
        return response
