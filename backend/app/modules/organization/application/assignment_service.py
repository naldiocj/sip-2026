"""AssignmentService — gestão central de atribuições de utilizadores.

Regras:
- Uma atribuição PRIMARY activa por utilizador.
- Períodos válidos (end >= start).
- Atribuição a unidade inactiva rejeitada.
- end_assignment termina sem destruir histórico (lotações preservadas).
"""

import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.organization.domain.exceptions import (
    AssignmentNotFoundError,
    InactiveUnitAssignmentError,
    InvalidAssignmentPeriodError,
    MultiplePrimaryAssignmentError,
    UnitNotFoundError,
)
from app.modules.organization.domain.unit import OrganizationalUnit
from app.modules.organization.domain.user_assignment import (
    AssignmentStatus,
    AssignmentType,
    UserAssignment,
)


class AssignmentService:
    """Serviço central para atribuições de utilizadores."""

    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def _validate_period(start_date: date | None, end_date: date | None) -> None:
        if start_date is not None and end_date is not None and end_date < start_date:
            raise InvalidAssignmentPeriodError("end_date cannot be before start_date.")

    def create(
        self,
        *,
        user_id: uuid.UUID,
        organizational_unit_id: uuid.UUID,
        assignment_type: AssignmentType | str = AssignmentType.PRIMARY,
        is_primary: bool = False,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> UserAssignment:
        """Cria uma atribuição de utilizador com validação de integridade."""
        unit = self.db.get(OrganizationalUnit, organizational_unit_id)
        if unit is None:
            raise UnitNotFoundError(f"Organizational unit {organizational_unit_id} not found.")
        if not unit.is_active:
            raise InactiveUnitAssignmentError(
                f"Unit '{unit.name}' is inactive; cannot assign users."
            )

        self._validate_period(start_date, end_date)

        if is_primary or assignment_type == AssignmentType.PRIMARY:
            existing_primary = self.get_primary(user_id)
            if existing_primary is not None:
                raise MultiplePrimaryAssignmentError(
                    "User already has an active primary assignment. End it before creating another."
                )

        assignment = UserAssignment(
            user_id=user_id,
            organizational_unit_id=organizational_unit_id,
            assignment_type=assignment_type,
            is_primary=is_primary or assignment_type == AssignmentType.PRIMARY,
            start_date=start_date,
            end_date=end_date,
            status=AssignmentStatus.ACTIVE,
        )
        self.db.add(assignment)
        self.db.flush()
        return assignment

    def get(self, assignment_id: uuid.UUID) -> UserAssignment | None:
        """Obtém uma atribuição pelo ID."""
        return self.db.get(UserAssignment, assignment_id)

    def list_for_user(
        self, user_id: uuid.UUID, *, include_inactive: bool = False
    ) -> list[UserAssignment]:
        """Lista atribuições de um utilizador (activas por omissão)."""
        query = select(UserAssignment).where(UserAssignment.user_id == user_id)
        if not include_inactive:
            query = query.where(UserAssignment.status == AssignmentStatus.ACTIVE)
        return list(self.db.scalars(query.order_by(UserAssignment.start_date)))

    def get_primary(self, user_id: uuid.UUID) -> UserAssignment | None:
        """Obtém a atribuição principal activa de um utilizador."""
        return self.db.scalar(
            select(UserAssignment).where(
                UserAssignment.user_id == user_id,
                UserAssignment.is_primary.is_(True),
                UserAssignment.status == AssignmentStatus.ACTIVE,
            )
        )

    def list_for_unit(self, unit_id: uuid.UUID) -> list[UserAssignment]:
        """Lista atribuições activas de uma unidade."""
        return list(
            self.db.scalars(
                select(UserAssignment).where(
                    UserAssignment.organizational_unit_id == unit_id,
                    UserAssignment.status == AssignmentStatus.ACTIVE,
                )
            )
        )

    def end(self, assignment_id: uuid.UUID) -> UserAssignment:
        """Termina uma atribuição (suave — o histórico é preservado)."""
        assignment = self.db.get(UserAssignment, assignment_id)
        if assignment is None:
            raise AssignmentNotFoundError(f"Assignment {assignment_id} not found.")
        assignment.status = AssignmentStatus.INACTIVE
        self.db.flush()
        return assignment

    def update(
        self,
        assignment_id: uuid.UUID,
        *,
        assignment_type: AssignmentType | str | None = None,
        is_primary: bool | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> UserAssignment:
        """Actualiza campos da atribuição com validação."""
        assignment = self.db.get(UserAssignment, assignment_id)
        if assignment is None:
            raise AssignmentNotFoundError(f"Assignment {assignment_id} not found.")

        new_start = start_date if start_date is not None else assignment.start_date
        new_end = end_date if end_date is not None else assignment.end_date
        self._validate_period(new_start, new_end)

        new_is_primary = is_primary if is_primary is not None else assignment.is_primary
        if new_is_primary:
            existing_primary = self.get_primary(assignment.user_id)
            if existing_primary is not None and existing_primary.id != assignment_id:
                raise MultiplePrimaryAssignmentError(
                    "User already has an active primary assignment."
                )

        if assignment_type is not None:
            assignment.assignment_type = AssignmentType(assignment_type)
        if is_primary is not None:
            assignment.is_primary = is_primary
        if start_date is not None:
            assignment.start_date = start_date
        if end_date is not None:
            assignment.end_date = end_date
        self.db.flush()
        return assignment
