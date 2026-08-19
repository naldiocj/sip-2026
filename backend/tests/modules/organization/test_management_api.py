"""Testes da API de gestão: atribuições, responsabilidades e delegações (TASK-019)."""

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


def _create_user(db_session: Session, username: str) -> User:
    user = User(
        username=username,
        email=f"{username}@example.com",
        password_hash=PasswordHasher().hash("teste123"),
        full_name=username.title(),
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    return user


def _get_unit_id(db_session: Session) -> uuid.UUID:
    from app.modules.organization.domain.unit import OrganizationalUnit

    unit = db_session.scalar(select(OrganizationalUnit).limit(1))
    assert unit is not None
    return unit.id


def _create_assignment(client: TestClient, db_session: Session, user_id: uuid.UUID) -> dict:
    headers = _auth_headers(client)
    unit_id = _get_unit_id(db_session)
    response = client.post(
        f"/api/v1/users/{user_id}/assignments",
        json={
            "organizational_unit_id": str(unit_id),
            "assignment_type": "PRIMARY",
            "is_primary": True,
            "start_date": "2026-01-01",
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_assignment_flow(client: TestClient, db_session: Session) -> None:
    """Fluxo completo: criar, listar, actualizar e terminar sem destruir histórico."""
    user = _create_user(db_session, f"atribuido_{uuid.uuid4().hex[:6]}")
    headers = _auth_headers(client)
    unit_id = _get_unit_id(db_session)

    created = _create_assignment(client, db_session, user.id)
    assignment_id = created["id"]

    listed = client.get(f"/api/v1/users/{user.id}/assignments", headers=headers)
    assert listed.status_code == 200
    assert any(a["id"] == assignment_id for a in listed.json())

    updated = client.patch(
        f"/api/v1/users/{user.id}/assignments/{assignment_id}",
        json={"end_date": "2026-12-31"},
        headers=headers,
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["end_date"] == "2026-12-31"

    ended = client.post(
        f"/api/v1/users/{user.id}/assignments/{assignment_id}/end",
        headers=headers,
    )
    assert ended.status_code == 200, ended.text
    assert ended.json()["status"] == "INACTIVE"

    unit_assignments = client.get(f"/api/v1/units/{unit_id}/assignments", headers=headers)
    assert unit_assignments.status_code == 200


def test_assignment_end_not_found(client: TestClient) -> None:
    headers = _auth_headers(client)
    response = client.post(
        f"/api/v1/users/{uuid.uuid4()}/assignments/{uuid.uuid4()}/end",
        headers=headers,
    )
    assert response.status_code == 404


def test_responsibility_crud(client: TestClient, db_session: Session) -> None:
    """Criar, listar, obter e terminar uma responsabilidade."""
    user = _create_user(db_session, f"responsavel_{uuid.uuid4().hex[:6]}")
    headers = _auth_headers(client)

    created = client.post(
        "/api/v1/responsibilities",
        json={
            "user_id": str(user.id),
            "scope": "PROCESS_MANAGEMENT",
            "resource_type": "processo",
            "start_date": "2026-01-01",
        },
        headers=headers,
    )
    assert created.status_code == 201, created.text
    resp_id = created.json()["id"]

    listed = client.get("/api/v1/responsibilities", headers=headers)
    assert listed.status_code == 200
    assert any(r["id"] == resp_id for r in listed.json())

    by_user = client.get(f"/api/v1/responsibilities?user_id={user.id}", headers=headers)
    assert by_user.status_code == 200
    assert len(by_user.json()) >= 1

    single = client.get(f"/api/v1/responsibilities/{resp_id}", headers=headers)
    assert single.status_code == 200
    assert single.json()["scope"] == "PROCESS_MANAGEMENT"

    ended = client.post(f"/api/v1/responsibilities/{resp_id}/end", headers=headers)
    assert ended.status_code == 200, ended.text
    assert ended.json()["status"] == "ENDED"
    assert ended.json()["is_active"] is False


def test_responsibility_requires_manage_permission(client: TestClient, db_session: Session) -> None:
    """Utilizador sem responsibility.manage recebe 403."""
    user = _create_user(db_session, f"sem_perm_{uuid.uuid4().hex[:6]}")
    target = _create_user(db_session, f"alvo_{uuid.uuid4().hex[:6]}")
    response = _login(client, username=user.username, password="teste123")
    assert response.status_code == 200, response.text
    headers = {"Authorization": f"Bearer {response.cookies.get('sip_access_token')}"}

    denied = client.post(
        "/api/v1/responsibilities",
        json={"user_id": str(target.id), "scope": "PROCESS_MANAGEMENT"},
        headers=headers,
    )
    assert denied.status_code == 403


def test_delegation_flow(client: TestClient, db_session: Session) -> None:
    """Criar, listar, obter e revogar uma delegação."""
    delegator = _create_user(db_session, f"delegante_{uuid.uuid4().hex[:6]}")
    delegate = _create_user(db_session, f"delegado_{uuid.uuid4().hex[:6]}")
    headers = _auth_headers(client)

    created = client.post(
        "/api/v1/delegations",
        json={
            "delegator_user_id": str(delegator.id),
            "delegate_user_id": str(delegate.id),
            "scope": "PROCESS_MANAGEMENT",
            "start_date": "2026-01-01",
            "reason": "Férias",
        },
        headers=headers,
    )
    assert created.status_code == 201, created.text
    delegation_id = created.json()["id"]
    assert created.json()["status"] == "ACTIVE"

    listed = client.get("/api/v1/delegations", headers=headers)
    assert listed.status_code == 200
    assert any(d["id"] == delegation_id for d in listed.json())

    as_delegate = client.get(
        f"/api/v1/delegations?user_id={delegate.id}&as_delegator=false",
        headers=headers,
    )
    assert as_delegate.status_code == 200
    assert any(d["id"] == delegation_id for d in as_delegate.json())

    single = client.get(f"/api/v1/delegations/{delegation_id}", headers=headers)
    assert single.status_code == 200

    revoked = client.post(f"/api/v1/delegations/{delegation_id}/revoke", headers=headers)
    assert revoked.status_code == 200, revoked.text
    assert revoked.json()["status"] == "REVOKED"
    assert revoked.json()["is_active"] is False


def test_delegation_self_delegation_rejected(client: TestClient, db_session: Session) -> None:
    """Delegação a si próprio é rejeitada."""
    user = _create_user(db_session, f"auto_{uuid.uuid4().hex[:6]}")
    headers = _auth_headers(client)
    response = client.post(
        "/api/v1/delegations",
        json={
            "delegator_user_id": str(user.id),
            "delegate_user_id": str(user.id),
            "scope": "PROCESS_MANAGEMENT",
        },
        headers=headers,
    )
    assert response.status_code == 422


def test_substitution_flow(client: TestClient, db_session: Session) -> None:
    """Criar, listar, obter e terminar uma substituição."""
    substituted = _create_user(db_session, f"substituido_{uuid.uuid4().hex[:6]}")
    substitute = _create_user(db_session, f"substituto_{uuid.uuid4().hex[:6]}")
    headers = _auth_headers(client)
    unit_id = _get_unit_id(db_session)

    created = client.post(
        "/api/v1/substitutions",
        json={
            "substituted_user_id": str(substituted.id),
            "substitute_user_id": str(substitute.id),
            "organizational_unit_id": str(unit_id),
            "functional_role": "SECCAO_CHEFE",
            "start_date": "2026-01-01",
        },
        headers=headers,
    )
    assert created.status_code == 201, created.text
    sub_id = created.json()["id"]
    assert created.json()["status"] == "ACTIVE"

    listed = client.get("/api/v1/substitutions", headers=headers)
    assert listed.status_code == 200
    assert any(s["id"] == sub_id for s in listed.json())

    single = client.get(f"/api/v1/substitutions/{sub_id}", headers=headers)
    assert single.status_code == 200
    assert single.json()["substitute_user_id"] == str(substitute.id)

    ended = client.post(f"/api/v1/substitutions/{sub_id}/end", headers=headers)
    assert ended.status_code == 200
    assert ended.json()["status"] == "ENDED"
    assert ended.json()["is_active"] is False


def test_substitution_self_rejected(client: TestClient, db_session: Session) -> None:
    """Substituição a si próprio é rejeitada."""
    user = _create_user(db_session, f"auto_sub_{uuid.uuid4().hex[:6]}")
    headers = _auth_headers(client)
    response = client.post(
        "/api/v1/substitutions",
        json={
            "substituted_user_id": str(user.id),
            "substitute_user_id": str(user.id),
        },
        headers=headers,
    )
    assert response.status_code == 422


def test_audit_events_recorded(client: TestClient, db_session: Session) -> None:
    user = _create_user(db_session, f"audit_{uuid.uuid4().hex[:6]}")
    target = _create_user(db_session, f"audit_alvo_{uuid.uuid4().hex[:6]}")
    headers = _auth_headers(client)

    client.post(
        "/api/v1/responsibilities",
        json={"user_id": str(target.id), "scope": "PROCESS_MANAGEMENT"},
        headers=headers,
    )
    delegation = client.post(
        "/api/v1/delegations",
        json={
            "delegator_user_id": str(user.id),
            "delegate_user_id": str(target.id),
            "scope": "PROCESS_MANAGEMENT",
        },
        headers=headers,
    )
    assert delegation.status_code == 201
    client.post(f"/api/v1/delegations/{delegation.json()['id']}/revoke", headers=headers)

    substitution = client.post(
        "/api/v1/substitutions",
        json={
            "substituted_user_id": str(user.id),
            "substitute_user_id": str(target.id),
        },
        headers=headers,
    )
    assert substitution.status_code == 201
    client.post(
        f"/api/v1/substitutions/{substitution.json()['id']}/end",
        headers=headers,
    )

    events = list(
        db_session.scalars(
            select(AuditEvent).where(
                AuditEvent.event_type.in_(
                    [
                        AuditEventType.RESPONSIBILITY_CREATED,
                        AuditEventType.DELEGATION_CREATED,
                        AuditEventType.DELEGATION_REVOKED,
                        AuditEventType.SUBSTITUTION_CREATED,
                        AuditEventType.SUBSTITUTION_ENDED,
                    ]
                )
            )
        )
    )
    types = {str(e.event_type) for e in events}
    assert AuditEventType.RESPONSIBILITY_CREATED.value in types
    assert AuditEventType.DELEGATION_CREATED.value in types
    assert AuditEventType.DELEGATION_REVOKED.value in types
    assert AuditEventType.SUBSTITUTION_CREATED.value in types
    assert AuditEventType.SUBSTITUTION_ENDED.value in types
