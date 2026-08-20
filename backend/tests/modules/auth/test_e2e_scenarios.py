"""Cenários E2E (E2E-001..005) ao nível de integração API (TASK-013).

O projecto não tem infraestrutura Playwright; os cenários de fim-a-fim do
prompt são cobertos por testes de integração pytest contra a API real
(complementados pelos testes de componente vitest da UI).

Cenários:
- E2E-001: criar utilizador com perfil + contexto organizacional completo
  (atribuição principal) → sucesso.
- E2E-002: adicionar segunda atribuição secundária.
- E2E-003: alterar atribuição principal → a anterior deixa de ser principal.
- E2E-004: utilizador não autorizado → 403.
- E2E-005: GET /me/context devolve o contexto correcto.
"""

import uuid

from app.modules.auth.domain.user import User
from app.modules.organization.domain.unit import OrganizationalUnit
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.conftest import requires_database


def _login(client: TestClient, username: str, password: str) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200, response.text
    token = response.cookies.get("sip_access_token")
    assert token
    return {"Authorization": f"Bearer {token}"}


def _unique_username(prefix: str = "e2e") -> str:
    return f"{prefix}.{uuid.uuid4().hex[:8]}"


def _real_unit_id(db: Session) -> str:
    unit = (
        db.execute(
            select(OrganizationalUnit.id).where(OrganizationalUnit.is_active.is_(True))
        )
        .scalars()
        .first()
    )
    assert unit is not None
    return str(unit)


def _real_profile_id(db: Session, code: str = "DIRECTOR") -> str:
    from app.modules.auth.domain.profile import Profile

    profile = db.execute(select(Profile.id).where(Profile.code == code)).scalars().first()
    assert profile is not None
    return str(profile)


@requires_database
def test_e2e_001_create_user_with_profile_and_full_context(
    client: TestClient, db_session: Session
) -> None:
    """E2E-001: criar utilizador com perfil + contexto completo + principal."""
    admin_headers = _login(client, "admin", "admin123")
    username = _unique_username()
    password = "segredo123"
    created = client.post(
        "/api/v1/users",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "full_name": "E2E Utilizador Completo",
            "password": password,
        },
        headers=admin_headers,
    )
    assert created.status_code == 201, created.text
    user_id = created.json()["id"]

    profile_id = _real_profile_id(db_session, "DIRECTOR")
    assigned = client.post(
        f"/api/v1/users/{user_id}/profiles",
        json={"profile_id": profile_id},
        headers=admin_headers,
    )
    assert assigned.status_code == 201, assigned.text

    unit_id = _real_unit_id(db_session)
    primary = client.post(
        f"/api/v1/users/{user_id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "PRIMARY",
            "is_primary": True,
        },
        headers=admin_headers,
    )
    assert primary.status_code == 201, primary.text

    detail = client.get(f"/api/v1/users/{user_id}", headers=admin_headers)
    assert detail.status_code == 200
    body = detail.json()
    assert any(p["code"] == "DIRECTOR" for p in body["profiles"])
    assert body["primary_assignment"] is not None
    assert body["primary_assignment"]["unit_id"] == unit_id
    assert body["primary_assignment"]["is_primary"] is True
    assert body["primary_assignment"]["unit_path"], "path hierárquico presente"


@requires_database
def test_e2e_002_add_secondary_assignment(
    client: TestClient, db_session: Session
) -> None:
    """E2E-002: adicionar segunda atribuição (secundária)."""
    admin_headers = _login(client, "admin", "admin123")
    user_id = str(created_user_id(client, admin_headers))

    unit_id = _real_unit_id(db_session)
    first = client.post(
        f"/api/v1/users/{user_id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "PRIMARY",
            "is_primary": True,
        },
        headers=admin_headers,
    )
    assert first.status_code == 201, first.text

    second = client.post(
        f"/api/v1/users/{user_id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "SECONDARY",
            "is_primary": False,
        },
        headers=admin_headers,
    )
    assert second.status_code == 201, second.text

    assignments = client.get(
        f"/api/v1/users/{user_id}/assignments", headers=admin_headers
    )
    assert assignments.status_code == 200
    items = assignments.json()
    assert len(items) == 2
    assert sum(1 for a in items if a["is_primary"]) == 1, "só uma principal"
    assert sum(1 for a in items if a["assignment_type"] == "SECONDARY") == 1


