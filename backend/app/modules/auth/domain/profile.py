"""Profile entity and enum."""

import enum

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ProfileEnum(enum.StrEnum):
    """Official system profiles.

    Technical codes for internal use. Human-readable names
    are provided in the profile_labels mapping.
    """

    ADMINISTRADOR_SISTEMA = "ADMINISTRADOR_SISTEMA"
    DIRECTOR = "DIRECTOR"
    SECRETARIA_GERAL = "SECRETARIA_GERAL"
    CHEFE_DEPARTAMENTO = "CHEFE_DEPARTAMENTO"
    CHEFE_SECCAO = "CHEFE_SECCAO"
    INSTRUTOR_PROCESSUAL = "INSTRUTOR_PROCESSUAL"
    AGENTE_PIQUETE = "AGENTE_PIQUETE"
    EDITOR_DOCUMENTAL = "EDITOR_DOCUMENTAL"
    AGENTE_PGR = "AGENTE_PGR"


# Human-readable labels for profiles (Portuguese)
PROFILE_LABELS: dict[ProfileEnum, str] = {
    ProfileEnum.ADMINISTRADOR_SISTEMA: "Administrador do Sistema",
    ProfileEnum.DIRECTOR: "Director",
    ProfileEnum.SECRETARIA_GERAL: "Secretaria Geral",
    ProfileEnum.CHEFE_DEPARTAMENTO: "Chefe de Departamento",
    ProfileEnum.CHEFE_SECCAO: "Chefe de Secção",
    ProfileEnum.INSTRUTOR_PROCESSUAL: "Instrutor Processual",
    ProfileEnum.AGENTE_PIQUETE: "Agente de Piquete",
    ProfileEnum.EDITOR_DOCUMENTAL: "Editor Documental",
    ProfileEnum.AGENTE_PGR: "Agente PGR",
}


class Profile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Profile entity.

    Represents a system profile with associated permissions.
    """

    __tablename__ = "profiles"

    code: Mapped[ProfileEnum] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Relationships
    users = relationship(
        "User",
        secondary="user_profiles",
        back_populates="profiles",
        lazy="selectin",
    )
    permissions = relationship(
        "Permission",
        secondary="profile_permissions",
        back_populates="profiles",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Profile {self.code}>"

    @property
    def label(self) -> str:
        """Human-readable label for this profile."""
        return PROFILE_LABELS.get(self.code, self.code)
