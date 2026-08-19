"""Entidade User."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserStatus(enum.StrEnum):
    """Estado da conta do utilizador."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    BLOCKED = "BLOCKED"
    PENDING = "PENDING"


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Entidade User.

    Representa um utilizador do sistema com credenciais de
    autenticação e informação de perfil.
    """

    __tablename__ = "users"

    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    employee_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    status: Mapped[UserStatus] = mapped_column(
        String(20),
        nullable=False,
        default=UserStatus.ACTIVE,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    person_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("persons.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )

    # Relacionamentos
    person = relationship(
        "Person",
        back_populates="user",
        uselist=False,
        lazy="selectin",
    )
    profiles = relationship(
        "Profile",
        secondary="user_profiles",
        back_populates="users",
        lazy="selectin",
    )
    sessions = relationship(
        "UserSession",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User {self.username}>"
