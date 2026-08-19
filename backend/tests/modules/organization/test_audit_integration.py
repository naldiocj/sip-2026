"""Testes de integração de auditoria (TASK-024).

Cobrem:
- eventos registados por operação administrativa;
- nada sensível (password/token) nos detalhes;
- associações user-person auditadas.
"""

import uuid

from app.modules.auth.domain.audit import AuditEvent, AuditEventType
from app.modules.auth.domain.user import User, UserStatus
from argon2 import PasswordHasher
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session


def _login(client: TestClient, username: str = "admin", password: str = "admin123"):
    """Autentica e devolve a resposta de login."""
    return client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )


def _auth_headers(client: TestClient) -> dict[str, str]:
    response = _login(client)
    assert response.status_code == 200, response.text
    token = response.cookies.get("sip_access_token")
    return {"Authorization": f"Bearer {token}"}


def _get_org_id(db_session: Session) -> uuid.UUID:
    from app.modules.organization.domain.organization import Organization

    org = db_session.scalar(select(Organization).limit(1))
    assert org is not None
    return org.id


def _events(db_session: Session, event_type: AuditEventType) -> list[AuditEvent]:
    return list(db_session.scalars(select(AuditEvent).where(AuditEvent.event_type == event_type)))


def _assert_no_secrets(events: list[AuditEvent]) -> None:
    """Garante que nenhum detalhe contém passwords ou tokens."""
    for event in events:
        details = event.details or {}
        blob = str(details).lower()
        assert "password" not in blob, f"password exposto em {event.event_type}"
        assert "token" not in blob, f"token exposto em {event.event_type}"
        assert "secret" not in blob, f"secret exposto em {event.event_type}"


def test_audit_all_admin_operations(client: TestClient, db_session: Session) -> None:
    """Cada operação administrativa regista o evento correspondente."""
    headers = _auth_headers(client)
    org_id = _get_org_id(db_session)

    client.patch(
        f"/api/v1/organizations/{org_id}",
        json={"name": "SIC Auditado"},
        headers=headers,
    )
    assert _events(db_session, AuditEventType.ORGANIZATION_UPDATED)

    unit = client.post(
        "/api/v1/units",
        json={
            "organization_id": str(org_id),
            "type_id": "SECTION",
            "name": f"Secção Audit {uuid.uuid4().hex[:6]}",
        },
        headers=headers,
    )
    assert unit.status_code == 201, unit.text
    assert _events(db_session, AuditEventType.UNIT_CREATED)
    unit_id = unit.json()["id"]

    client.patch(
        f"/api/v1/units/{unit_id}", json={"name": "Secção Audit Renomeada"}, headers=headers
    )
    assert _events(db_session, AuditEventType.UNIT_UPDATED)

    client.post(f"/api/v1/units/{unit_id}/deactivate", headers=headers)
    assert _events(db_session, AuditEventType.UNIT_DEACTIVATED)


