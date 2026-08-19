"""Serviço de contexto de acesso — resolve o contexto organizacional do utilizador.

Centraliza a lógica para determinar que dados organizacionais um utilizador
pode aceder com base nas suas atribuições e âmbitos de responsabilidade.
"""

import uuid
from dataclasses import dataclass, field

from sqlalchemy.orm import Session

from app.modules.auth.domain.user import User
from app.modules.organization.application.organization_service import (
    OrganizationContext,
    OrganizationService,
)
from app.modules.organization.domain.responsibility_scope import (
    RESPONSIBILITY_SCOPE_LABELS,
    ResponsibilityScope,
)


@dataclass
class AccessContext:
    """Contexto de acesso completo de um utilizador.

    Combina identidade do utilizador, colocação organizacional e
    âmbito de responsabilidade para decisões de autorização.
    """

    user_id: uuid.UUID
    username: str
    organization: OrganizationContext | None = None
    responsibility_scopes: list[str] = field(default_factory=list)
    functional_roles: list[str] = field(default_factory=list)
    delegator_scopes: list[str] = field(default_factory=list)
    delegate_scopes: list[str] = field(default_factory=list)
    substitutions: list[uuid.UUID] = field(default_factory=list)

    @property
    def primary_unit_id(self) -> uuid.UUID | None:
        """ID da unidade organizacional principal do utilizador."""
        if self.organization and self.organization.primary_unit:
            return self.organization.primary_unit.id
        return None

    @property
    def organization_id(self) -> uuid.UUID | None:
        """ID da organização do utilizador."""
        if self.organization and self.organization.organization:
            return self.organization.organization.id
        return None

    @property
    def unit_ids(self) -> list[uuid.UUID]:
        """IDs de todas as unidades a que o utilizador pertence."""
        if self.organization:
            return [u.id for u in self.organization.units]
        return []

    @property
    def effective_scopes(self) -> list[str]:
        """Âmbitos em que o utilizador pode actuar (próprios + delegados)."""
        scopes = set(self.responsibility_scopes)
        scopes.update(self.delegate_scopes)
        return sorted(scopes)

    @property
    def humanized_scopes(self) -> list[str]:
        """Rótulos legíveis por humanos para os âmbitos efectivos."""
        return [
            RESPONSIBILITY_SCOPE_LABELS.get(ResponsibilityScope(s), s)
            for s in self.effective_scopes
        ]


class AccessContextService:
    """Resolve o contexto de acesso dos utilizadores."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.org_service = OrganizationService(db)

    def get_context(self, user: User) -> AccessContext:
        """Obtém o contexto de acesso completo de um utilizador."""
        return self.get_context_for_user_id(user.id, username=user.username)

    def get_context_for_user_id(self, user_id: uuid.UUID, username: str = "") -> AccessContext:
        """Obtém o contexto de acesso pelo ID do utilizador (sem carregar a entidade User)."""
        org_context = self.org_service.get_user_context(user_id)
        scopes = self.org_service.get_user_responsibility_scopes(user_id)
        roles = self.org_service.get_user_functional_roles(user_id)
        delegator_scopes, delegate_scopes, substitutions = (
            self.org_service.get_user_delegation_data(user_id)
        )

        return AccessContext(
            user_id=user_id,
            username=username,
            organization=org_context,
            responsibility_scopes=scopes,
            functional_roles=roles,
            delegator_scopes=delegator_scopes,
            delegate_scopes=delegate_scopes,
            substitutions=substitutions,
        )


def build_access_context(db: Session, user: User) -> AccessContext:
    """Constrói um contexto de acesso completo para um utilizador (wrapper de conveniência)."""
    return AccessContextService(db).get_context(user)
