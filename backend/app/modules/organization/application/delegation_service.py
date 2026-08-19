"""DelegationService — gestão de delegações de responsabilidade."""

import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.organization.domain.delegation import (
    Delegation,
    DelegationStatus,
)
from app.modules.organization.domain.exceptions import (
    DelegationNotFoundError,
    InvalidDelegationError,
    OverlappingDelegationError,
    UnitNotFoundError,
)
from app.modules.organization.domain.responsibility_scope import ResponsibilityScope
from app.modules.organization.domain.unit import OrganizationalUnit


class DelegationService:
    """Serviço central para delegações."""

    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def _validate_period(start_date: date | None, end_date: date | None) -> None:
        if start_date is not None and end_date is not None and end_date < start_date:
            raise InvalidDelegationError("end_date cannot be before start_date.")

    def _check_overlap(
        self,
        delegator_user_id: uuid.UUID,
        scope: ResponsibilityScope,
        organizational_unit_id: uuid.UUID | None,
        start_date: date | None,
        end_date: date | None,
        exclude_id: uuid.UUID | None = None,
    ) -> None:
        """Rejeita delegações activas sobrepostas para o mesmo delegante+âmbito."""
        query = select(Delegation).where(
            Delegation.delegator_user_id == delegator_user_id,
            Delegation.scope == scope,
            Delegation.status == DelegationStatus.ACTIVE,
        )
        if exclude_id is not None:
            query = query.where(Delegation.id != exclude_id)
        existing = list(self.db.scalars(query))

        for other in existing:
            other_start = other.start_date
            other_end = other.end_date
            if start_date is not None and other_end is not None and start_date > other_end:
                continue
            if end_date is not None and other_start is not None and end_date < other_start:
                continue
            if (
                organizational_unit_id is not None
                and other.organizational_unit_id is not None
                and organizational_unit_id != other.organizational_unit_id
            ):
                continue
            raise OverlappingDelegationError("An overlapping active delegation already exists.")

    def create(
        self,
        *,
        delegator_user_id: uuid.UUID,
        delegate_user_id: uuid.UUID,
        scope: ResponsibilityScope | str,
        organizational_unit_id: uuid.UUID | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        reason: str | None = None,
    ) -> Delegation:
        """Cria uma delegação com validação."""
        scope_enum = ResponsibilityScope(scope)
        if delegator_user_id == delegate_user_id:
            raise InvalidDelegationError("A user cannot delegate to themselves.")

        self._validate_period(start_date, end_date)

        if organizational_unit_id is not None:
            unit = self.db.get(OrganizationalUnit, organizational_unit_id)
            if unit is None:
                raise UnitNotFoundError(f"Organizational unit {organizational_unit_id} not found.")

        self._check_overlap(
            delegator_user_id,
            scope_enum,
            organizational_unit_id,
            start_date,
            end_date,
        )

        delegation = Delegation(
            delegator_user_id=delegator_user_id,
            delegate_user_id=delegate_user_id,
            scope=scope_enum,
            organizational_unit_id=organizational_unit_id,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            status=DelegationStatus.ACTIVE,
            is_active=True,
        )
        self.db.add(delegation)
        self.db.flush()
        return delegation

    def get(self, delegation_id: uuid.UUID) -> Delegation | None:
        """Obtém uma delegação pelo ID."""
        return self.db.get(Delegation, delegation_id)

    def list_active(self) -> list[Delegation]:
        """Lista todas as delegações activas."""
        return list(
            self.db.scalars(
                select(Delegation)
                .where(Delegation.status == DelegationStatus.ACTIVE)
                .order_by(Delegation.created_at)
            )
        )

    def list_for_user(self, user_id: uuid.UUID, *, as_delegator: bool = True) -> list[Delegation]:
        """Lista delegações em que o utilizador é delegante ou delegado."""
        column = Delegation.delegator_user_id if as_delegator else Delegation.delegate_user_id
        return list(
            self.db.scalars(
                select(Delegation).where(column == user_id).order_by(Delegation.created_at)
            )
        )

    def revoke(self, delegation_id: uuid.UUID) -> Delegation:
        """Revoga uma delegação (suave — o histórico é preservado)."""
        delegation = self.db.get(Delegation, delegation_id)
        if delegation is None:
            raise DelegationNotFoundError(f"Delegation {delegation_id} not found.")
        delegation.status = DelegationStatus.REVOKED
        delegation.is_active = False
        self.db.flush()
        return delegation
