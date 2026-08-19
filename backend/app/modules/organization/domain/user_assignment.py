"""Entidade UserAssignment."""

import enum
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AssignmentType(enum.StrEnum):
    """Tipos de atribuições de utilizadores a unidades organizacionais."""

    PRIMARY = "PRIMARY"
    SECONDARY = "SECONDARY"
    TEMPORARY = "TEMPORARY"
    ACTING = "ACTING"
    DELEGATED = "DELEGATED"


ASSIGNMENT_TYPE_LABELS: dict[AssignmentType, str] = {
    AssignmentType.PRIMARY: "Principal",
    AssignmentType.SECONDARY: "Secundária",
    AssignmentType.TEMPORARY: "Temporária",
    AssignmentType.ACTING: "Interino",
    AssignmentType.DELEGATED: "Delegada",
}


class AssignmentStatus(enum.StrEnum):
    """Estado da atribuição."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class UserAssignment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Atribuição de utilizador a unidade organizacional.

    Liga utilizadores a unidades organizacionais com tipo e período.
    """

    __tablename__ = "user_assignments"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    organizational_unit_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("organizational_units.id"),
        nullable=False,
        index=True,
    )
    assignment_type: Mapped[AssignmentType] = mapped_column(
        String(30),
        nullable=False,
        default=AssignmentType.PRIMARY,
    )
    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    status: Mapped[AssignmentStatus] = mapped_column(
        String(20),
        nullable=False,
        default=AssignmentStatus.ACTIVE,
    )

    # Relacionamentos
    organizational_unit = relationship(
        "OrganizationalUnit",
        back_populates="assignments",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<UserAssignment user={self.user_id} unit={self.organizational_unit_id}>"