def test_audit_assignment_and_person_events(client: TestClient, db_session: Session) -> None:
    """Atribuições e pessoas registam eventos específicos."""
    headers = _auth_headers(client)

    person = client.post(
        "/api/v1/persons",
        json={
            "full_name": "Pessoa Audit Eventos",
            "email": "pessoa_audit@example.com",
        },
        headers=headers,
    )
    assert person.status_code == 201, person.text
    person_id = person.json()["id"]

    client.post(f"/api/v1/persons/{person_id}/deactivate", headers=headers)
    assert _events(db_session, AuditEventType.PERSON_CREATED)
    assert _events(db_session, AuditEventType.PERSON_DEACTIVATED)

    user = User(
        username=f"audit_assignment_{uuid.uuid4().hex[:6]}",
        email=f"audit_assignment_{uuid.uuid4().hex[:6]}@example.com",
        password_hash=PasswordHasher().hash("teste123"),
        full_name="Utilizador Audit",
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()

    from app.modules.organization.domain.unit import OrganizationalUnit

    unit = db_session.scalar(select(OrganizationalUnit).limit(1))
    assert unit is not None

    assignment = client.post(
        f"/api/v1/users/{user.id}/assignments",
        json={
            "organizational_unit_id": str(unit.id),
            "assignment_type": "SECONDARY",
            "is_primary": False,
        },
        headers=headers,
    )
    assert assignment.status_code == 201, assignment.text
    assignment_id = assignment.json()["id"]
    assert _events(db_session, AuditEventType.ASSIGNMENT_CREATED)

    client.post(
        f"/api/v1/users/{user.id}/assignments/{assignment_id}/end",
        headers=headers,
    )
    assert _events(db_session, AuditEventType.ASSIGNMENT_ENDED)


def test_audit_responsibility_and_delegation_events(
    client: TestClient, db_session: Session
) -> None:
    """Responsabilidades e delegações registam eventos."""
    headers = _auth_headers(client)
    user_a = User(
        username=f"audit_resp_{uuid.uuid4().hex[:6]}",
        email=f"audit_resp_{uuid.uuid4().hex[:6]}@example.com",
        password_hash=PasswordHasher().hash("teste123"),
        full_name="Resp A",
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    user_b = User(
        username=f"audit_deleg_{uuid.uuid4().hex[:6]}",
        email=f"audit_deleg_{uuid.uuid4().hex[:6]}@example.com",
        password_hash=PasswordHasher().hash("teste123"),
        full_name="Deleg B",
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    db_session.add_all([user_a, user_b])
    db_session.flush()

    responsibility = client.post(
        "/api/v1/responsibilities",
        json={"user_id": str(user_a.id), "scope": "PROCESS_MANAGEMENT"},
        headers=headers,
    )
    assert responsibility.status_code == 201, responsibility.text
    resp_id = responsibility.json()["id"]
    assert _events(db_session, AuditEventType.RESPONSIBILITY_CREATED)

    client.post(f"/api/v1/responsibilities/{resp_id}/end", headers=headers)
    assert _events(db_session, AuditEventType.RESPONSIBILITY_ENDED)

    delegation = client.post(
        "/api/v1/delegations",
        json={
            "delegator_user_id": str(user_a.id),
            "delegate_user_id": str(user_b.id),
            "scope": "PROCESS_MANAGEMENT",
        },
        headers=headers,
    )
    assert delegation.status_code == 201, delegation.text
    delegation_id = delegation.json()["id"]
    assert _events(db_session, AuditEventType.DELEGATION_CREATED)

    client.post(f"/api/v1/delegations/{delegation_id}/revoke", headers=headers)
    assert _events(db_session, AuditEventType.DELEGATION_REVOKED)


def test_audit_no_secrets_in_details(client: TestClient, db_session: Session) -> None:
    """Nenhum evento de auditoria contém dados sensíveis."""
    headers = _auth_headers(client)

    client.post(
        "/api/v1/persons",
        json={"full_name": "Pessoa Sem Segredos", "email": "sem_segredos@example.com"},
        headers=headers,
    )

    all_events = list(db_session.scalars(select(AuditEvent)))
    _assert_no_secrets(all_events)


def test_audit_user_person_link_service(db_session: Session) -> None:
    """Associar/desassociar user-person regista USER_PERSON_LINKED/UNLINKED."""
    from app.modules.person.application.person_service import PersonService

    user = User(
        username=f"link_{uuid.uuid4().hex[:6]}",
        email=f"link_{uuid.uuid4().hex[:6]}@example.com",
        password_hash=PasswordHasher().hash("teste123"),
        full_name="Link User",
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()

    service = PersonService(db_session)
    person = service.create(full_name="Link Person")
    service.associate_user_to_person(user.id, person.id)
    assert _events(db_session, AuditEventType.USER_PERSON_LINKED)

    service.unlink_user_from_person(user.id)
    assert _events(db_session, AuditEventType.USER_PERSON_UNLINKED)
