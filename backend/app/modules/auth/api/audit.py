"""Router de auditoria: consulta do trilho de eventos (system.audit).

NUNCA expõe details sensíveis (o AuditService já os sanitiza na origem,
defesa em profundidade).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.auth.api.dependencies import require_permission
from app.modules.auth.domain.audit import AuditEvent, AuditEventType
from app.modules.auth.domain.user import User

router = APIRouter(prefix="/audit", tags=["audit"])


class AuditEventListItem(BaseModel):
    """Item do trilho de auditoria (sem dados sensíveis)."""

    id: str
    event_type: str
    user_id: str | None
    timestamp: str
    ip_address: str | None
    details: dict[str, object]


class AuditEventListResponse(BaseModel):
    """Resposta paginada do trilho de auditoria."""

    items: list[AuditEventListItem]
    total: int
    page: int
    page_size: int


@router.get("", response_model=AuditEventListResponse)
def list_audit_events(
    request: Request,
    user_id: uuid.UUID | None = None,
    event_type: str | None = None,
    page: int = 1,
    page_size: int = 50,
    user: User = Depends(require_permission("system.audit")),
    db: Session = Depends(get_db_session),
) -> AuditEventListResponse:
    """Lista eventos de auditoria, filtráveis por utilizador e tipo."""
    page = max(page, 1)
    page_size = min(max(page_size, 1), 200)

    stmt = select(AuditEvent)
    count_stmt = select(func.count()).select_from(AuditEvent)
    if user_id is not None:
        stmt = stmt.where(AuditEvent.user_id == user_id)
        count_stmt = count_stmt.where(AuditEvent.user_id == user_id)
    if event_type is not None:
        try:
            AuditEventType(event_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="event_type inválido",
            ) from None
        stmt = stmt.where(AuditEvent.event_type == event_type)
        count_stmt = count_stmt.where(AuditEvent.event_type == event_type)

    total = db.scalar(count_stmt) or 0
    events = list(
        db.scalars(
            stmt.order_by(AuditEvent.timestamp.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    )
    items = [
        AuditEventListItem(
            id=str(e.id),
            event_type=str(e.event_type),
            user_id=str(e.user_id) if e.user_id else None,
            timestamp=e.timestamp.isoformat(),
            ip_address=e.ip_address,
            details=e.details or {},
        )
        for e in events
    ]
    return AuditEventListResponse(items=items, total=total, page=page, page_size=page_size)
