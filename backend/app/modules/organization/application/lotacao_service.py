"""LotacaoService — consulta de lotação organizacional de utilizadores.

A lotação é uma vista derivada das atribuições (UserAssignment) com
período: onde a pessoa estava, quando esteve e quando saiu.

Regra: nunca apagar histórico — apenas terminar atribuições.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.organization.application.assignment_service import (
    AssignmentService,
)
from app.modules.organization.domain.user_assignment import UserAssignment


class LotacaoService:
    """Consulta a lotação actual e histórica de utilizadores e pessoas."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.assignments = AssignmentService(db)

    def get_current_lotacao(self, user_id: uuid.UUID) -> list[UserAssignment]:
        """Obtém a lotação actual (atribuições activas) de um utilizador."""
        return self.assignments.list_for_user(user_id)

    def get_lotacao_history(self, user_id: uuid.UUID) -> list[UserAssignment]:
        """Obtém o histórico completo de lotação de um utilizador.

        Inclui atribuições terminadas e activas, ordenadas por data de início.
        """
        return self.assignments.list_for_user(user_id, include_inactive=True)

    def get_current_lotacao_by_person(self, person_id: uuid.UUID) -> list[UserAssignment] | None:
        """Obtém a lotação actual de uma pessoa através do utilizador associado.

        Devolve None quando a pessoa não possui utilizador associado.
        """
        from app.modules.auth.domain.user import User
        from app.modules.person.domain.person import Person

        person = self.db.get(Person, person_id)
        if person is None:
            return None
        user = (
            self.db.scalar(select(User).where(User.person_id == person.id))
            if person.user is None
            else person.user
        )
        if user is None:
            return None
        return self.get_current_lotacao(user.id)

    def get_lotacao_history_by_person(self, person_id: uuid.UUID) -> list[UserAssignment] | None:
        """Obtém o histórico de lotação de uma pessoa através do utilizador associado."""
        from app.modules.auth.domain.user import User
        from app.modules.person.domain.person import Person

        person = self.db.get(Person, person_id)
        if person is None:
            return None
        user = (
            self.db.scalar(select(User).where(User.person_id == person.id))
            if person.user is None
            else person.user
        )
        if user is None:
            return None
        return self.get_lotacao_history(user.id)
