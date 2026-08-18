"""Organization entity."""

import enum

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class OrganizationStatus(enum.StrEnum):
    """Organization status."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Organization(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Organization entity.

    Represents the main institutional organization.
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

    # Relationships
    units = relationship(
        "OrganizationalUnit",
        back_populates="organization",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Organization {self.code}>"
