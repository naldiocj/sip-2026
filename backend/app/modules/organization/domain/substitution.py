"""Substitution entity — substituição temporária de função.

Substituição: alguém passa temporariamente a exercer determinada função.
NÃO é lógica de RH — apenas a capacidade necessária para o contexto SIP.
Distinta de Delegação (alguém transfere responsabilidade).
"""

import enum
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.modules.organization.domain.functional_role import FunctionalRole


class SubstitutionStatus(enum.StrEnum):
    """Estado do ciclo de vida da substituição."""

    ACTIVE = "ACTIVE"
    ENDED = "ENDED"


SUBSTITUTION_STATUS_LABELS: dict[SubstitutionStatus, str] = {
    SubstitutionStatus.ACTIVE: "Ativa",
    SubstitutionStatus.ENDED: "Terminada",
}


class Substitution(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Entidade Substitution.

    Um substituto exerce temporariamente a função de um utilizador
    substituído numa unidade por um período definido.
    """

    __tablename__ = "substitutions"

    substituted_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    substitute_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organizational_unit_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("organizational_units.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    functional_role: Mapped[FunctionalRole | None] = mapped_column(
        String(30),
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
    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    status: Mapped[SubstitutionStatus] = mapped_column(
        String(20),
        nullable=False,
        default=SubstitutionStatus.ACTIVE,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relacionamentos
    substituted_user = relationship(
        "User",
        foreign_keys=[substituted_user_id],
        lazy="selectin",
    )
    substitute_user = relationship(
        "User",
        foreign_keys=[substitute_user_id],
        lazy="selectin",
    )
    organizational_unit = relationship(
        "OrganizationalUnit",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Substitution {self.substituted_user_id} <- {self.substitute_user_id}>"
