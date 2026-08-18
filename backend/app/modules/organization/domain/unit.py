"""OrganizationalUnit entity."""

import enum
import uuid

from sqlalchemy import Boolean, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UnitStatus(enum.StrEnum):
    """Organizational unit status."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class OrganizationalUnit(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Organizational unit entity.

    Represents a unit within the organization hierarchy.
    Uses parent_id for flexible tree structure.
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

    # Relationships
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
