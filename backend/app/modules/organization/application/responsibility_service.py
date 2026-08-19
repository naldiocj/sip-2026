"""ResponsibilityService — gestão de responsabilidades funcionais."""

import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.organization.domain.exceptions import (
    InvalidResponsibilityError,
    ResponsibilityNotFoundError,
    UnitNotFoundError,
)
from app.modules.organization.domain.responsibility import (
    Responsibility,
    ResponsibilityStatus,
)
from app.modules.organization.domain.responsibility_scope import ResponsibilityScope
from app.modules.organization.domain.unit import OrganizationalUnit


class ResponsibilityService:
    """Serviço central para responsabilidades."""

    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def _validate_period(start_date: date | None, end_date: date | None) -> None:
        if start_date is not None and end_date is not None and end_date < start_date:
            raise InvalidResponsibilityError("end_date cannot be before start_date.")

    def create(
        self,
        *,
        user_id: uuid.UUID,
        scope: ResponsibilityScope | str,
        organizational_unit_id: uuid.UUID | None = None,
        resource_type: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> Responsibility:
        """Cria uma responsabilidade com validação."""
        scope_enum = ResponsibilityScope(scope)
        self._validate_period(start_date, end_date)

        if organizational_unit_id is not None:
            unit = self.db.get(OrganizationalUnit, organizational_unit_id)
            if unit is None:
                raise UnitNotFoundError(f"Organizational unit {organizational_unit_id} not found.")
        elif scope_enum in (
            ResponsibilityScope.DIRECTION,
            ResponsibilityScope.DEPARTMENT,
            ResponsibilityScope.SECTION,
            ResponsibilityScope.UNIT,
            ResponsibilityScope.PIQUETE,
        ):
            raise InvalidResponsibilityError(
                f"Scope {scope_enum.value} requires an organizational unit."
            )

        responsibility = Responsibility(
            user_id=user_id,
            scope=scope_enum,
            organizational_unit_id=organizational_unit_id,
            resource_type=resource_type,
            start_date=start_date,
            end_date=end_date,
            status=ResponsibilityStatus.ACTIVE,
            is_active=True,
        )
        self.db.add(responsibility)
        self.db.flush()
        return responsibility

    def get(self, responsibility_id: uuid.UUID) -> Responsibility | None:
        """Obtém uma responsabilidade pelo ID."""
        return self.db.get(Responsibility, responsibility_id)

    def list_for_user(
        self, user_id: uuid.UUID, *, include_inactive: bool = False
    ) -> list[Responsibility]:
        """Lista responsabilidades de um utilizador."""
        query = select(Responsibility).where(Responsibility.user_id == user_id)
        if not include_inactive:
            query = query.where(Responsibility.status == ResponsibilityStatus.ACTIVE)
        return list(self.db.scalars(query.order_by(Responsibility.start_date)))

    def end(self, responsibility_id: uuid.UUID) -> Responsibility:
        """Termina uma responsabilidade (suave — o histórico é preservado)."""
        responsibility = self.db.get(Responsibility, responsibility_id)
        if responsibility is None:
            raise ResponsibilityNotFoundError(f"Responsibility {responsibility_id} not found.")
        responsibility.status = ResponsibilityStatus.ENDED
        responsibility.is_active = False
        self.db.flush()
        return responsibility
