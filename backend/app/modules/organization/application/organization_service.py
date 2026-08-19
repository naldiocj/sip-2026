"""Serviço de organização — operações centrais para a gestão organizacional.

Fornece CRUD, acesso à hierarquia, recuperação de contexto e resolução utilizador-unidade.
"""

import uuid
from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.organization.application.assignment_service import AssignmentService
from app.modules.organization.application.hierarchy_service import HierarchyService
from app.modules.organization.domain.exceptions import (
    DuplicateCodeError,
    OrganizationNotFoundError,
    UnitNotFoundError,
)
from app.modules.organization.domain.organization import (
    Organization,
    OrganizationType,
)
from app.modules.organization.domain.unit import OrganizationalUnit, UnitStatus
from app.modules.organization.domain.user_assignment import UserAssignment


@dataclass
class OrganizationContext:
    """Informação contextual de um utilizador dentro da organização."""

    organization: Organization | None = None
    primary_unit: OrganizationalUnit | None = None
    units: list[OrganizationalUnit] = field(default_factory=list)
    responsibility_scopes: list[str] = field(default_factory=list)


class OrganizationService:
    """Serviço central para operações de organização."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.hierarchy = HierarchyService(db)
        self.assignments = AssignmentService(db)

    def get_organization(self, org_id: uuid.UUID) -> Organization | None:
        """Obtém a organização pelo ID."""
        return self.db.get(Organization, org_id)

    def get_organization_by_code(self, code: str) -> Organization | None:
        """Obtém a organização pelo código."""
        return self.db.scalar(select(Organization).where(Organization.code == code))

    def list_organizations(self) -> list[Organization]:
        """Lista todas as organizações activas."""
        return list(
            self.db.scalars(
                select(Organization).where(Organization.is_active == True)  # noqa: E712
            )
        )

    def create_organization(
        self,
        code: str,
        name: str,
        short_name: str | None = None,
        description: str | None = None,
        organization_type: OrganizationType | str = OrganizationType.INTERNAL,
    ) -> Organization:
        """Cria uma nova organização."""
        existing = self.get_organization_by_code(code)
        if existing is not None:
            raise DuplicateCodeError(f"Organization code '{code}' already exists.")

        org = Organization(
            code=code,
            name=name,
            short_name=short_name,
            description=description,
            organization_type=organization_type,
        )
        self.db.add(org)
        self.db.flush()
        return org

    def get_unit(self, unit_id: uuid.UUID) -> OrganizationalUnit | None:
        """Obtém a unidade organizacional pelo ID."""
        return self.db.get(OrganizationalUnit, unit_id)

    def get_unit_by_code(self, organization_id: uuid.UUID, code: str) -> OrganizationalUnit | None:
        """Obtém a unidade pelo código dentro de uma organização."""
        return self.db.scalar(
            select(OrganizationalUnit).where(
                OrganizationalUnit.organization_id == organization_id,
                OrganizationalUnit.code == code,
            )
        )

    def list_root_units(self, organization_id: uuid.UUID) -> list[OrganizationalUnit]:
        """Lista unidades de topo (sem pai) de uma organização."""
        return list(
            self.db.scalars(
                select(OrganizationalUnit).where(
                    OrganizationalUnit.organization_id == organization_id,
                    OrganizationalUnit.parent_id.is_(None),
                    OrganizationalUnit.is_active == True,  # noqa: E712
                )
            )
        )

    def list_all_units(self, organization_id: uuid.UUID) -> list[OrganizationalUnit]:
        """Lista todas as unidades de uma organização (lista plana)."""
        return list(
            self.db.scalars(
                select(OrganizationalUnit)
                .where(
                    OrganizationalUnit.organization_id == organization_id,
                    OrganizationalUnit.is_active == True,  # noqa: E712
                )
                .order_by(OrganizationalUnit.sort_order, OrganizationalUnit.name)
            )
        )

    def get_unit_tree(self, organization_id: uuid.UUID) -> list[dict[str, object]]:
        """Constrói a árvore organizacional completa de uma organização.

        Devolve uma estrutura de dicionários aninhada adequada para serialização JSON.
        """
        all_units = list(
            self.db.scalars(
                select(OrganizationalUnit)
                .where(
                    OrganizationalUnit.organization_id == organization_id,
                )
                .order_by(OrganizationalUnit.sort_order, OrganizationalUnit.name)
            )
        )

        unit_map: dict[uuid.UUID, dict[str, object]] = {}
        for unit in all_units:
            unit_map[unit.id] = {
                "id": unit.id,
                "organization_id": unit.organization_id,
                "parent_id": unit.parent_id,
                "type_id": unit.type_id,
                "code": unit.code,
                "name": unit.name,
                "short_name": unit.short_name,
                "status": str(unit.status),
                "is_active": unit.is_active,
                "sort_order": unit.sort_order,
                "children": [],
                "children_count": 0,
            }

        roots: list[dict[str, object]] = []
        for unit in all_units:
            node = unit_map[unit.id]
            if unit.parent_id and unit.parent_id in unit_map:
                parent = unit_map[unit.parent_id]
                children = parent["children"]
                assert isinstance(children, list)
                children.append(node)
                parent["children_count"] = len(children)
            else:
                roots.append(node)

        return roots

    def get_unit_assignments(self, unit_id: uuid.UUID) -> list[tuple[UserAssignment, str, str]]:
        """Obtém todas as atribuições activas de uma unidade.

        Devolve lista de (atribuição, username, nome_completo_utilizador).
        """
        from app.modules.auth.domain.user import User as UserModel

        results = list(
            self.db.scalars(
                select(UserAssignment).where(
                    UserAssignment.organizational_unit_id == unit_id,
                    UserAssignment.status == "ACTIVE",
                )
            )
        )

        enriched = []
        for assignment in results:
            user = self.db.get(UserModel, assignment.user_id)
            username = user.username if user else ""
            full_name = user.full_name if user else ""
            enriched.append((assignment, username, full_name))

        return enriched

    def list_units_by_type(
        self, organization_id: uuid.UUID, type_id: str
    ) -> list[OrganizationalUnit]:
        """Lista unidades de um tipo específico dentro de uma organização."""
        return list(
            self.db.scalars(
                select(OrganizationalUnit).where(
                    OrganizationalUnit.organization_id == organization_id,
                    OrganizationalUnit.type_id == type_id,
                    OrganizationalUnit.is_active == True,  # noqa: E712
                )
            )
        )

    def create_unit(
        self,
        organization_id: uuid.UUID,
        type_id: str,
        name: str,
        code: str | None = None,
        parent_id: uuid.UUID | None = None,
        short_name: str | None = None,
        description: str | None = None,
    ) -> OrganizationalUnit:
        """Cria uma nova unidade organizacional."""
        org = self.db.get(Organization, organization_id)
        if org is None:
            raise OrganizationNotFoundError(f"Organization {organization_id} not found.")

        if code is not None:
            existing = self.get_unit_by_code(organization_id, code)
            if existing is not None:
                raise DuplicateCodeError(f"Unit code '{code}' already exists in this organization.")

        # Validate parent
        self.hierarchy.validate_parent(uuid.uuid4(), parent_id, organization_id)

        unit = OrganizationalUnit(
            organization_id=organization_id,
            type_id=type_id,
            name=name,
            code=code,
            parent_id=parent_id,
            short_name=short_name,
            description=description,
        )
        self.db.add(unit)
        self.db.flush()
        return unit

    def move_unit(self, unit_id: uuid.UUID, new_parent_id: uuid.UUID | None) -> None:
        """Move uma unidade para um novo pai."""
        unit = self.db.get(OrganizationalUnit, unit_id)
        if unit is None:
            raise UnitNotFoundError(f"Unit {unit_id} not found.")

        self.hierarchy.validate_parent(unit_id, new_parent_id, unit.organization_id)

        unit.parent_id = new_parent_id
        self.db.flush()

    def deactivate_unit(self, unit_id: uuid.UUID) -> None:
        """Desactiva uma unidade (eliminação suave)."""
        unit = self.db.get(OrganizationalUnit, unit_id)
        if unit is None:
            raise UnitNotFoundError(f"Unit {unit_id} not found.")

        unit.is_active = False
        unit.status = UnitStatus.INACTIVE
        self.db.flush()

    def get_user_assignments(self, user_id: uuid.UUID) -> list[UserAssignment]:
        """Obtém todas as atribuições activas de um utilizador."""
        return self.assignments.list_for_user(user_id)

    def get_user_primary_assignment(self, user_id: uuid.UUID) -> UserAssignment | None:
        """Obtém a atribuição principal de um utilizador."""
        return self.assignments.get_primary(user_id)

    def get_user_responsibility_scopes(self, user_id: uuid.UUID) -> list[str]:
        """Obtém os valores de âmbitos de responsabilidade activos de um utilizador."""
        from app.modules.organization.domain.responsibility import (
            Responsibility,
            ResponsibilityStatus,
        )

        rows = self.db.scalars(
            select(Responsibility).where(
                Responsibility.user_id == user_id,
                Responsibility.status == ResponsibilityStatus.ACTIVE,
            )
        )
        return [str(r.scope) for r in rows]

    def get_user_functional_roles(self, user_id: uuid.UUID) -> list[str]:
        """Obtém os valores de funções activas de um utilizador."""
        from app.modules.organization.domain.functional_role import (
            FunctionalRoleAssignment,
        )

        rows = self.db.scalars(
            select(FunctionalRoleAssignment).where(
                FunctionalRoleAssignment.user_id == user_id,
                FunctionalRoleAssignment.is_active.is_(True),
            )
        )
        return [str(r.functional_role) for r in rows]

    def get_user_delegation_data(
        self, user_id: uuid.UUID
    ) -> tuple[list[str], list[str], list[uuid.UUID]]:
        """Obtém dados de delegação de um utilizador.

        Devolve (âmbitos_delegante, âmbitos_delegado, substituições).
        """
        from app.modules.organization.domain.delegation import (
            Delegation,
            DelegationStatus,
        )
        from app.modules.organization.domain.substitution import (
            Substitution,
            SubstitutionStatus,
        )

        delegator_scopes = [
            str(d.scope)
            for d in self.db.scalars(
                select(Delegation).where(
                    Delegation.delegator_user_id == user_id,
                    Delegation.status == DelegationStatus.ACTIVE,
                )
            )
        ]
        delegate_scopes = [
            str(d.scope)
            for d in self.db.scalars(
                select(Delegation).where(
                    Delegation.delegate_user_id == user_id,
                    Delegation.status == DelegationStatus.ACTIVE,
                )
            )
        ]
        substitutions = [
            s.substitute_user_id
            for s in self.db.scalars(
                select(Substitution).where(
                    Substitution.substituted_user_id == user_id,
                    Substitution.status == SubstitutionStatus.ACTIVE,
                )
            )
        ]

        return delegator_scopes, delegate_scopes, substitutions

    def get_user_context(self, user_id: uuid.UUID) -> OrganizationContext:
        """Obtém o contexto organizacional completo de um utilizador."""
        assignments = self.get_user_assignments(user_id)
        if not assignments:
            return OrganizationContext()

        primary = None
        units = []
        for assignment in assignments:
            unit = self.db.get(OrganizationalUnit, assignment.organizational_unit_id)
            if unit is not None and unit.is_active:
                units.append(unit)
                if assignment.is_primary:
                    primary = unit

        organization = None
        if primary is not None:
            organization = self.db.get(Organization, primary.organization_id)

        return OrganizationContext(
            organization=organization,
            primary_unit=primary,
            units=units,
        )
