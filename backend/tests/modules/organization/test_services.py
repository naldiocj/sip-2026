"""Testes dos serviços de atribuições, responsabilidades, delegações e
substituições do módulo organization."""

from datetime import date

import pytest
from app.modules.organization.application.assignment_service import (
    AssignmentService,
)
from app.modules.organization.application.delegation_service import (
    DelegationService,
)
from app.modules.organization.application.responsibility_service import (
    ResponsibilityService,
)
from app.modules.organization.application.substitution_service import (
    SubstitutionService,
)
from app.modules.organization.domain.exceptions import (
    InvalidDelegationError,
    InvalidResponsibilityError,
    InvalidSubstitutionError,
    MultiplePrimaryAssignmentError,
    OverlappingDelegationError,
)
from app.modules.organization.domain.responsibility_scope import ResponsibilityScope
from sqlalchemy.orm import Session
from tests.conftest import requires_database


@requires_database
class TestAssignmentService:
    def test_create_primary_assignment(
        self,
        db_session: Session,
        seeded_users,
        seeded_unit,
        assignment_service: AssignmentService,
    ):
        assignment = assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )
        assert assignment.is_primary is True
        assert assignment.status == "ACTIVE"
        assert assignment.user_id == seeded_users[0].id

    def test_multiple_primary_rejected(
        self,
        db_session: Session,
        seeded_users,
        seeded_unit,
        assignment_service: AssignmentService,
    ):
        assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )
        with pytest.raises(MultiplePrimaryAssignmentError):
            assignment_service.create(
                user_id=seeded_users[0].id,
                organizational_unit_id=seeded_unit.id,
                assignment_type="PRIMARY",
                is_primary=True,
            )

    def test_invalid_period_rejected(
        self,
        db_session: Session,
        seeded_users,
        seeded_unit,
        assignment_service: AssignmentService,
    ):
        with pytest.raises(Exception) as excinfo:
            assignment_service.create(
                user_id=seeded_users[0].id,
                organizational_unit_id=seeded_unit.id,
                start_date=date(2024, 6, 1),
                end_date=date(2024, 1, 1),
            )
        assert "end_date" in str(excinfo.value)

    def test_end_assignment_preserves_history(
        self,
        db_session: Session,
        seeded_users,
        seeded_unit,
        assignment_service: AssignmentService,
    ):
        assignment = assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )
        ended = assignment_service.end(assignment.id)
        assert ended.status == "INACTIVE"
        assert assignment_service.get(assignment.id) is not None

    def test_get_primary(self, db_session: Session, seeded_users, seeded_unit, assignment_service):
        assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )
        primary = assignment_service.get_primary(seeded_users[0].id)
        assert primary is not None
        assert primary.is_primary is True


@requires_database
class TestResponsibilityService:
    def test_create_unit_scoped_responsibility(
        self, db_session: Session, seeded_users, seeded_unit
    ):
        service = ResponsibilityService(db_session)
        resp = service.create(
            user_id=seeded_users[0].id,
            scope=ResponsibilityScope.SECTION,
            organizational_unit_id=seeded_unit.id,
        )
        assert resp.scope == ResponsibilityScope.SECTION
        assert resp.is_active is True

    def test_scope_requires_unit(self, db_session: Session, seeded_users):
        service = ResponsibilityService(db_session)
        with pytest.raises(InvalidResponsibilityError):
            service.create(
                user_id=seeded_users[0].id,
                scope=ResponsibilityScope.SECTION,
                organizational_unit_id=None,
            )

    def test_end_responsibility_preserves_history(
        self, db_session: Session, seeded_users, seeded_unit
    ):
        service = ResponsibilityService(db_session)
        resp = service.create(
            user_id=seeded_users[0].id,
            scope=ResponsibilityScope.DOCUMENT_MANAGEMENT,
            organizational_unit_id=None,
        )
        ended = service.end(resp.id)
        assert ended.status == "ENDED"
        assert service.get(resp.id) is not None

    def test_list_for_user_active_only(self, db_session: Session, seeded_users, seeded_unit):
        service = ResponsibilityService(db_session)
        service.create(
            user_id=seeded_users[0].id,
            scope=ResponsibilityScope.DOCUMENT_MANAGEMENT,
        )
        active = service.list_for_user(seeded_users[0].id)
        assert len(active) >= 1
        all_rows = service.list_for_user(seeded_users[0].id, include_inactive=True)
        assert len(all_rows) >= len(active)


