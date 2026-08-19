"""Entidade Organization."""

import enum

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class OrganizationStatus(enum.StrEnum):
    """Estado da organização."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class OrganizationType(enum.StrEnum):
    """Tipo de organização.

    Organizações INTERNAL pertencem à instituição SIP (ex.: SIC).
    Organizações EXTERNAL são entidades externas (ex.: PGR).
    """

    INTERNAL = "INTERNAL"
    EXTERNAL = "EXTERNAL"


ORGANIZATION_TYPE_LABELS: dict[OrganizationType, str] = {
    OrganizationType.INTERNAL: "Interna",
    OrganizationType.EXTERNAL: "Externa",
}


class Organization(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Entidade Organization.

    Representa a organização institucional principal.
    """

    __tablename__ = "organizations"

    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    short_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    organization_type: Mapped[OrganizationType] = mapped_column(
        String(20),
        nullable=False,
        default=OrganizationType.INTERNAL,
    )
    status: Mapped[OrganizationStatus] = mapped_column(
        String(20),
        nullable=False,
        default=OrganizationStatus.ACTIVE,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relacionamentos
    units = relationship(
        "OrganizationalUnit",
        back_populates="organization",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Organization {self.code}>"
