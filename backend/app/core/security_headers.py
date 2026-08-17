"""Middleware de security headers.

Aplica headers de segurança a todas as respostas da API:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security: apenas em produção (HTTPS)
- Content-Security-Policy: configurável; não aplicada aos endpoints de
  documentação (/docs, /redoc, /openapi.json) para não quebrar o Swagger.

A CSP da aplicação Next.js é responsabilidade do frontend — aqui a
política aplica-se apenas às respostas da API.
"""

from collections.abc import Awaitable, Callable
from typing import Any

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import Settings

_DOCS_PATHS = {"/docs", "/redoc", "/openapi.json", "/api/docs", "/api/redoc", "/api/openapi.json"}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: Any, settings: Settings) -> None:
        super().__init__(app)
        self.settings = settings

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        response = await call_next(request)
        if not self.settings.security_headers_enabled:
            return response

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if self.settings.app_env == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        if self.settings.content_security_policy and request.url.path not in _DOCS_PATHS:
            response.headers["Content-Security-Policy"] = self.settings.content_security_policy
        return response
