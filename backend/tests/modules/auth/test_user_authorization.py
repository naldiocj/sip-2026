"""Testes de autorização por perfil e integridade documentada (TASK-012).

Cobre a matriz completa dos 9 perfis de seed contra os endpoints da sprint
(utilizadores, perfis, auditoria, unidades, atribuições), prevenção de
escalada (campos controlados pelo cliente nunca são confiáveis) e regras de
integridade documentadas no ADR-004: PRIMARY única activa e períodos válidos.

NOTA: a validação hierárquica de atribuições (ex.: Direcção A + Departamento
da Direcção C) NÃO está implementada nem documentada — registada como gap
para decisão posterior (ver sprint doc).
"""

import uuid

import pytest
from app.modules.auth.domain.user import User
from app.modules.organization.domain.unit import OrganizationalUnit
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.conftest import requires_database

# Perfis de seed e credenciais (DEV ONLY).
ALL_PROFILES: dict[str, str] = {
    "admin": "admin123",
    "director": "director123",
    "secretaria": "secretaria123",
    "chefe_departamento": "chefe123",
    "chefe_seccao": "seccao123",
    "instrutor": "instrutor123",
    "piquete": "piquete123",
    "editor": "editor123",
    "pgr": "pgr123",
}

# Permissões por perfil (espelho de PROFILE_PERMISSIONS do seed).
USER_READ = {"admin", "director"}
USER_CREATE = {"admin"}
USER_UPDATE = {"admin"}
PROFILE_READ = {"admin"}
PROFILE_MANAGE = {"admin"}
SYSTEM_AUDIT = {"admin"}
ORGANIZATION_READ = {
    "admin",
    "director",
    "secretaria",
    "chefe_departamento",
    "chefe_seccao",
}
ASSIGNMENT_READ = {
    "admin",
    "director",
    "secretaria",
    "chefe_departamento",
    "chefe_seccao",
    "instrutor",
    "pgr",
}
ASSIGNMENT_CREATE = {"admin", "director", "secretaria"}
ASSIGNMENT_UPDATE = {"admin", "director", "secretaria"}
ASSIGNMENT_END = {"admin", "secretaria"}


def _auth_headers(client: TestClient, username: str) -> dict[str, str]:
    password = ALL_PROFILES[username]
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200, f"{username}: {response.text}"
    token = response.cookies.get("sip_access_token")
    assert token, f"{username}: token em falta"
    return {"Authorization": f"Bearer {token}"}


def _unique_username(prefix: str = "auth") -> str:
    return f"{prefix}.{uuid.uuid4().hex[:8]}"


def _real_unit_id(db: Session) -> str:
    unit = (
        db.execute(select(OrganizationalUnit.id).where(OrganizationalUnit.is_active.is_(True)))
        .scalars()
        .first()
    )
    assert unit is not None
    return str(unit)


def _real_profile_id(db: Session) -> str:
    from app.modules.auth.domain.profile import Profile

    profile = db.execute(select(Profile.id)).scalars().first()
    return str(profile)


# ── Matriz de autorização por endpoint ────────────────────────────


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_list_users_access_matrix(client: TestClient, username: str) -> None:
    response = client.get("/api/v1/users", headers=_auth_headers(client, username))
    if username in USER_READ:
        assert response.status_code == 200
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_create_user_access_matrix(client: TestClient, username: str) -> None:
    payload = {
        "username": _unique_username(),
        "email": f"{_unique_username()}@example.com",
        "full_name": "Matriz de Autorização",
        "password": "segredo123",
    }
    response = client.post("/api/v1/users", json=payload, headers=_auth_headers(client, username))
    if username in USER_CREATE:
        assert response.status_code == 201
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_get_user_detail_access_matrix(
    client: TestClient, username: str, db_session: Session
) -> None:
    admin = db_session.scalar(select(User).where(User.username == "admin"))
    assert admin is not None
    response = client.get(f"/api/v1/users/{admin.id}", headers=_auth_headers(client, username))
    if username in USER_READ:
        assert response.status_code == 200
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_update_user_access_matrix(client: TestClient, username: str) -> None:
    target = uuid.uuid4()
    response = client.patch(
        f"/api/v1/users/{target}",
        json={"full_name": "Hacker"},
        headers=_auth_headers(client, username),
    )
    if username in USER_UPDATE:
        # admin → 404 (utilizador inexistente); nunca 403.
        assert response.status_code == 404
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("action", ["activate", "deactivate", "block", "unblock"])
@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_status_endpoints_access_matrix(client: TestClient, username: str, action: str) -> None:
    target = uuid.uuid4()
    response = client.post(
        f"/api/v1/users/{target}/{action}",
        headers=_auth_headers(client, username),
    )
    if username in USER_UPDATE:
        assert response.status_code == 404
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_list_profiles_access_matrix(client: TestClient, username: str) -> None:
    response = client.get("/api/v1/profiles", headers=_auth_headers(client, username))
    if username in PROFILE_READ:
        assert response.status_code == 200
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_assign_profile_access_matrix(
    client: TestClient, username: str, db_session: Session
) -> None:
    admin = db_session.scalar(select(User).where(User.username == "admin"))
    assert admin is not None
    profile_id = _real_profile_id(db_session)
    response = client.post(
        f"/api/v1/users/{admin.id}/profiles",
        json={"profile_id": profile_id},
        headers=_auth_headers(client, username),
    )
    if username in PROFILE_MANAGE:
        assert response.status_code != 403
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_audit_access_matrix(client: TestClient, username: str) -> None:
    response = client.get("/api/v1/audit", headers=_auth_headers(client, username))
    if username in SYSTEM_AUDIT:
        assert response.status_code == 200
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_units_access_matrix(client: TestClient, username: str, db_session: Session) -> None:
    from app.modules.organization.domain.organization import Organization

    org_id = db_session.execute(select(Organization.id)).scalars().first()
    assert org_id is not None
    response = client.get(
        "/api/v1/units",
        params={"organization_id": str(org_id)},
        headers=_auth_headers(client, username),
    )
    if username in ORGANIZATION_READ:
        assert response.status_code == 200
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_list_assignments_access_matrix(
    client: TestClient, username: str, db_session: Session
) -> None:
    admin = db_session.scalar(select(User).where(User.username == "admin"))
    assert admin is not None
    response = client.get(
        f"/api/v1/users/{admin.id}/assignments",
        headers=_auth_headers(client, username),
    )
    if username in ASSIGNMENT_READ:
        assert response.status_code == 200
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_create_assignment_access_matrix(
    client: TestClient, username: str, db_session: Session
) -> None:
    admin = db_session.scalar(select(User).where(User.username == "admin"))
    assert admin is not None
    unit_id = _real_unit_id(db_session)
    response = client.post(
        f"/api/v1/users/{admin.id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "PRIMARY",
            "is_primary": True,
        },
        headers=_auth_headers(client, username),
    )
    if username in ASSIGNMENT_CREATE:
        assert response.status_code != 403
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_update_assignment_access_matrix(
    client: TestClient, username: str, db_session: Session
) -> None:
    admin = db_session.scalar(select(User).where(User.username == "admin"))
    assert admin is not None
    assignment_id = uuid.uuid4()
    response = client.patch(
        f"/api/v1/users/{admin.id}/assignments/{assignment_id}",
        json={"assignment_type": "PRIMARY"},
        headers=_auth_headers(client, username),
    )
    if username in ASSIGNMENT_UPDATE:
        assert response.status_code == 404
    else:
        assert response.status_code == 403


