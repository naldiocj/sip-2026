"""Tratamento global de erros.

Respostas consistentes em formato ApiErrorResponse.
Nunca expor stack traces ao utilizador.
"""

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.schemas.common import ApiErrorResponse, ErrorDetail


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        details = [
            ErrorDetail(
                field=".".join(str(part) for part in error.get("loc", [])[1:]) or None,
                message=str(error.get("msg", "Invalid value")),
            )
            for error in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content=ApiErrorResponse(
                code="VALIDATION_ERROR",
                message="Validation failed",
                details=details,
            ).model_dump(),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=ApiErrorResponse(
                code=f"HTTP_{exc.status_code}",
                message=str(exc.detail),
            ).model_dump(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        structlog.get_logger("errors").error(
            "unhandled_exception",
            path=request.url.path,
            error=repr(exc),
        )
        return JSONResponse(
            status_code=500,
            content=ApiErrorResponse(
                code="INTERNAL_ERROR",
                message="Internal server error",
            ).model_dump(),
        )
