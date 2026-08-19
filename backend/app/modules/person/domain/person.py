"""Person entity.

Represents a real person known to the SIP. A Person is
independent of a User — a Person may exist without a User account.

Regra arquitectural: dados pessoais, dados funcionais e dados de
autenticação são separados. Person NUNCA contém password ou dados de
autenticação.
"""

import enum
from datetime import date

from sqlalchemy import Boolean, Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PersonStatus(enum.StrEnum):
    """Lifecycle status of a person record."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    RETIRED = "RETIRED"
    DECEASED = "DECEASED"
    UNKNOWN = "UNKNOWN"


class PersonalStatus(enum.StrEnum):
    """Optional finer-grained personal status.

    Kept minimal — only states with functional meaning.
    """

    CIVIL_SERVANT = "CIVIL_SERVANT"
    EXTERNAL = "EXTERNAL"
    OTHER = "OTHER"


class EmploymentStatus(enum.StrEnum):
    """Employment status for functional data."""

    EMPLOYED = "EMPLOYED"
    ON_LEAVE = "ON_LEAVE"
    SUSPENDED = "SUSPENDED"
    TERMINATED = "TERMINATED"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class Person(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A real person known to the SIP.

    Person represents the identity of a person. It is deliberately
    separate from User (authentication) and from functional data.
    """

    __tablename__ = "persons"

    person_number: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    preferred_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    birth_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    birth_place: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    nationality: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    gender: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )
    bi_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )
    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )
    address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    status: Mapped[PersonStatus] = mapped_column(
        String(20),
        nullable=False,
        default=PersonStatus.ACTIVE,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Functional data (dados funcionais — separados dos pessoais).
    employee_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        unique=True,
        index=True,
    )
    functional_category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    job_title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    admission_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    employment_status: Mapped[EmploymentStatus | None] = mapped_column(
        String(30),
        nullable=True,
    )
    professional_registration: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    user = relationship(
        "User",
        back_populates="person",
        uselist=False,
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Person {self.person_number} {self.full_name}>"

    @property
    def display_name(self) -> str:
        """Preferred name when available, otherwise full name."""
        return self.preferred_name or self.full_name


class PersonNumberGenerator:
    """Generates sequential person numbers (PES-000001)."""

    PREFIX = "PES"

    @staticmethod
    def next_number(last_number: str | None) -> str:
        """Return the next person number given the last one."""
        if last_number is None:
            return f"{PersonNumberGenerator.PREFIX}-000001"
        try:
            _, _, seq = last_number.rpartition("-")
            next_seq = int(seq) + 1
        except (ValueError, AttributeError):
            next_seq = 1
        return f"{PersonNumberGenerator.PREFIX}-{next_seq:06d}"
