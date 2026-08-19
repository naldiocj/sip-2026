"""FunctionalRole — função exercida na estrutura institucional.

Distinta de Profile: Profile define permissões dentro do SIP;
FunctionalRole define a função exercida na organização.
"""

import enum
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FunctionalRole(enum.StrEnum):
    """Funções dentro da estrutura institucional.

    Códigos técnicos para uso interno. Rótulos legíveis por humanos são
    fornecidos em FUNCTIONAL_ROLE_LABELS.
    """

    DIRECTOR = "DIRECTOR"
    DEPARTAMENTO_CHEFE = "DEPARTAMENTO_CHEFE"
    SECCAO_CHEFE = "SECCAO_CHEFE"
    INSTRUTOR = "INSTRUTOR"
    EDITOR = "EDITOR"
    AGENTE_PIQUETE = "AGENTE_PIQUETE"
    SECRETARIO = "SECRETARIO"
    AGENTE_PGR = "AGENTE_PGR"
    OTHER = "OTHER"


FUNCTIONAL_ROLE_LABELS: dict[FunctionalRole, str] = {
    FunctionalRole.DIRECTOR: "Director",
    FunctionalRole.DEPARTAMENTO_CHEFE: "Chefe de Departamento",
    FunctionalRole.SECCAO_CHEFE: "Chefe de Secção",
    FunctionalRole.INSTRUTOR: "Instrutor",
    FunctionalRole.EDITOR: "Editor",
    FunctionalRole.AGENTE_PIQUETE: "Agente de Piquete",
    FunctionalRole.SECRETARIO: "Secretário",
    FunctionalRole.AGENTE_PGR: "Agente PGR",
    FunctionalRole.OTHER: "Outra",
}


def humanize_functional_role(code: str | FunctionalRole) -> str:
    """Rótulo legível por humanos para uma função."""
    return FUNCTIONAL_ROLE_LABELS.get(FunctionalRole(code), str(code))


class FunctionalRoleAssignment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Associação de uma função a um utilizador numa unidade.

    Liga um utilizador a uma função numa unidade organizacional específica,
    com um período de validade. Um utilizador pode exercer funções diferentes
    em unidades diferentes, e a função pode diferir do perfil técnico.
    """

    __tablename__ = "functional_role_assignments"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organizational_unit_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("organizational_units.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    functional_role: Mapped[FunctionalRole] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )
    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    def __repr__(self) -> str:
        return f"<FunctionalRoleAssignment user={self.user_id} role={self.functional_role}>"
