"""Router principal da API v1."""

from fastapi import APIRouter

from app.api.v1.routes import health, metrics
from app.modules.auth.api import router as auth_router

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(metrics.router)
api_router.include_router(auth_router.router)
