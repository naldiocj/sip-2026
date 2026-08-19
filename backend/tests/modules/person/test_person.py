"""Testes de domínio Person (TASK-001/002/003)."""

import uuid

import pytest
from app.modules.person.application.person_service import PersonService
from app.modules.person.domain.exceptions import (
    DuplicateEmployeeNumberError,
    PersonAlreadyLinkedError,
    PersonNotFoundError,
)
from app.modules.person.domain.humanize import humanize_person_status
from app.modules.person.domain.person import PersonNumberGenerator, PersonStatus
from tests.conftest import requires_database


@requires_database
def test_create_person_generates_person_number(db_session) -> None:
    service = PersonService(db_session)
    person = service.create(full_name="João Manuel")
    assert person.person_number.startswith("PES-")
    assert person.status == PersonStatus.ACTIVE
    assert person.is_active is True


@requires_database
def test_person_numbers_are_sequential(db_session) -> None:
    service = PersonService(db_session)
    p1 = service.create(full_name="Ana")
    p2 = service.create(full_name="Bruno")
    n1 = int(p1.person_number.split("-")[1])
    n2 = int(p2.person_number.split("-")[1])
    assert n2 == n1 + 1


@requires_database
def test_person_number_generator_handles_edge_cases() -> None:
    assert PersonNumberGenerator.next_number(None) == "PES-000001"
    assert PersonNumberGenerator.next_number("PES-000001") == "PES-000002"
    assert PersonNumberGenerator.next_number("PES-009999") == "PES-010000"
    assert PersonNumberGenerator.next_number("invalid") == "PES-000001"


@requires_database
def test_person_can_be_created_without_user(db_session) -> None:
    service = PersonService(db_session)
    person = service.create(full_name="Sem Conta")
    assert person.user is None


@requires_database
def test_person_does_not_expose_authentication_data(db_session) -> None:
    service = PersonService(db_session)
    person = service.create(full_name="Teste Auth")
    assert not hasattr(person, "password_hash")
    assert not hasattr(person, "password")


@requires_database
def test_person_status_humanization() -> None:
    assert humanize_person_status(PersonStatus.ACTIVE) == "Activo"
    assert humanize_person_status(PersonStatus.INACTIVE) == "Inactivo"
    assert humanize_person_status(PersonStatus.RETIRED) == "Reformado"
    assert humanize_person_status(PersonStatus.DECEASED) == "Falecido"


@requires_database
def test_update_person_fields(db_session) -> None:
    service = PersonService(db_session)
    person = service.create(full_name="Original")
    updated = service.update(
        person.id,
        full_name="Actualizado",
        phone="+244 999 000 111",
        job_title="Instrutor",
    )
    assert updated.full_name == "Actualizado"
    assert updated.phone == "+244 999 000 111"
    assert updated.job_title == "Instrutor"


@requires_database
def test_deactivate_person_preserves_history(db_session) -> None:
    service = PersonService(db_session)
    person = service.create(full_name="A Desactivar")
    person_id = person.id
    deactivated = service.deactivate(person_id)
    assert deactivated.is_active is False
    assert deactivated.status == PersonStatus.INACTIVE
    assert service.get(person_id) is not None


@requires_database
def test_update_missing_person_raises(db_session) -> None:
    service = PersonService(db_session)
    with pytest.raises(PersonNotFoundError):
        service.update(uuid.uuid4(), full_name="X")


@requires_database
def test_duplicate_employee_number_rejected(db_session) -> None:
    service = PersonService(db_session)
    employee_number = f"EMP-{uuid.uuid4().hex[:8].upper()}"
    service.create(full_name="Funcionário", employee_number=employee_number)
    with pytest.raises(DuplicateEmployeeNumberError):
        service.create(full_name="Outro", employee_number=employee_number)


@requires_database
def test_person_search_and_pagination(db_session) -> None:
    service = PersonService(db_session)
    service.create(full_name="Carlos Alberto")
    service.create(full_name="Carlos Manuel")
    items, total = service.list(search="Carlos")
    assert total == 2
    assert all("Carlos" in p.full_name for p in items)

    items, total = service.list(search="Inexistente")
    assert total == 0
    assert items == []


@requires_database
def test_associate_user_to_person(db_session, seeded_user_admin) -> None:
    service = PersonService(db_session)
    person = service.create(full_name="Para Associar")
    linked = service.associate_user_to_person(seeded_user_admin.id, person.id)
    assert linked.user is not None
    assert linked.user.id == seeded_user_admin.id


@requires_database
def test_associate_person_to_two_users_rejected(db_session, seeded_users) -> None:
    service = PersonService(db_session)
    person = service.create(full_name="Conflito")
    service.associate_user_to_person(seeded_users[0].id, person.id)
    with pytest.raises(PersonAlreadyLinkedError):
        service.associate_user_to_person(seeded_users[1].id, person.id)


@requires_database
def test_unlink_user_from_person_preserves_person(db_session, seeded_user_admin) -> None:
    service = PersonService(db_session)
    person = service.create(full_name="Desligar")
    service.associate_user_to_person(seeded_user_admin.id, person.id)
    unlinked = service.unlink_user_from_person(seeded_user_admin.id)
    assert unlinked is not None
    assert unlinked.id == person.id
    assert service.get(person.id) is not None


@requires_database
def test_get_person_by_user(db_session, seeded_user_admin) -> None:
    service = PersonService(db_session)
    person = service.create(full_name="Por Utilizador")
    service.associate_user_to_person(seeded_user_admin.id, person.id)
    found = service.get_by_user_id(seeded_user_admin.id)
    assert found is not None
    assert found.id == person.id
