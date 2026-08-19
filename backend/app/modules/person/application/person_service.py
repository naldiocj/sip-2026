"""PersonService — operações centrais para a gestão de pessoas.

Fornece CRUD, geração de número de pessoa e associação de utilizador
com garantias de integridade. Os dados de pessoa estão sempre separados
dos dados de autenticação.
"""

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.person.domain.exceptions import (
    DuplicateEmployeeNumberError,
    DuplicatePersonNumberError,
    PersonAlreadyLinkedError,
    PersonNotFoundError,
)
from app.modules.person.domain.person import Person, PersonNumberGenerator, PersonStatus


class PersonService:
    """Serviço central para operações de pessoa."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def _next_person_number(self) -> str:
        """Gera o próximo número de pessoa atomicamente."""
        last = self.db.scalar(select(func.max(Person.person_number)))
        number = PersonNumberGenerator.next_number(last)
        # No caso improvável de uma corrida, tentar novamente algumas vezes.
        for _ in range(5):
            exists = self.db.scalar(select(Person.id).where(Person.person_number == number))
            if exists is None:
                return number
            number = PersonNumberGenerator.next_number(number)
        raise DuplicatePersonNumberError("Could not allocate a unique person number.")

    def get(self, person_id: uuid.UUID) -> Person | None:
        """Obtém uma pessoa pelo ID."""
        return self.db.get(Person, person_id)

    def get_by_person_number(self, person_number: str) -> Person | None:
        """Obtém uma pessoa pelo número de pessoa."""
        return self.db.scalar(select(Person).where(Person.person_number == person_number))

    def list(
        self,
        *,
        search: str | None = None,
        status: str | None = None,
        page: int = 1,
        page_size: int = 25,
    ) -> tuple[list[Person], int]:
        """Lista pessoas com pesquisa, filtro e paginação opcionais.

        Devolve (itens, total).
        """
        query = select(Person)
        count_query = select(func.count()).select_from(Person)

        if search:
            like = f"%{search}%"
            query = query.where(
                (Person.full_name.ilike(like))
                | (Person.person_number.ilike(like))
                | (Person.bi_number.ilike(like))
            )
            count_query = count_query.where(
                (Person.full_name.ilike(like))
                | (Person.person_number.ilike(like))
                | (Person.bi_number.ilike(like))
            )

        if status:
            query = query.where(Person.status == status)
            count_query = count_query.where(Person.status == status)

        total = self.db.scalar(count_query) or 0
        offset = (page - 1) * page_size
        items = list(
            self.db.scalars(query.order_by(Person.full_name).offset(offset).limit(page_size))
        )
        return items, total

    def create(
        self,
        *,
        full_name: str,
        preferred_name: str | None = None,
        birth_date: date | None = None,
        birth_place: str | None = None,
        nationality: str | None = None,
        gender: str | None = None,
        bi_number: str | None = None,
        phone: str | None = None,
        email: str | None = None,
        address: str | None = None,
        employee_number: str | None = None,
        functional_category: str | None = None,
        job_title: str | None = None,
        admission_date: date | None = None,
        employment_status: str | None = None,
        professional_registration: str | None = None,
        notes: str | None = None,
    ) -> Person:
        """Cria uma nova pessoa."""
        if employee_number is not None:
            existing = self.db.scalar(
                select(Person.id).where(Person.employee_number == employee_number)
            )
            if existing is not None:
                raise DuplicateEmployeeNumberError(
                    f"Employee number '{employee_number}' already exists."
                )

        person = Person(
            person_number=self._next_person_number(),
            full_name=full_name,
            preferred_name=preferred_name,
            birth_date=birth_date,
            birth_place=birth_place,
            nationality=nationality,
            gender=gender,
            bi_number=bi_number,
            phone=phone,
            email=email,
            address=address,
            employee_number=employee_number,
            functional_category=functional_category,
            job_title=job_title,
            admission_date=admission_date,
            employment_status=employment_status,
            professional_registration=professional_registration,
            notes=notes,
            status=PersonStatus.ACTIVE,
            is_active=True,
        )
        self.db.add(person)
        self.db.flush()
        return person

    def update(
        self,
        person_id: uuid.UUID,
        *,
        full_name: str | None = None,
        preferred_name: str | None = None,
        birth_date: date | None = None,
        birth_place: str | None = None,
        nationality: str | None = None,
        gender: str | None = None,
        bi_number: str | None = None,
        phone: str | None = None,
        email: str | None = None,
        address: str | None = None,
        employee_number: str | None = None,
        functional_category: str | None = None,
        job_title: str | None = None,
        admission_date: date | None = None,
        employment_status: str | None = None,
        professional_registration: str | None = None,
        notes: str | None = None,
    ) -> Person:
        """Actualiza os campos de uma pessoa (apenas os campos fornecidos)."""
        person = self.db.get(Person, person_id)
        if person is None:
            raise PersonNotFoundError(f"Person {person_id} not found.")

        if employee_number is not None and employee_number != person.employee_number:
            existing = self.db.scalar(
                select(Person.id).where(
                    Person.employee_number == employee_number,
                    Person.id != person_id,
                )
            )
            if existing is not None:
                raise DuplicateEmployeeNumberError(
                    f"Employee number '{employee_number}' already exists."
                )

        for field, value in {
            "full_name": full_name,
            "preferred_name": preferred_name,
            "birth_date": birth_date,
            "birth_place": birth_place,
            "nationality": nationality,
            "gender": gender,
            "bi_number": bi_number,
            "phone": phone,
            "email": email,
            "address": address,
            "employee_number": employee_number,
            "functional_category": functional_category,
            "job_title": job_title,
            "admission_date": admission_date,
            "employment_status": employment_status,
            "professional_registration": professional_registration,
            "notes": notes,
        }.items():
            if value is not None:
                setattr(person, field, value)

        self.db.flush()
        return person

    def deactivate(self, person_id: uuid.UUID) -> Person:
        """Desactiva uma pessoa (suave — o histórico é preservado)."""
        person = self.db.get(Person, person_id)
        if person is None:
            raise PersonNotFoundError(f"Person {person_id} not found.")
        person.is_active = False
        person.status = PersonStatus.INACTIVE
        self.db.flush()
        return person

    def get_by_user_id(self, user_id: uuid.UUID) -> Person | None:
        """Obtém a pessoa associada a um utilizador (via user.person)."""
        from app.modules.auth.domain.user import User

        user = self.db.get(User, user_id)
        if user is None or user.person is None:
            return None
        return user.person  # type: ignore[no-any-return]

    def associate_user_to_person(
        self,
        user_id: uuid.UUID,
        person_id: uuid.UUID,
    ) -> Person:
        """Associa um utilizador a uma pessoa (integridade 1:1).

        Levanta PersonAlreadyLinkedError se a pessoa já tiver um utilizador.
        """
        from app.modules.auth.domain.user import User

        user = self.db.get(User, user_id)
        if user is None:
            raise PersonNotFoundError(f"User {user_id} not found.")
        person = self.db.get(Person, person_id)
        if person is None:
            raise PersonNotFoundError(f"Person {person_id} not found.")

        if person.user is not None and person.user.id != user_id:
            raise PersonAlreadyLinkedError(
                f"Person {person_id} is already linked to user {person.user.id}."
            )

        user.person = person
        self.db.flush()
        from app.modules.auth.application.audit import AuditService
        from app.modules.auth.domain.audit import AuditEventType

        AuditService(self.db).record(
            AuditEventType.USER_PERSON_LINKED,
            details={"user_id": str(user_id), "person_id": str(person_id)},
            commit=False,
        )
        return person

    def unlink_user_from_person(self, user_id: uuid.UUID) -> Person | None:
        """Desassocia um utilizador da sua pessoa. O histórico/dados são preservados."""
        from app.modules.auth.domain.user import User

        user = self.db.get(User, user_id)
        if user is None:
            raise PersonNotFoundError(f"User {user_id} not found.")
        person = user.person
        if person is None:
            return None
        user.person = None
        self.db.flush()
        from app.modules.auth.application.audit import AuditService
        from app.modules.auth.domain.audit import AuditEventType

        AuditService(self.db).record(
            AuditEventType.USER_PERSON_UNLINKED,
            details={"user_id": str(user_id), "person_id": str(person.id)},
            commit=False,
        )
        return person  # type: ignore[no-any-return]
