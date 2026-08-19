"""Testes do serviço de lotação (TASK-010).

Cobre:
- lotação actual por utilizador;
- histórico com períodos após end_assignment;
- consulta por pessoa (via utilizador associado);
- nenhum apagamento de histórico;
- timeline ordenada por data de início.
"""

from datetime import date

from app.modules.organization.application.assignment_service import (
    AssignmentService,
)
from app.modules.organization.application.lotacao_service import LotacaoService
from app.modules.person.application.person_service import PersonService
from sqlalchemy.orm import Session
from tests.conftest import requires_database


@requires_database
class TestLotacaoService:
    def test_current_lotacao(self, db_session: Session, seeded_users, seeded_unit):
        assignment_service = AssignmentService(db_session)
        assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )
        service = LotacaoService(db_session)
        lotacao = service.get_current_lotacao(seeded_users[0].id)
        assert lotacao is not None
        assert lotacao[0].organizational_unit_id == seeded_unit.id
        assert lotacao[0].status == "ACTIVE"

    def test_current_lotacao_empty(self, db_session: Session, seeded_users):
        service = LotacaoService(db_session)
        assert service.get_current_lotacao(seeded_users[0].id) == []

    def test_history_after_end(self, db_session: Session, seeded_users, seeded_unit):
        assignment_service = AssignmentService(db_session)
        assignment = assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )
        assignment_service.end(assignment.id)

        service = LotacaoService(db_session)
        history = service.get_lotacao_history(seeded_users[0].id)
        assert len(history) == 1
        assert history[0].status == "INACTIVE"
        # Nada foi apagado
        assert assignment_service.get(assignment.id) is not None

    def test_history_by_person(self, db_session: Session, seeded_users, seeded_unit):
        person_service = PersonService(db_session)
        person = person_service.create(full_name="João Lotação")
        person_service.associate_user_to_person(seeded_users[0].id, person.id)

        assignment_service = AssignmentService(db_session)
        assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )

        service = LotacaoService(db_session)
        lotacao = service.get_current_lotacao_by_person(person.id)
        assert lotacao is not None
        assert lotacao[0].organizational_unit_id == seeded_unit.id

    def test_history_ordered_by_start_date(self, db_session: Session, seeded_users, seeded_unit):
        assignment_service = AssignmentService(db_session)
        first = assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="SECONDARY",
            is_primary=False,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 6, 30),
        )
        assignment_service.end(first.id)
        second = assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
            start_date=date(2024, 7, 1),
        )

        service = LotacaoService(db_session)
        history = service.get_lotacao_history(seeded_users[0].id)
        assert [h.id for h in history] == [first.id, second.id]

    def test_lotacao_with_primary_marked(self, db_session: Session, seeded_users, seeded_unit):
        assignment_service = AssignmentService(db_session)
        assignment_service.create(
            user_id=seeded_users[0].id,
            organizational_unit_id=seeded_unit.id,
            assignment_type="PRIMARY",
            is_primary=True,
        )
        service = LotacaoService(db_session)
        lotacao = service.get_current_lotacao(seeded_users[0].id)
        assert any(a.is_primary for a in lotacao)