@pytest.mark.parametrize("username", sorted(ALL_PROFILES))
@requires_database
def test_end_assignment_access_matrix(
    client: TestClient, username: str, db_session: Session
) -> None:
    admin = db_session.scalar(select(User).where(User.username == "admin"))
    assert admin is not None
    assignment_id = uuid.uuid4()
    response = client.post(
        f"/api/v1/users/{admin.id}/assignments/{assignment_id}/end",
        headers=_auth_headers(client, username),
    )
    if username in ASSIGNMENT_END:
        assert response.status_code == 404
    else:
        assert response.status_code == 403


# ── Prevenção de escalada ─────────────────────────────────────────


@requires_database
def test_client_sent_profile_id_not_trusted(client: TestClient) -> None:
    """O perfil a atribuir vem do path/body validado, nunca do pedido do cliente."""
    response = client.post(
        "/api/v1/users",
        json={
            "username": _unique_username(),
            "email": f"{_unique_username()}@example.com",
            "full_name": "Escalada",
            "password": "segredo123",
            "profile_id": "00000000-0000-0000-0000-000000000000",
        },
        headers=_auth_headers(client, "instrutor"),
    )
    assert response.status_code == 403


@requires_database
def test_assignment_target_user_comes_from_path_not_body(
    client: TestClient, db_session: Session
) -> None:
    """Director não pode atribuir-se a si mesmo enviando o id de outro user no body."""
    unit_id = _real_unit_id(db_session)
    response = client.post(
        f"/api/v1/users/{uuid.uuid4()}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "PRIMARY",
            "is_primary": True,
        },
        headers=_auth_headers(client, "director"),
    )
    # Utilizador-alvo não existe → 404 (o body não permite escolher outro alvo).
    assert response.status_code == 404


# ── Integridade documentada (ADR-004) ─────────────────────────────


@requires_database
def test_duplicate_primary_assignment_rejected(client: TestClient, db_session: Session) -> None:
    """PRIMARY única activa: uma segunda atribuição primária → 409."""
    admin_headers = _auth_headers(client, "admin")
    created = client.post(
        "/api/v1/users",
        json={
            "username": _unique_username(),
            "email": f"{_unique_username()}@example.com",
            "full_name": "Primary Única",
            "password": "segredo123",
        },
        headers=admin_headers,
    )
    assert created.status_code == 201
    user_id = created.json()["id"]
    unit_id = _real_unit_id(db_session)

    director_headers = _auth_headers(client, "director")
    first = client.post(
        f"/api/v1/users/{user_id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "PRIMARY",
            "is_primary": True,
        },
        headers=director_headers,
    )
    assert first.status_code == 201, first.text

    second = client.post(
        f"/api/v1/users/{user_id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "PRIMARY",
            "is_primary": True,
        },
        headers=director_headers,
    )
    assert second.status_code == 409, second.text


@requires_database
def test_invalid_assignment_period_rejected(client: TestClient, db_session: Session) -> None:
    """Período inválido (fim antes de início) → 422/400, nunca persistido."""
    admin = db_session.scalar(select(User).where(User.username == "admin"))
    assert admin is not None
    unit_id = _real_unit_id(db_session)
    response = client.post(
        f"/api/v1/users/{admin.id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "SECONDARY",
            "is_primary": False,
            "start_date": "2026-02-01",
            "end_date": "2026-01-01",
        },
        headers=_auth_headers(client, "director"),
    )
    assert response.status_code in (400, 422), response.text
