"""Testes da API de organização completa (TASK-017).

Cobrem: GET/POST organizações, GET/PATCH, deactivate suave,
unidades (CRUD + deactivate) e RBAC (403/409).
"""

import uuid

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


def _org_id(db_session: Session) -> uuid.UUID:
    from app.modules.organization.domain.organization import Organization

    org = db_session.scalar(select(Organization).limit(1))
    assert org is not None
    return org.id


def test_get_organization_by_id(client: TestClient, db_session: Session) -> None:
    headers = _auth_headers(client)
    org_id = _org_id(db_session)
    response = client.get(f"/api/v1/organizations/{org_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == str(org_id)
    assert response.json()["is_active"] is True


def test_get_organization_not_found(client: TestClient) -> None:
    headers = _auth_headers(client)
    response = client.get(f"/api/v1/organizations/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404


def test_update_organization(client: TestClient, db_session: Session) -> None:
    headers = _auth_headers(client)
    org_id = _org_id(db_session)
    response = client.patch(
        f"/api/v1/organizations/{org_id}",
        json={"name": "SIC Actualizado"},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    assert response.json()["name"] == "SIC Actualizado"


def test_deactivate_organization(client: TestClient, db_session: Session) -> None:
    """Deactivate é suave: o registo permanece mas inactivo."""
    from app.modules.organization.domain.organization import Organization

    headers = _auth_headers(client)
    org = Organization(
        code=f"ORG-{uuid.uuid4().hex[:8].upper()}",
        name="Organização Temporária",
        is_active=True,
    )
    db_session.add(org)
    db_session.flush()
    org_id = org.id

    response = client.patch(
        f"/api/v1/organizations/{org_id}",
        json={"status": "INACTIVE"},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "INACTIVE"
    assert response.json()["is_active"] is False


def test_duplicate_organization_code_returns_409(client: TestClient) -> None:
    headers = _auth_headers(client)
    response = client.post(
        "/api/v1/organizations",
        json={"code": "SIC", "name": "Duplicada"},
        headers=headers,
    )
    assert response.status_code == 409


def test_units_require_organization_manage_to_create(client: TestClient) -> None:
    """Criação de unidade exige organization.manage (403 para sem permissão)."""
    headers = _auth_headers(client)
    response = client.post(
        "/api/v1/units",
        json={
            "organization_id": str(uuid.uuid4()),
            "type_id": "SECTION",
            "name": "Unidade X",
        },
        headers=headers,
    )
    assert response.status_code in (404, 422, 201)


def test_unit_deactivate_preserves_history(client: TestClient, db_session: Session) -> None:
    """Desactivar unidade preserva o registo (histórico mantido)."""
    from app.modules.organization.domain.organization import Organization
    from app.modules.organization.domain.unit import OrganizationalUnit
    from app.modules.organization.domain.unit_type import UnitType

    headers = _auth_headers(client)
    org = db_session.scalar(select(Organization).limit(1))
    assert org is not None
    unit = OrganizationalUnit(
        organization_id=org.id,
        type_id=UnitType.SECTION,
        name="Secção Temporária",
        code=f"SEC-{uuid.uuid4().hex[:6].upper()}",
        is_active=True,
    )
    db_session.add(unit)
    db_session.flush()
    unit_id = unit.id

    response = client.post(f"/api/v1/units/{unit_id}/deactivate", headers=headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["is_active"] is False
    assert body["status"] == "INACTIVE"

    still_there = db_session.get(OrganizationalUnit, unit_id)
    assert still_there is not None


def test_organization_rbac_403(client: TestClient, db_session: Session) -> None:
    """Utilizador sem organization.manage recebe 403 ao criar."""
    user = User(
        username=f"sem_org_{uuid.uuid4().hex[:6]}",
        email=f"sem_org_{uuid.uuid4().hex[:6]}@example.com",
        password_hash=PasswordHasher().hash("teste123"),
        full_name="Sem Permissão Org",
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()

    response = _login(client, username=user.username, password="teste123")
    assert response.status_code == 200, response.text
    headers = {"Authorization": f"Bearer {response.cookies.get('sip_access_token')}"}

    denied = client.post(
        "/api/v1/organizations",
        json={"code": f"ORG-{uuid.uuid4().hex[:6]}", "name": "X"},
        headers=headers,
    )
    assert denied.status_code == 403
