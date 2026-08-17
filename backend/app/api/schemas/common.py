"""Schemas comuns da API."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    field: str | None = None
    message: str


class ApiErrorResponse(BaseModel):
    """Resposta consistente para erros.

    {
      "code": "VALIDATION_ERROR",
      "message": "...",
      "details": []
    }
    """

    code: str
    message: str
    details: list[ErrorDetail] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    timestamp: datetime
    checks: dict[str, str] = Field(default_factory=dict)
    extra: dict[str, Any] = Field(default_factory=dict)
