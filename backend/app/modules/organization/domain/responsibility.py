"""Responsibility entity — responsabilidade funcional com âmbito e período.

Responsibility responde: que âmbito de responsabilidade um utilizador exerce.
O tipo (scope) é um ResponsibilityScope; o âmbito pode estar ligado a uma
unidade organizacional quando aplicável.
"""

import enum
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.modules.organization.domain.responsibility_scope import ResponsibilityScope


class ResponsibilityStatus(enum.StrEnum):
    """Estado do ciclo de vida da responsabilidade."""

    ACTIVE = "ACTIVE"
    ENDED = "ENDED"


RESPONSIBILITY_STATUS_LABELS: dict[ResponsibilityStatus, str] = {
    ResponsibilityStatus.ACTIVE: "Ativa",
    ResponsibilityStatus.ENDED: "Terminada",
}


class Responsibility(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Entidade funcional Responsibility.

    Representa uma responsabilidade funcional exercida por um utilizador,
    limitada por tipo e opcionalmente ligada a uma unidade organizacional.
    """

    __tablename__ = "responsibilities"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scope: Mapped[ResponsibilityScope] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )
    organizational_unit_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("organizational_units.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    resource_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    status: Mapped[ResponsibilityStatus] = mapped_column(
        String(20),
        nullable=False,
        default=ResponsibilityStatus.ACTIVE,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relacionamentos
    organizational_unit = relationship(
        "OrganizationalUnit",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Responsibility user={self.user_id} scope={self.scope}>"
