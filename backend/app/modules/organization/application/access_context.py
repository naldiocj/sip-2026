"""Serviço de contexto de acesso — resolve o contexto organizacional do utilizador.

Centraliza a lógica para determinar que dados organizacionais um utilizador
pode aceder com base nas suas atribuições e âmbitos de responsabilidade.

Não contém lógica de negócio — é um objecto de consulta.
"""

import uuid
from dataclasses import dataclass, field
from typing import Any

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

    Combina identidade do utilizador, pessoa associada, perfis,
    permissões, colocação organizacional, responsabilidades e
    delegações para decisões de autorização.

    É um objecto de consulta — não contém lógica de negócio.
    """

    user_id: uuid.UUID
    username: str
    organization: OrganizationContext | None = None
    person: dict[str, object] | None = None
    profiles: list[str] = field(default_factory=list)
    permissions: list[str] = field(default_factory=list)
    responsibility_scopes: list[str] = field(default_factory=list)
    functional_roles: list[str] = field(default_factory=list)
    delegator_scopes: list[str] = field(default_factory=list)
    delegate_scopes: list[str] = field(default_factory=list)
    substitutions: list[uuid.UUID] = field(default_factory=list)
    assignments: list[Any] = field(default_factory=list)
    responsibilities: list[Any] = field(default_factory=list)
    delegations: list[Any] = field(default_factory=list)

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


def _person_dict(person: Any) -> dict[str, object] | None:
    """Serializa dados públicos de uma pessoa sem expor informação sensível."""
    if person is None:
        return None
    return {
        "id": str(person.id),
        "person_number": person.person_number,
        "full_name": person.full_name,
        "preferred_name": person.preferred_name,
        "email": person.email,
        "phone": person.phone,
        "status": str(person.status),
    }


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
        from app.modules.auth.domain.user import User as UserModel

        org_context = self.org_service.get_user_context(user_id)
        scopes = self.org_service.get_user_responsibility_scopes(user_id)
        roles = self.org_service.get_user_functional_roles(user_id)
        delegator_scopes, delegate_scopes, substitutions = (
            self.org_service.get_user_delegation_data(user_id)
        )

        user = self.db.get(UserModel, user_id)
        person = _person_dict(user.person) if user is not None else None

        profiles = []
        permissions: list[str] = []
        assignments = []
        responsibilities = []
        delegations = []
        if user is not None:
            profiles = [str(p.code) for p in user.profiles]
            permissions = sorted({p.code for profile in user.profiles for p in profile.permissions})
            from app.modules.organization.application.assignment_service import (
                AssignmentService,
            )
            from app.modules.organization.application.delegation_service import (
                DelegationService,
            )
            from app.modules.organization.application.responsibility_service import (
                ResponsibilityService,
            )

            assignments = AssignmentService(self.db).list_for_user(user_id, include_inactive=False)
            responsibilities = ResponsibilityService(self.db).list_for_user(user_id)
            delegations = DelegationService(self.db).list_for_user(user_id)

        return AccessContext(
            user_id=user_id,
            username=username,
            organization=org_context,
            person=person,
            profiles=profiles,
            permissions=permissions,
            responsibility_scopes=scopes,
            functional_roles=roles,
            delegator_scopes=delegator_scopes,
            delegate_scopes=delegate_scopes,
            substitutions=substitutions,
            assignments=assignments,
            responsibilities=responsibilities,
            delegations=delegations,
        )


def build_access_context(db: Session, user: User) -> AccessContext:
    """Constrói um contexto de acesso completo para um utilizador (wrapper de conveniência)."""
    return AccessContextService(db).get_context(user)