@requires_database
class TestDelegationService:
    def test_create_delegation(self, db_session: Session, seeded_users, seeded_unit):
        service = DelegationService(db_session)
        delegation = service.create(
            delegator_user_id=seeded_users[0].id,
            delegate_user_id=seeded_users[1].id,
            scope=ResponsibilityScope.SECTION,
            organizational_unit_id=seeded_unit.id,
        )
        assert delegation.status == "ACTIVE"
        assert delegation.delegator_user_id == seeded_users[0].id

    def test_self_delegation_rejected(self, db_session: Session, seeded_users):
        service = DelegationService(db_session)
        with pytest.raises(InvalidDelegationError):
            service.create(
                delegator_user_id=seeded_users[0].id,
                delegate_user_id=seeded_users[0].id,
                scope=ResponsibilityScope.SECTION,
            )

    def test_overlapping_delegation_rejected(self, db_session: Session, seeded_users, seeded_unit):
        service = DelegationService(db_session)
        service.create(
            delegator_user_id=seeded_users[0].id,
            delegate_user_id=seeded_users[1].id,
            scope=ResponsibilityScope.SECTION,
            organizational_unit_id=seeded_unit.id,
        )
        with pytest.raises(OverlappingDelegationError):
            service.create(
                delegator_user_id=seeded_users[0].id,
                delegate_user_id=seeded_users[1].id,
                scope=ResponsibilityScope.SECTION,
                organizational_unit_id=seeded_unit.id,
            )

    def test_revoke_delegation(self, db_session: Session, seeded_users, seeded_unit):
        service = DelegationService(db_session)
        delegation = service.create(
            delegator_user_id=seeded_users[0].id,
            delegate_user_id=seeded_users[1].id,
            scope=ResponsibilityScope.SECTION,
            organizational_unit_id=seeded_unit.id,
        )
        revoked = service.revoke(delegation.id)
        assert revoked.status == "REVOKED"


@requires_database
class TestSubstitutionService:
    def test_create_substitution(self, db_session: Session, seeded_users, seeded_unit):
        service = SubstitutionService(db_session)
        substitution = service.create(
            substituted_user_id=seeded_users[0].id,
            substitute_user_id=seeded_users[1].id,
            organizational_unit_id=seeded_unit.id,
        )
        assert substitution.status == "ACTIVE"
        assert substitution.substitute_user_id == seeded_users[1].id

    def test_self_substitution_rejected(self, db_session: Session, seeded_users):
        service = SubstitutionService(db_session)
        with pytest.raises(InvalidSubstitutionError):
            service.create(
                substituted_user_id=seeded_users[0].id,
                substitute_user_id=seeded_users[0].id,
            )

    def test_invalid_period_rejected(self, db_session: Session, seeded_users):
        service = SubstitutionService(db_session)
        with pytest.raises(InvalidSubstitutionError):
            service.create(
                substituted_user_id=seeded_users[0].id,
                substitute_user_id=seeded_users[1].id,
                start_date=date(2024, 6, 1),
                end_date=date(2024, 1, 1),
            )

    def test_end_substitution(self, db_session: Session, seeded_users):
        service = SubstitutionService(db_session)
        substitution = service.create(
            substituted_user_id=seeded_users[0].id,
            substitute_user_id=seeded_users[1].id,
        )
        ended = service.end(substitution.id)
        assert ended.status == "ENDED"