@requires_database
def test_e2e_003_change_primary_assignment_demotes_previous(
    client: TestClient, db_session: Session
) -> None:
    """E2E-003: promover a secundária a principal despromove a anterior."""
    admin_headers = _login(client, "admin", "admin123")
    user_id = str(created_user_id(client, admin_headers))
    unit_id = _real_unit_id(db_session)

    first = client.post(
        f"/api/v1/users/{user_id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "PRIMARY",
            "is_primary": True,
        },
        headers=admin_headers,
    )
    assert first.status_code == 201, first.text
    first_id = first.json()["id"]

    second = client.post(
        f"/api/v1/users/{user_id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "SECONDARY",
            "is_primary": False,
        },
        headers=admin_headers,
    )
    assert second.status_code == 201, second.text
    second_id = second.json()["id"]

    demote = client.patch(
        f"/api/v1/users/{user_id}/assignments/{first_id}",
        json={"is_primary": False},
        headers=admin_headers,
    )
    assert demote.status_code == 200, demote.text

    promote = client.patch(
        f"/api/v1/users/{user_id}/assignments/{second_id}",
        json={"is_primary": True},
        headers=admin_headers,
    )
    assert promote.status_code == 200, promote.text

    assignments = client.get(
        f"/api/v1/users/{user_id}/assignments", headers=admin_headers
    ).json()
    by_id = {a["id"]: a for a in assignments}
    assert by_id[first_id]["is_primary"] is False, "anterior deixou de ser principal"
    assert by_id[second_id]["is_primary"] is True, "nova principal activa"

    detail = client.get(f"/api/v1/users/{user_id}", headers=admin_headers).json()
    assert detail["primary_assignment"]["id"] == second_id


@requires_database
def test_e2e_004_unauthorized_gets_403(
    client: TestClient, db_session: Session
) -> None:
    """E2E-004: utilizador não autorizado → 403 em todas as acções de gestão."""
    chefe_headers = _login(client, "chefe_departamento", "chefe123")
    admin_headers = _login(client, "admin", "admin123")
    user_id = str(created_user_id(client, admin_headers))
    unit_id = _real_unit_id(db_session)

    forbidden = [
        ("post", "/api/v1/users", {"username": _unique_username(), "email": "x@example.com", "full_name": "X", "password": "segredo123"}),
        ("post", f"/api/v1/users/{user_id}/assignments", {"organizational_unit_id": unit_id, "assignment_type": "SECONDARY", "is_primary": False}),
        ("post", f"/api/v1/users/{user_id}/deactivate", None),
        ("post", f"/api/v1/users/{user_id}/profiles", {"profile_id": _real_profile_id(db_session)}),
        ("get", "/api/v1/audit", None),
    ]
    for method, path, payload in forbidden:
        if payload is None:
            response = getattr(client, method)(path, headers=chefe_headers)
        else:
            response = getattr(client, method)(path, json=payload, headers=chefe_headers)
        assert response.status_code == 403, f"{method} {path} → {response.status_code}"


@requires_database
def test_e2e_005_me_context_returns_correct_context(
    client: TestClient, db_session: Session
) -> None:
    """E2E-005: GET /me/context devolve o contexto completo do utilizador."""
    admin_headers = _login(client, "admin", "admin123")
    username = _unique_username()
    password = "segredo123"
    created = client.post(
        "/api/v1/users",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "full_name": "E2E Contexto",
            "password": password,
        },
        headers=admin_headers,
    )
    assert created.status_code == 201
    user_id = created.json()["id"]

    profile_id = _real_profile_id(db_session, "DIRECTOR")
    client.post(
        f"/api/v1/users/{user_id}/profiles",
        json={"profile_id": profile_id},
        headers=admin_headers,
    )
    unit_id = _real_unit_id(db_session)
    client.post(
        f"/api/v1/users/{user_id}/assignments",
        json={
            "organizational_unit_id": unit_id,
            "assignment_type": "PRIMARY",
            "is_primary": True,
        },
        headers=admin_headers,
    )
    activated = client.post(f"/api/v1/users/{user_id}/activate", headers=admin_headers)
    assert activated.status_code == 200, activated.text

    user_headers = _login(client, username, password)
    context = client.get("/api/v1/me/context", headers=user_headers)
    assert context.status_code == 200, context.text
    body = context.json()
    assert body["username"] == username
    assert "DIRECTOR" in body["profiles"]
    assert "user.read" in body["permissions"]
    assert body["primary_unit_id"] == unit_id
    assert body["assignments"], "atribuições presentes"
    assert any(a["is_primary"] for a in body["assignments"])
    assert body["organization_id"], "organização presente"


def created_user_id(client: TestClient, admin_headers: dict[str, str]) -> str:
    """Cria um utilizador E2E e devolve o id (usado pelos cenários 002/003/004)."""
    username = _unique_username()
    response = client.post(
        "/api/v1/users",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "full_name": "E2E Utilizador",
            "password": "segredo123",
        },
        headers=admin_headers,
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]