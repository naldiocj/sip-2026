"""Testes de integridade complementares (TASK-026).

Cobrem cenários em falta: atribuição a unidade inactiva,
responsabilidade com scope que exige unidade, e invalid_parent
por caminho inexistente.
"""

import uuid

import pytest
from app.modules.organization.application.assignment_service import AssignmentService
from app.modules.organization.application.responsibility_service import (
    ResponsibilityService,
)
from app.modules.organization.domain.exceptions import (
    InactiveUnitAssignmentError,
    InvalidResponsibilityError,
    UnitNotFoundError,
)
from app.modules.organization.domain.responsibility_scope import ResponsibilityScope
from app.modules.organization.domain.unit import OrganizationalUnit, UnitStatus
from sqlalchemy import select
from sqlalchemy.orm import Session


def test_assignment_to_inactive_unit_rejected(db_session: Session, seeded_users) -> None:
    """Atribuir utilizador a unidade inactiva é rejeitado."""
    from app.modules.organization.domain.organization import Organization

    org = db_session.scalar(select(Organization).limit(1))
    assert org is not None

    unit = OrganizationalUnit(
        organization_id=org.id,
        type_id="SECTION",
        name="Secção Inactiva",
        code=f"SEC-INAC-{uuid.uuid4().hex[:6].upper()}",
        status=UnitStatus.INACTIVE,
        is_active=False,
    )
    db_session.add(unit)
    db_session.flush()

    service = AssignmentService(db_session)
    with pytest.raises(InactiveUnitAssignmentError):
        service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )


def test_responsibility_direction_scope_requires_unit(db_session: Session, seeded_users) -> None:
    """Scope DIRECTION sem unidade é rejeitado."""
    service = ResponsibilityService(db_session)
    with pytest.raises(InvalidResponsibilityError):
        service.create(
            user_id=seeded_users[0].id,
            scope=ResponsibilityScope.DIRECTION,
        )


def test_responsibility_process_scope_without_unit_allowed(
    db_session: Session, seeded_users
) -> None:
    """Scope PROCESS_MANAGEMENT não exige unidade."""
    service = ResponsibilityService(db_session)
    responsibility = service.create(
        user_id=seeded_users[0].id,
        scope=ResponsibilityScope.PROCESS_MANAGEMENT,
    )
    assert responsibility.organizational_unit_id is None
    assert responsibility.is_active


def test_responsibility_unknown_unit_rejected(db_session: Session, seeded_users) -> None:
    """Responsabilidade com unidade inexistente é rejeitada."""
    service = ResponsibilityService(db_session)
    with pytest.raises(UnitNotFoundError):
        service.create(
            user_id=seeded_users[0].id,
            scope=ResponsibilityScope.SECTION,
            organizational_unit_id=uuid.uuid4(),
        )


def test_delegation_overlap_different_scope_allowed(db_session: Session, seeded_users) -> None:
    """Delegações activas com âmbitos diferentes não colidem."""
    from app.modules.organization.application.delegation_service import DelegationService

    service = DelegationService(db_session)
    first = service.create(
        delegator_user_id=seeded_users[0].id,
        delegate_user_id=seeded_users[1].id,
        scope=ResponsibilityScope.PROCESS_MANAGEMENT,
        start_date=None,
        end_date=None,
    )
    second = service.create(
        delegator_user_id=seeded_users[0].id,
        delegate_user_id=seeded_users[1].id,
        scope=ResponsibilityScope.DOCUMENT_MANAGEMENT,
        start_date=None,
        end_date=None,
    )
    assert first.id != second.id
    assert second.status.value == "ACTIVE"
