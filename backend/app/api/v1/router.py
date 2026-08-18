"""Router principal da API v1."""

from fastapi import APIRouter

from app.api.v1.routes import health, metrics
from app.modules.auth.api import router as auth_router
from app.modules.organization.api.router import (
    assignments_router,
    me_router,
    unit_types_router,
    units_router,
)
from app.modules.organization.api.router import (
    router as org_router,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(metrics.router)
api_router.include_router(auth_router.router)
api_router.include_router(org_router)
api_router.include_router(units_router)
api_router.include_router(unit_types_router)
api_router.include_router(assignments_router)
api_router.include_router(me_router)
