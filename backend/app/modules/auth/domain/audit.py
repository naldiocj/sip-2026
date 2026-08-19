"""Entidade de eventos de auditoria.

Fundação de auditoria de segurança — registar eventos importantes:

- LOGIN_SUCCESS
- LOGIN_FAILED
- LOGOUT
- ACCOUNT_BLOCKED
- PASSWORD_CHANGED
- PERMISSION_DENIED
- SESSION_REVOKED

Permite responder futuramente a: quem, quando, o quê, origem, resultado.
NUNCA guardar passwords ou tokens neste modelo (nem nos details).
"""

import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AuditEventType(enum.StrEnum):
    """Tipos de eventos de segurança auditáveis."""

    # Eventos de autenticação
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED = "LOGIN_FAILED"
    LOGOUT = "LOGOUT"
    ACCOUNT_BLOCKED = "ACCOUNT_BLOCKED"
    PASSWORD_CHANGED = "PASSWORD_CHANGED"
    PERMISSION_DENIED = "PERMISSION_DENIED"
    SESSION_REVOKED = "SESSION_REVOKED"

    # Eventos de organização
    ORGANIZATION_CREATED = "ORGANIZATION_CREATED"
    ORGANIZATION_UPDATED = "ORGANIZATION_UPDATED"
    UNIT_CREATED = "UNIT_CREATED"
    UNIT_UPDATED = "UNIT_UPDATED"
    UNIT_MOVED = "UNIT_MOVED"
    UNIT_DEACTIVATED = "UNIT_DEACTIVATED"
    USER_ASSIGNED = "USER_ASSIGNED"
    USER_UNASSIGNED = "USER_UNASSIGNED"
    SCOPE_CHANGED = "SCOPE_CHANGED"

    # Eventos de pessoas
    PERSON_CREATED = "PERSON_CREATED"
    PERSON_UPDATED = "PERSON_UPDATED"
    PERSON_DEACTIVATED = "PERSON_DEACTIVATED"
    USER_PERSON_LINKED = "USER_PERSON_LINKED"
    USER_PERSON_UNLINKED = "USER_PERSON_UNLINKED"

    # Eventos de ciclo de vida do utilizador
    USER_CREATED = "USER_CREATED"
    USER_UPDATED = "USER_UPDATED"
    USER_ACTIVATED = "USER_ACTIVATED"
    USER_DEACTIVATED = "USER_DEACTIVATED"
    USER_BLOCKED = "USER_BLOCKED"
    USER_UNBLOCKED = "USER_UNBLOCKED"
    USER_PROFILE_ASSIGNED = "USER_PROFILE_ASSIGNED"
    USER_PROFILE_REMOVED = "USER_PROFILE_REMOVED"
    USER_PRIMARY_ASSIGNMENT_CHANGED = "USER_PRIMARY_ASSIGNMENT_CHANGED"

    # Eventos de atribuições
    ASSIGNMENT_CREATED = "ASSIGNMENT_CREATED"
    ASSIGNMENT_UPDATED = "ASSIGNMENT_UPDATED"
    ASSIGNMENT_ENDED = "ASSIGNMENT_ENDED"

    # Eventos de responsabilidades
    RESPONSIBILITY_CREATED = "RESPONSIBILITY_CREATED"
    RESPONSIBILITY_UPDATED = "RESPONSIBILITY_UPDATED"
    RESPONSIBILITY_ENDED = "RESPONSIBILITY_ENDED"

    # Eventos de delegações
    DELEGATION_CREATED = "DELEGATION_CREATED"
    DELEGATION_REVOKED = "DELEGATION_REVOKED"

    # Eventos de substituições
    SUBSTITUTION_CREATED = "SUBSTITUTION_CREATED"
    SUBSTITUTION_ENDED = "SUBSTITUTION_ENDED"


class AuditResult(enum.StrEnum):
    """Resultado do evento auditado."""

    SUCCESS = "success"
    FAILURE = "failure"


class AuditEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Evento de auditoria de segurança."""

    __tablename__ = "audit_events"

    event_type: Mapped[AuditEventType] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )
    user_agent: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    details: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )
    result: Mapped[AuditResult] = mapped_column(
        String(20),
        nullable=False,
        default=AuditResult.SUCCESS,
    )

    def __repr__(self) -> str:
        return f"<AuditEvent {self.event_type} user={self.user_id}>"
