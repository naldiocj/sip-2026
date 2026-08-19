"""Testes da API de contexto organizacional: filtros de unidades e auditoria (TASK-005)."""

import uuid

from app.modules.auth.domain.audit import AuditEvent, AuditEventType
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session


def _auth_headers(client: TestClient, username: str = "admin", password: str = "admin123") -> dict:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200, response.text
    token = response.cookies.get("sip_access_token")
    return {"Authorization": f"Bearer {token}"}


def _get_org_id(client: TestClient, headers: dict) -> str:
    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    scopes = me.json().get("organization_scope") or []
    if not scopes:
        orgs = client.get("/api/v1/organizations", headers=headers)
        assert orgs.status_code == 200, orgs.text
        return str(orgs.json()[0]["id"])
    return str(scopes[0]["organization_id"])


def _get_units(client: TestClient, headers: dict, org_id: str, **params: str) -> list[dict]:
    response = client.get(
        "/api/v1/units", params={"organization_id": org_id, **params}, headers=headers
    )
    assert response.status_code == 200, response.text
    return response.json()


# ── Filtros de unidades ─────────────────────────────────────────


def test_list_units_filters_by_parent(client: TestClient) -> None:
    headers = _auth_headers(client)
    org_id = _get_org_id(client, headers)
    units = _get_units(client, headers, org_id)

    direction = next(u for u in units if u["code"] == "DIR-INV")
    subtree = _get_units(client, headers, org_id, parent_id=direction["id"])
    assert len(subtree) >= 1
    assert all(u["id"] != direction["id"] for u in subtree), "parent exclui a própria unidade"


def test_list_units_filters_by_type(client: TestClient) -> None:
    headers = _auth_headers(client)
    org_id = _get_org_id(client, headers)
    sections = _get_units(client, headers, org_id, type_id="SECTION")
    assert sections, "existem secções no seed"
    assert all(u["type_id"] == "SECTION" for u in sections)


def test_list_units_filters_combined(client: TestClient) -> None:
    headers = _auth_headers(client)
    org_id = _get_org_id(client, headers)
    units = _get_units(client, headers, org_id)

    direction = next(u for u in units if u["code"] == "DIR-INV")
    combined = _get_units(client, headers, org_id, parent_id=direction["id"], type_id="SECTION")
    assert combined
    assert all(u["type_id"] == "SECTION" for u in combined)
    assert all(u["id"] != direction["id"] for u in combined)


def test_list_units_filters_require_organization_read(client: TestClient) -> None:
    headers = _auth_headers(client, username="instrutor", password="instrutor123")
    response = client.get(
        "/api/v1/units?organization_id=00000000-0000-0000-0000-000000000000", headers=headers
    )
    assert response.status_code == 403


# ── Auditoria ───────────────────────────────────────────────────


def _user_id_from_me(client: TestClient, headers: dict) -> str:
    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    return str(me.json()["id"])


def test_audit_endpoint_lists_events_filtered_by_user(client: TestClient) -> None:
    admin_headers = _auth_headers(client)
    user_headers = _auth_headers(client, username="director", password="director123")
    user_id = _user_id_from_me(client, user_headers)

    admin_headers_again = _auth_headers(client)
    _ = admin_headers_again

    response = client.get(f"/api/v1/audit?user_id={user_id}", headers=admin_headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["total"] >= 1, "o login do director gera eventos de auditoria"
    assert all(item["user_id"] == user_id for item in body["items"])


def test_audit_endpoint_filters_by_event_type(client: TestClient) -> None:
    headers = _auth_headers(client)
    response = client.get("/api/v1/audit?event_type=LOGIN_SUCCESS", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    assert all(item["event_type"] == "LOGIN_SUCCESS" for item in body["items"])


def test_audit_endpoint_requires_system_audit(client: TestClient) -> None:
    headers = _auth_headers(client, username="director", password="director123")
    response = client.get("/api/v1/audit", headers=headers)
    assert response.status_code == 403


def test_primary_assignment_change_records_audit(client: TestClient, db_session: Session) -> None:
    from app.modules.auth.domain.user import User, UserStatus
    from app.modules.organization.domain.unit import OrganizationalUnit
    from argon2 import PasswordHasher

    headers = _auth_headers(client)
    user = User(
        username="primario_teste",
        email="primario_teste@example.com",
        password_hash=PasswordHasher().hash("teste123"),
        full_name="Primario Teste",
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    unit = db_session.scalar(select(OrganizationalUnit).limit(1))
    assert unit is not None

    created = client.post(
        f"/api/v1/users/{user.id}/assignments",
        json={
            "organizational_unit_id": str(unit.id),
            "assignment_type": "TEMPORARY",
            "is_primary": False,
            "start_date": "2026-01-01",
        },
        headers=headers,
    )
    assert created.status_code == 201, created.text
    assignment_id = created.json()["id"]

    db_session.expire_all()
    before = len(
        list(
            db_session.scalars(
                select(AuditEvent).where(
                    AuditEvent.event_type == str(AuditEventType.USER_PRIMARY_ASSIGNMENT_CHANGED)
                )
            )
        )
    )
    patched = client.patch(
        f"/api/v1/users/{user.id}/assignments/{assignment_id}",
        json={"is_primary": True},
        headers=headers,
    )
    assert patched.status_code == 200, patched.text
    assert patched.json()["is_primary"] is True

    db_session.expire_all()
    after = list(
        db_session.scalars(
            select(AuditEvent).where(
                AuditEvent.event_type == str(AuditEventType.USER_PRIMARY_ASSIGNMENT_CHANGED)
            )
        )
    )
    assert len(after) == before + 1
    details = after[-1].details or {}
    assert details.get("user_id") == str(user.id)
    assert details.get("is_primary") is True
    from app.modules.organization.domain.user_assignment import UserAssignment

    db_session.delete(db_session.get(UserAssignment, uuid.UUID(assignment_id)))
    db_session.flush()
    db_session.delete(user)
    db_session.flush()
