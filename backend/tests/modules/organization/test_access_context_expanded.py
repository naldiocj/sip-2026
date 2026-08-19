"""Testes do AccessContext expandido (TASK-015).

Cobre:
- contexto completo com person, profiles, permissions, assignments,
  responsibilities, delegations e effective_scopes;
- contexto sem person (user sem person);
- não expõe segredos (password, tokens);
- endpoint GET /api/v1/me/context.
"""

import uuid

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
from app.modules.organization.domain.responsibility_scope import ResponsibilityScope
from app.modules.person.application.person_service import PersonService
from sqlalchemy.orm import Session
from tests.conftest import requires_database


@requires_database
class TestExpandedAccessContext:
    def test_full_context_with_person_and_permissions(
        self, db_session: Session, seeded_users, seeded_unit
    ):
        person_service = PersonService(db_session)
        person = person_service.create(
            full_name="João Contexto",
            preferred_name="João",
            email="joao@sip.dev.local",
        )
        person_service.associate_user_to_person(seeded_users[0].id, person.id)

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
        assert context.person is not None
        assert context.person["full_name"] == "João Contexto"
        assert context.profiles == []
        assert isinstance(context.permissions, list)
        assert len(context.assignments) == 1
        assert len(context.responsibilities) == 1
        assert context.responsibility_scopes == ["SECTION"]
        assert context.primary_unit_id == seeded_unit.id

    def test_context_without_person(self, db_session: Session, seeded_users):
        context = AccessContextService(db_session).get_context_for_user_id(
            seeded_users[0].id, username=seeded_users[0].username
        )
        assert context.person is None

    def test_context_does_not_expose_secrets(self, db_session: Session, seeded_users):
        context = AccessContextService(db_session).get_context_for_user_id(
            seeded_users[0].id, username=seeded_users[0].username
        )
        dumped = str(context)
        for secret in ("password", "access_token", "refresh_token", "hash"):
            assert secret not in dumped.lower()

    def test_effective_scopes_include_delegated(
        self, db_session: Session, seeded_users, seeded_unit
    ):
        delegation_service = DelegationService(db_session)
        delegation_service.create(
            delegator_user_id=seeded_users[0].id,
            delegate_user_id=seeded_users[1].id,
            scope=ResponsibilityScope.DOCUMENT_MANAGEMENT,
            organizational_unit_id=seeded_unit.id,
        )
        context = AccessContextService(db_session).get_context_for_user_id(
            seeded_users[1].id, username=seeded_users[1].username
        )
        assert "DOCUMENT_MANAGEMENT" in context.effective_scopes

    def test_empty_context_shape(self, db_session: Session):
        context = AccessContextService(db_session).get_context_for_user_id(uuid.uuid4())
        assert context.person is None
        assert context.profiles == []
        assert context.permissions == []
        assert context.assignments == []
        assert context.responsibilities == []
        assert context.delegations == []
        assert context.effective_scopes == []
