"""SubstitutionService — gestão de substituições temporárias de função."""

import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.organization.domain.exceptions import (
    InvalidSubstitutionError,
    SubstitutionNotFoundError,
    UnitNotFoundError,
)
from app.modules.organization.domain.functional_role import FunctionalRole
from app.modules.organization.domain.substitution import (
    Substitution,
    SubstitutionStatus,
)
from app.modules.organization.domain.unit import OrganizationalUnit


class SubstitutionService:
    """Serviço central para substituições."""

    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def _validate_period(start_date: date | None, end_date: date | None) -> None:
        if start_date is not None and end_date is not None and end_date < start_date:
            raise InvalidSubstitutionError("end_date cannot be before start_date.")

    def create(
        self,
        *,
        substituted_user_id: uuid.UUID,
        substitute_user_id: uuid.UUID,
        organizational_unit_id: uuid.UUID | None = None,
        functional_role: FunctionalRole | str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        reason: str | None = None,
    ) -> Substitution:
        """Cria uma substituição com validação."""
        if substituted_user_id == substitute_user_id:
            raise InvalidSubstitutionError("A user cannot substitute themselves.")
        self._validate_period(start_date, end_date)

        if organizational_unit_id is not None:
            unit = self.db.get(OrganizationalUnit, organizational_unit_id)
            if unit is None:
                raise UnitNotFoundError(f"Organizational unit {organizational_unit_id} not found.")

        substitution = Substitution(
            substituted_user_id=substituted_user_id,
            substitute_user_id=substitute_user_id,
            organizational_unit_id=organizational_unit_id,
            functional_role=functional_role,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            status=SubstitutionStatus.ACTIVE,
            is_active=True,
        )
        self.db.add(substitution)
        self.db.flush()
        return substitution

    def get(self, substitution_id: uuid.UUID) -> Substitution | None:
        """Obtém uma substituição pelo ID."""
        return self.db.get(Substitution, substitution_id)

    def list_for_user(
        self, user_id: uuid.UUID, *, as_substitute: bool = False
    ) -> list[Substitution]:
        """Lista substituições de um utilizador."""
        column = (
            Substitution.substitute_user_id if as_substitute else Substitution.substituted_user_id
        )
        return list(
            self.db.scalars(
                select(Substitution).where(column == user_id).order_by(Substitution.created_at)
            )
        )

    def end(self, substitution_id: uuid.UUID) -> Substitution:
        """Termina uma substituição (suave — o histórico é preservado)."""
        substitution = self.db.get(Substitution, substitution_id)
        if substitution is None:
            raise SubstitutionNotFoundError(f"Substitution {substitution_id} not found.")
        substitution.status = SubstitutionStatus.ENDED
        substitution.is_active = False
        self.db.flush()
        return substitution
