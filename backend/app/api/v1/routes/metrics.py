"""Métricas Prometheus."""

from fastapi import APIRouter
from starlette.responses import Response

from app.core.observability import metrics_response

router = APIRouter(tags=["metrics"])


@router.get("/metrics")
def metrics() -> Response:
    return metrics_response()
