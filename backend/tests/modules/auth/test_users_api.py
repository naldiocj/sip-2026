"""Testes da API de utilizadores (TASK-002 — CRUD, listagem e filtros).

Cobrem: paginação, pesquisa, filtros (status, perfil, unidade),
criação, actualização, detalhe e autorização.
"""

import uuid

from app.modules.auth.domain.user import User, UserStatus
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.conftest import requires_database

USERS_URL = "/api/v1/users"


def _auth_headers(client: TestClient, username: str = "admin", password: str = "admin123"):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200, response.text
    token = response.cookies.get("sip_access_token")
    return {"Authorization": f"Bearer {token}"}


def _unique_user_payload(prefix: str = "crud") -> dict:
    suffix = uuid.uuid4().hex[:8]
    return {
        "username": f"{prefix}.{suffix}",
        "email": f"{prefix}.{suffix}@example.com",
        "full_name": "Utilizador CRUD",
        "password": "segredo123",
    }


# ── Listagem / paginação ─────────────────────────────────────────


@requires_database
def test_list_users_paginated(client: TestClient) -> None:
    headers = _auth_headers(client)
    response = client.get(f"{USERS_URL}?page=1&page_size=5", headers=headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["page"] == 1
    assert body["page_size"] == 5
    assert len(body["items"]) <= 5
    assert body["total"] >= 1


@requires_database
def test_list_users_includes_profiles_and_status_label(client: TestClient) -> None:
    headers = _auth_headers(client)
    response = client.get(USERS_URL, headers=headers)
    assert response.status_code == 200
    admin = next(u for u in response.json()["items"] if u["username"] == "admin")
    assert admin["status_label"] == "Ativo"
    assert any(p["code"] == "ADMINISTRADOR_SISTEMA" for p in admin["profiles"])


@requires_database
def test_list_users_filters_by_status(client: TestClient, db_session: Session) -> None:
    from app.modules.auth.application.password import PasswordService

    hasher = PasswordService()
    db_session.add(
        User(
            username=f"inact.{uuid.uuid4().hex[:8]}",
            email=f"inact.{uuid.uuid4().hex[:8]}@example.com",
            password_hash=hasher.hash_password("segredo123"),
            full_name="Utilizador Inactivo",
            status=UserStatus.INACTIVE,
            is_active=False,
        )
    )
    db_session.commit()

    headers = _auth_headers(client)
    response = client.get(f"{USERS_URL}?status=INACTIVE", headers=headers)
    assert response.status_code == 200
    items = response.json()["items"]
    assert items, "espera utilizadores inactivos"
    assert all(u["status"] == "INACTIVE" for u in items)


@requires_database
def test_list_users_filters_by_profile(client: TestClient) -> None:
    headers = _auth_headers(client)
    response = client.get(USERS_URL, headers=headers)
    admin = next(u for u in response.json()["items"] if u["username"] == "admin")
    profile_id = admin["profiles"][0]["id"]

    filtered = client.get(f"{USERS_URL}?profile_id={profile_id}", headers=headers)
    assert filtered.status_code == 200
    items = filtered.json()["items"]
    assert items
    assert all(any(p["id"] == profile_id for p in u["profiles"]) for u in items)


@requires_database
def test_list_users_filters_by_unit(client: TestClient) -> None:
    """Filtro por unidade devolve utilizadores atribuídos na sub-árvore."""

    headers = _auth_headers(client)
    response = client.get("/api/v1/users", headers=headers)
    admin = next(u for u in response.json()["items"] if u["username"] == "admin")
    assert admin["primary_assignment"] is not None, "seed deve atribuir admin a uma unidade"

    direction_id = admin["primary_assignment"]["unit_id"]
    filtered = client.get(f"{USERS_URL}?unit_id={direction_id}", headers=headers)
    assert filtered.status_code == 200
    usernames = [u["username"] for u in filtered.json()["items"]]
    assert "admin" in usernames


@requires_database
def test_list_users_requires_user_read_permission(client: TestClient) -> None:
    headers = _auth_headers(client, username="instrutor", password="instrutor123")
    response = client.get(USERS_URL, headers=headers)
    assert response.status_code == 403


# ── Criação ──────────────────────────────────────────────────────


@requires_database
def test_create_user_returns_201_and_hashes_password(client: TestClient) -> None:
    headers = _auth_headers(client)
    payload = _unique_user_payload()
    response = client.post(USERS_URL, json=payload, headers=headers)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["username"] == payload["username"]
    assert body["email"] == payload["email"]
    assert "password" not in body
    assert "password_hash" not in body


@requires_database
def test_create_user_records_audit(client: TestClient, db_session: Session) -> None:
    from app.modules.auth.domain.audit import AuditEvent

    headers = _auth_headers(client)
    response = client.post(USERS_URL, json=_unique_user_payload(), headers=headers)
    assert response.status_code == 201

    events = list(
        db_session.scalars(select(AuditEvent).where(AuditEvent.event_type == "USER_CREATED"))
    )
    assert len(events) >= 1
    assert "password" not in str(events[-1].details).lower()


@requires_database
def test_create_user_duplicate_username_rejected(client: TestClient) -> None:
    headers = _auth_headers(client)
    payload = _unique_user_payload()
    first = client.post(USERS_URL, json=payload, headers=headers)
    assert first.status_code == 201
    second = client.post(USERS_URL, json=payload, headers=headers)
    assert second.status_code in (409, 422)


@requires_database
def test_create_user_requires_user_create_permission(client: TestClient) -> None:
    headers = _auth_headers(client, username="instrutor", password="instrutor123")
    response = client.post(USERS_URL, json=_unique_user_payload(), headers=headers)
    assert response.status_code == 403


# ── Detalhe ──────────────────────────────────────────────────────


@requires_database
def test_get_user_detail_includes_profiles(client: TestClient) -> None:
    headers = _auth_headers(client)
    listed = client.get(USERS_URL, headers=headers)
    admin = next(u for u in listed.json()["items"] if u["username"] == "admin")

    response = client.get(f"{USERS_URL}/{admin['id']}", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == admin["id"]
    assert any(p["code"] == "ADMINISTRADOR_SISTEMA" for p in body["profiles"])


# ── Actualização ─────────────────────────────────────────────────


@requires_database
def test_patch_user_updates_fields(client: TestClient) -> None:
    headers = _auth_headers(client)
    created = client.post(USERS_URL, json=_unique_user_payload(), headers=headers)
    assert created.status_code == 201
    user_id = created.json()["id"]

    response = client.patch(
        f"{USERS_URL}/{user_id}",
        json={"full_name": "Nome Actualizado"},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    assert response.json()["full_name"] == "Nome Actualizado"


@requires_database
def test_patch_user_requires_user_update_permission(client: TestClient) -> None:
    headers = _auth_headers(client)
    listed = client.get(USERS_URL, headers=headers)
    user_id = listed.json()["items"][0]["id"]

    instrutor = _auth_headers(client, username="instrutor", password="instrutor123")
    response = client.patch(
        f"{USERS_URL}/{user_id}",
        json={"full_name": "Hack"},
        headers=instrutor,
    )
    assert response.status_code == 403


# ── Estado da conta ──────────────────────────────────────────────


def _create_and_login_user(client: TestClient) -> tuple[dict, dict]:
    """Cria um utilizador via API e autentica-o; devolve (user, headers)."""
    payload = _unique_user_payload("estado")
    created = client.post(
        USERS_URL, json={**payload, "status": "ACTIVE"}, headers=_auth_headers(client)
    )
    assert created.status_code == 201, created.text
    login = client.post(
        "/api/v1/auth/login",
        json={"username": payload["username"], "password": payload["password"]},
    )
    assert login.status_code == 200, login.text
    token = login.cookies.get("sip_access_token")
    return created.json(), {"Authorization": f"Bearer {token}"}


@requires_database
def test_deactivate_blocks_login_and_revokes_session(client: TestClient) -> None:
    admin_headers = _auth_headers(client)
    user, user_headers = _create_and_login_user(client)

    me_before = client.get("/api/v1/auth/me", headers=user_headers)
    assert me_before.status_code == 200

    response = client.post(f"{USERS_URL}/{user['id']}/deactivate", headers=admin_headers)
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "INACTIVE"

    me_after = client.get("/api/v1/auth/me", headers=user_headers)
    assert me_after.status_code == 401, "sessão deve ser revogada após desactivação"

    login_after = client.post(
        "/api/v1/auth/login",
        json={"username": user["username"], "password": "segredo123"},
    )
    assert login_after.status_code == 401, "login deve falhar após desactivação"


@requires_database
def test_block_is_distinct_from_deactivate(client: TestClient) -> None:
    admin_headers = _auth_headers(client)
    user, user_headers = _create_and_login_user(client)

    response = client.post(f"{USERS_URL}/{user['id']}/block", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "BLOCKED"

    me_after = client.get("/api/v1/auth/me", headers=user_headers)
    assert me_after.status_code == 401


@requires_database
def test_unblock_allows_login_again(client: TestClient) -> None:
    admin_headers = _auth_headers(client)
    user, _ = _create_and_login_user(client)

    client.post(f"{USERS_URL}/{user['id']}/block", headers=admin_headers)
    unblocked = client.post(f"{USERS_URL}/{user['id']}/unblock", headers=admin_headers)
    assert unblocked.status_code == 200
    assert unblocked.json()["status"] == "ACTIVE"

    login = client.post(
        "/api/v1/auth/login",
        json={"username": user["username"], "password": "segredo123"},
    )
    assert login.status_code == 200


@requires_database
def test_activate_restores_access(client: TestClient) -> None:
    admin_headers = _auth_headers(client)
    user, _ = _create_and_login_user(client)

    client.post(f"{USERS_URL}/{user['id']}/deactivate", headers=admin_headers)
    activated = client.post(f"{USERS_URL}/{user['id']}/activate", headers=admin_headers)
    assert activated.status_code == 200
    assert activated.json()["status"] == "ACTIVE"

    login = client.post(
        "/api/v1/auth/login",
        json={"username": user["username"], "password": "segredo123"},
    )
    assert login.status_code == 200


@requires_database
def test_status_endpoints_require_user_update_permission(client: TestClient) -> None:
    headers = _auth_headers(client)
    listed = client.get(USERS_URL, headers=headers)
    user_id = listed.json()["items"][0]["id"]

    instrutor = _auth_headers(client, username="instrutor", password="instrutor123")
    for action in ("activate", "deactivate", "block", "unblock"):
        response = client.post(f"{USERS_URL}/{user_id}/{action}", headers=instrutor)
        assert response.status_code == 403, f"{action} deve exigir permissão"
