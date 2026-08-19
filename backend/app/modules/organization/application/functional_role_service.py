"""FunctionalRoleService — gestão de funções exercidas na estrutura.

Distinto de Profile: Profile define permissões no SIP; a função
define o cargo exercido na organização. Um utilizador pode exercer
função diferente do seu perfil técnico.
"""

import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.organization.domain.exceptions import (
    FunctionalRoleAssignmentNotFoundError,
)
from app.modules.organization.domain.functional_role import (
    FunctionalRole,
    FunctionalRoleAssignment,
)
from app.modules.organization.domain.unit import OrganizationalUnit


class FunctionalRoleService:
    """Serviço central para funções funcionais de utilizadores."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def assign(
        self,
        *,
        user_id: uuid.UUID,
        organizational_unit_id: uuid.UUID,
        functional_role: FunctionalRole | str,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> FunctionalRoleAssignment:
        """Atribui uma função a um utilizador numa unidade."""
        unit = self.db.get(OrganizationalUnit, organizational_unit_id)
        if unit is None:
            from app.modules.organization.domain.exceptions import UnitNotFoundError

            raise UnitNotFoundError(f"Organizational unit {organizational_unit_id} not found.")

        assignment = FunctionalRoleAssignment(
            user_id=user_id,
            organizational_unit_id=organizational_unit_id,
            functional_role=FunctionalRole(functional_role),
            start_date=start_date,
            end_date=end_date,
            is_active=True,
        )
        self.db.add(assignment)
        self.db.flush()
        return assignment

    def get(self, assignment_id: uuid.UUID) -> FunctionalRoleAssignment | None:
        """Obtém uma atribuição de função pelo ID."""
        return self.db.get(FunctionalRoleAssignment, assignment_id)

    def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        include_inactive: bool = False,
    ) -> list[FunctionalRoleAssignment]:
        """Lista as funções de um utilizador (activas por omissão)."""
        query = select(FunctionalRoleAssignment).where(FunctionalRoleAssignment.user_id == user_id)
        if not include_inactive:
            query = query.where(FunctionalRoleAssignment.is_active.is_(True))
        return list(self.db.scalars(query.order_by(FunctionalRoleAssignment.start_date)))

    def end(self, assignment_id: uuid.UUID) -> FunctionalRoleAssignment:
        """Termina uma função (suave — o histórico é preservado)."""
        assignment = self.db.get(FunctionalRoleAssignment, assignment_id)
        if assignment is None:
            raise FunctionalRoleAssignmentNotFoundError(
                f"Functional role assignment {assignment_id} not found."
            )
        assignment.is_active = False
        self.db.flush()
        return assignment
