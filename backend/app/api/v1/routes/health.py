"""Health checks da API."""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.schemas.common import HealthResponse
from app.core.config import Settings, get_settings
from app.db.session import get_db_session

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.otel_service_name,
        version=settings.version,
        environment=settings.app_env,
        timestamp=datetime.now(UTC),
    )


@router.get("/health/live", response_model=HealthResponse)
def live(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(
        status="alive",
        service=settings.otel_service_name,
        version=settings.version,
        environment=settings.app_env,
        timestamp=datetime.now(UTC),
    )


@router.get("/health/ready", response_model=HealthResponse)
def ready(
    db: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> HealthResponse | JSONResponse:
    checks: dict[str, str] = {}
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "error"

    status = "ready" if all(value == "ok" for value in checks.values()) else "not_ready"
    response = HealthResponse(
        status=status,
        service=settings.otel_service_name,
        version=settings.version,
        environment=settings.app_env,
        timestamp=datetime.now(UTC),
        checks=checks,
    )
    if status != "ready":
        return JSONResponse(status_code=503, content=jsonable_encoder(response))
    return response
