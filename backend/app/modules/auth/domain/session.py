"""Entidade de sessão do utilizador.

As sessões permitem revogar o acesso (logout, incidentes de segurança).
O suporte completo a refresh tokens está preparado aqui e será activado
numa sprint futura, mantendo a arquitectura revogável desde o início.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Sessão de autenticação do utilizador.

    Uma sessão é criada no login e revogada no logout ou quando o acesso
    precisa de ser cortado. O access token transporta o id da sessão para
    que a revogação seja imposta em todos os pedidos autenticados.
    """

    __tablename__ = "user_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )
    user_agent: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="sessions",
    )

    @property
    def is_revoked(self) -> bool:
        """Indica se a sessão foi revogada."""
        return self.revoked_at is not None

    def revoke(self) -> None:
        """Revoga esta sessão (idempotente)."""
        if self.revoked_at is None:
            self.revoked_at = datetime.now(UTC)

    def __repr__(self) -> str:
        return f"<UserSession {self.id} user={self.user_id}>"
