"""Delegation entity — delegação de responsabilidade.

Delegação: alguém transfere determinada responsabilidade a outro.
NÃO é o mesmo que substituição (alguém passa temporariamente a exercer
uma função). Conceitos mantidos separados.
"""

import enum
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.modules.organization.domain.responsibility_scope import ResponsibilityScope


class DelegationStatus(enum.StrEnum):
    """Estado do ciclo de vida da delegação."""

    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"


DELEGATION_STATUS_LABELS: dict[DelegationStatus, str] = {
    DelegationStatus.ACTIVE: "Ativa",
    DelegationStatus.REVOKED: "Revogada",
    DelegationStatus.EXPIRED: "Expirada",
}


class Delegation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Entidade Delegation.

    Um delegante transfere uma responsabilidade a um delegado por um
    período e âmbito definidos.
    """

    __tablename__ = "delegations"

    delegator_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    delegate_user_id: Mapped[uuid.UUID] = mapped_column(
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
    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    status: Mapped[DelegationStatus] = mapped_column(
        String(20),
        nullable=False,
        default=DelegationStatus.ACTIVE,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relacionamentos
    delegator = relationship(
        "User",
        foreign_keys=[delegator_user_id],
        lazy="selectin",
    )
    delegate = relationship(
        "User",
        foreign_keys=[delegate_user_id],
        lazy="selectin",
    )
    organizational_unit = relationship(
        "OrganizationalUnit",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Delegation {self.delegator_user_id} -> {self.delegate_user_id}>"
