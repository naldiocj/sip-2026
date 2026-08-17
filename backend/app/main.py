"""SIP — Sistema de Instrução Processual.

Backend FastAPI (Modular Monolith).
"""

from app.api.errors import register_exception_handlers
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.core.middleware import CorrelationIdMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

setup_logging()
settings = get_settings()


def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.version,
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.add_middleware(CorrelationIdMiddleware, settings=settings)

    application.include_router(api_router, prefix=settings.api_v1_prefix)

    register_exception_handlers(application)

    from app.core.observability import setup_observability

    setup_observability(application, settings)

    return application


app = create_app()
