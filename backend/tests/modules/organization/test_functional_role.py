"""Testes do serviço de funções funcionais (TASK-011).

Cobre:
- atribuir função a utilizador numa unidade;
- funções activas de um utilizador;
- terminar função (suave, histórico preservado);
- humanização de funções;
- função diferente do perfil técnico.
"""

from datetime import date

from app.modules.organization.application.functional_role_service import (
    FunctionalRoleService,
)
from app.modules.organization.domain.functional_role import (
    FUNCTIONAL_ROLE_LABELS,
    FunctionalRole,
    humanize_functional_role,
)
from sqlalchemy.orm import Session
from tests.conftest import requires_database


@requires_database
class TestFunctionalRole:
    def test_assign_role_to_user(self, db_session: Session, seeded_users, seeded_unit):
        service = FunctionalRoleService(db_session)
        assignment = service.assign(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            functional_role=FunctionalRole.INSTRUTOR,
        )
        assert assignment.functional_role == FunctionalRole.INSTRUTOR
        assert assignment.is_active is True

    def test_list_active_roles(self, db_session: Session, seeded_users, seeded_unit):
        service = FunctionalRoleService(db_session)
        service.assign(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            functional_role=FunctionalRole.INSTRUTOR,
        )
        service.assign(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            functional_role=FunctionalRole.EDITOR,
        )
        roles = service.list_for_user(seeded_users[0].id)
        assert len(roles) == 2

    def test_end_role_preserves_history(self, db_session: Session, seeded_users, seeded_unit):
        service = FunctionalRoleService(db_session)
        assignment = service.assign(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            functional_role=FunctionalRole.DIRECTOR,
        )
        ended = service.end(assignment.id)
        assert ended.is_active is False
        # Histórico preservado
        history = service.list_for_user(seeded_users[0].id, include_inactive=True)
        assert len(history) == 1

    def test_role_different_from_profile(self, db_session: Session, seeded_users, seeded_unit):
        # Utilizador sem perfil DIRECTOR pode exercer função DIRECTOR
        service = FunctionalRoleService(db_session)
        assignment = service.assign(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            functional_role=FunctionalRole.DIRECTOR,
        )
        profile_codes = {str(p.code) for p in seeded_users[0].profiles}
        assert "DIRECTOR" not in profile_codes
        assert str(assignment.functional_role) == "DIRECTOR"

    def test_role_with_period(self, db_session: Session, seeded_users, seeded_unit):
        service = FunctionalRoleService(db_session)
        assignment = service.assign(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            functional_role=FunctionalRole.SECCAO_CHEFE,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31),
        )
        assert assignment.start_date == date(2025, 1, 1)
        assert assignment.end_date == date(2025, 12, 31)

    def test_humanization(self):
        assert FUNCTIONAL_ROLE_LABELS[FunctionalRole.DIRECTOR] == "Director"
        assert FUNCTIONAL_ROLE_LABELS[FunctionalRole.INSTRUTOR] == "Instrutor"
        assert humanize_functional_role("AGENTE_PIQUETE") == "Agente de Piquete"
        assert humanize_functional_role("SECCAO_CHEFE") == "Chefe de Secção"
