"""Entidade Person.

Representa uma pessoa real conhecida pelo SIP. Uma Person é
independente de um User — uma Person pode existir sem conta de utilizador.

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
    """Estado do ciclo de vida do registo de uma pessoa."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    RETIRED = "RETIRED"
    DECEASED = "DECEASED"
    UNKNOWN = "UNKNOWN"


class PersonalStatus(enum.StrEnum):
    """Estado pessoal opcional, de maior granularidade.

    Mantido mínimo — apenas estados com significado funcional.
    """

    CIVIL_SERVANT = "CIVIL_SERVANT"
    EXTERNAL = "EXTERNAL"
    OTHER = "OTHER"


class EmploymentStatus(enum.StrEnum):
    """Estado de emprego para os dados funcionais."""

    EMPLOYED = "EMPLOYED"
    ON_LEAVE = "ON_LEAVE"
    SUSPENDED = "SUSPENDED"
    TERMINATED = "TERMINATED"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class Person(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Uma pessoa real conhecida pelo SIP.

    Person representa a identidade de uma pessoa. Está deliberadamente
    separada de User (autenticação) e dos dados funcionais.
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

    # Relacionamentos
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
        """Nome preferido quando disponível; caso contrário, o nome completo."""
        return self.preferred_name or self.full_name


class PersonNumberGenerator:
    """Gera números de pessoa sequenciais (PES-000001)."""

    PREFIX = "PES"

    @staticmethod
    def next_number(last_number: str | None) -> str:
        """Devolve o próximo número de pessoa dado o último."""
        if last_number is None:
            return f"{PersonNumberGenerator.PREFIX}-000001"
        try:
            _, _, seq = last_number.rpartition("-")
            next_seq = int(seq) + 1
        except (ValueError, AttributeError):
            next_seq = 1
        return f"{PersonNumberGenerator.PREFIX}-{next_seq:06d}"
