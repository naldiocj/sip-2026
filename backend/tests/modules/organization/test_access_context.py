"""Testes do AccessContext e ScopeEngine."""

from app.modules.organization.application.access_context import (
    AccessContextService,
)
from app.modules.organization.application.assignment_service import (
    AssignmentService,
)
from app.modules.organization.application.delegation_service import (
    DelegationService,
)
from app.modules.organization.application.responsibility_service import (
    ResponsibilityService,
)
from app.modules.organization.application.scope_engine import ScopeEngine
from app.modules.organization.domain.responsibility_scope import ResponsibilityScope
from sqlalchemy.orm import Session
from tests.conftest import requires_database


@requires_database
class TestAccessContext:
    def test_context_with_primary_unit_and_scope(
        self, db_session: Session, seeded_users, seeded_unit, seeded_organization
    ):
        assignment_service = AssignmentService(db_session)
        assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )
        responsibility_service = ResponsibilityService(db_session)
        responsibility_service.create(
            user_id=seeded_users[0].id,
            scope=ResponsibilityScope.SECTION,
            organizational_unit_id=seeded_unit.id,
        )
        context = AccessContextService(db_session).get_context_for_user_id(
            seeded_users[0].id, username=seeded_users[0].username
        )
        assert context.primary_unit_id == seeded_unit.id
        assert context.organization_id == seeded_organization.id
        assert context.unit_ids == [seeded_unit.id]
        assert context.responsibility_scopes == ["SECTION"]

    def test_context_with_delegated_scope(self, db_session: Session, seeded_users):
        delegation_service = DelegationService(db_session)
        delegation_service.create(
            delegator_user_id=seeded_users[0].id,
            delegate_user_id=seeded_users[1].id,
            scope=ResponsibilityScope.DOCUMENT_MANAGEMENT,
        )
        context = AccessContextService(db_session).get_context_for_user_id(seeded_users[1].id)
        assert context.delegate_scopes == ["DOCUMENT_MANAGEMENT"]
        assert "DOCUMENT_MANAGEMENT" in context.effective_scopes

    def test_empty_context(self, db_session: Session):
        context = AccessContextService(db_session).get_context_for_user_id(
            __import__("uuid").uuid4()
        )
        assert context.organization is not None
        assert context.organization.organization is None
        assert context.primary_unit_id is None
        assert context.organization_id is None
        assert context.effective_scopes == []
        assert context.unit_ids == []


@requires_database
class TestScopeEngine:
    def test_can_access_direct_scope(self, db_session: Session, seeded_users):
        engine = ScopeEngine()
        context = AccessContextService(db_session).get_context_for_user_id(seeded_users[0].id)
        assert engine.can_access_scope(context, "SECTION") is False

    def test_direction_scope_grants_org_access(
        self, db_session: Session, seeded_users, seeded_unit
    ):
        responsibility_service = ResponsibilityService(db_session)
        responsibility_service.create(
            user_id=seeded_users[0].id,
            scope=ResponsibilityScope.DIRECTION,
            organizational_unit_id=seeded_unit.id,
        )
        context = AccessContextService(db_session).get_context_for_user_id(seeded_users[0].id)
        engine = ScopeEngine()
        assert engine.can_access_scope(context, "DIRECTION") is True

    def test_resolve_effective_scope(self, db_session: Session, seeded_users):
        responsibility_service = ResponsibilityService(db_session)
        responsibility_service.create(
            user_id=seeded_users[0].id,
            scope=ResponsibilityScope.PROCESS_MANAGEMENT,
        )
        context = AccessContextService(db_session).get_context_for_user_id(seeded_users[0].id)
        engine = ScopeEngine()
        assert engine.resolve_effective_scope(context, "PROCESS_MANAGEMENT") is True
        assert engine.resolve_effective_scope(context, "SECTION") is False

    def test_effective_responsibilities_humanized(self, db_session: Session, seeded_users):
        responsibility_service = ResponsibilityService(db_session)
        responsibility_service.create(
            user_id=seeded_users[0].id,
            scope=ResponsibilityScope.PROCESS_MANAGEMENT,
        )
        context = AccessContextService(db_session).get_context_for_user_id(seeded_users[0].id)
        engine = ScopeEngine()
        assert engine.get_effective_responsibilities(context) == ["Gestão de Processos"]
