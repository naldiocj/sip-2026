"""Entidade OrganizationalUnit."""

import enum
import uuid

from sqlalchemy import Boolean, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UnitStatus(enum.StrEnum):
    """Estado da unidade organizacional."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class OrganizationalUnit(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Entidade OrganizationalUnit.

    Representa uma unidade dentro da hierarquia organizacional.
    Utiliza parent_id para uma estrutura de árvore flexível.
    """

    __tablename__ = "organizational_units"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("organizations.id"),
        nullable=False,
        index=True,
    )
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("organizational_units.id"),
        nullable=True,
        index=True,
    )
    type_id: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )
    code: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
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
    status: Mapped[UnitStatus] = mapped_column(
        String(20),
        nullable=False,
        default=UnitStatus.ACTIVE,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    sort_order: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    # Relacionamentos
    organization = relationship(
        "Organization",
        back_populates="units",
        lazy="selectin",
    )
    parent = relationship(
        "OrganizationalUnit",
        remote_side="OrganizationalUnit.id",
        back_populates="children",
        lazy="selectin",
    )
    children = relationship(
        "OrganizationalUnit",
        back_populates="parent",
        lazy="selectin",
    )
    assignments = relationship(
        "UserAssignment",
        back_populates="organizational_unit",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<OrganizationalUnit {self.code or self.name}>"
