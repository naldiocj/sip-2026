"""Matriz de autorização: perfis × permissões nos endpoints (TASK-025).

Cenário 12: operação fora do escopo -> 403.
Ownership: operar na atribuição de outro utilizador -> 404.
"""

import uuid

from app.modules.auth.domain.user import User
from app.modules.organization.domain.unit import OrganizationalUnit
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

SEED_USERS = [
    "admin",
    "director",
    "secretaria",
    "chefe_departamento",
    "chefe_seccao",
    "instrutor",
    "piquete",
    "editor",
    "pgr",
]

PASSWORDS = {
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

# (perfil, método, path, código esperado) — NULL usa o user_id real criado no teste.
MATRIX: list[tuple[str, str, str, int]] = [
    # person.read — todos os perfis têm
    ("admin", "GET", "/api/v1/persons", 200),
    ("director", "GET", "/api/v1/persons", 200),
    ("secretaria", "GET", "/api/v1/persons", 200),
    ("chefe_departamento", "GET", "/api/v1/persons", 200),
    ("chefe_seccao", "GET", "/api/v1/persons", 200),
    ("instrutor", "GET", "/api/v1/persons", 200),
    ("piquete", "GET", "/api/v1/persons", 200),
    ("editor", "GET", "/api/v1/persons", 200),
    ("pgr", "GET", "/api/v1/persons", 200),
    # person.create — apenas admin e secretaria
    ("admin", "POST", "/api/v1/persons", 201),
    ("secretaria", "POST", "/api/v1/persons", 201),
    ("director", "POST", "/api/v1/persons", 403),
    ("chefe_departamento", "POST", "/api/v1/persons", 403),
    ("instrutor", "POST", "/api/v1/persons", 403),
    ("piquete", "POST", "/api/v1/persons", 403),
    ("editor", "POST", "/api/v1/persons", 403),
    ("pgr", "POST", "/api/v1/persons", 403),
    # person.deactivate — apenas admin (nem a secretaria tem)
    ("admin", "POST", "/api/v1/persons/{person_id}/deactivate", 200),
    ("secretaria", "POST", "/api/v1/persons/{person_id}/deactivate", 403),
    # organization.manage — apenas admin
    ("admin", "POST", "/api/v1/organizations", 201),
    ("director", "POST", "/api/v1/organizations", 403),
    ("secretaria", "POST", "/api/v1/organizations", 403),
    ("chefe_departamento", "POST", "/api/v1/organizations", 403),
    ("chefe_seccao", "POST", "/api/v1/organizations", 403),
    ("instrutor", "POST", "/api/v1/organizations", 403),
    ("piquete", "POST", "/api/v1/organizations", 403),
    ("editor", "POST", "/api/v1/organizations", 403),
    ("pgr", "POST", "/api/v1/organizations", 403),
    # organization.read — administração e gestão
    ("admin", "GET", "/api/v1/organizations", 200),
    ("director", "GET", "/api/v1/organizations", 200),
    ("secretaria", "GET", "/api/v1/organizations", 200),
    ("chefe_departamento", "GET", "/api/v1/organizations", 200),
    ("chefe_seccao", "GET", "/api/v1/organizations", 200),
    ("instrutor", "GET", "/api/v1/organizations", 403),
    ("piquete", "GET", "/api/v1/organizations", 403),
    ("editor", "GET", "/api/v1/organizations", 403),
    # responsibility.manage — apenas admin
    ("admin", "POST", "/api/v1/responsibilities", 201),
    ("director", "POST", "/api/v1/responsibilities", 403),
    ("secretaria", "POST", "/api/v1/responsibilities", 403),
    ("chefe_departamento", "POST", "/api/v1/responsibilities", 403),
    # responsibility.read — perfis de gestão
    ("director", "GET", "/api/v1/responsibilities", 200),
    ("secretaria", "GET", "/api/v1/responsibilities", 200),
    ("chefe_departamento", "GET", "/api/v1/responsibilities", 200),
    ("chefe_seccao", "GET", "/api/v1/responsibilities", 200),
    ("instrutor", "GET", "/api/v1/responsibilities", 200),
    ("piquete", "GET", "/api/v1/responsibilities", 403),
    # delegation.manage — apenas admin
    ("admin", "POST", "/api/v1/delegations", 201),
    ("director", "POST", "/api/v1/delegations", 403),
    ("secretaria", "POST", "/api/v1/delegations", 403),
    # delegation.read — perfis de gestão
    ("director", "GET", "/api/v1/delegations", 200),
    ("secretaria", "GET", "/api/v1/delegations", 200),
    ("chefe_departamento", "GET", "/api/v1/delegations", 403),
    ("piquete", "GET", "/api/v1/delegations", 403),
    # assignment.read
    ("director", "GET", "/api/v1/users/{target_user_id}/assignments", 200),
    ("secretaria", "GET", "/api/v1/users/{target_user_id}/assignments", 200),
    ("chefe_departamento", "GET", "/api/v1/users/{target_user_id}/assignments", 200),
    ("chefe_seccao", "GET", "/api/v1/users/{target_user_id}/assignments", 200),
    ("instrutor", "GET", "/api/v1/users/{target_user_id}/assignments", 200),
    ("pgr", "GET", "/api/v1/users/{target_user_id}/assignments", 200),
    ("piquete", "GET", "/api/v1/users/{target_user_id}/assignments", 403),
    # assignment.create
    ("admin", "POST", "/api/v1/users/{target_user_id}/assignments", 201),
    ("director", "POST", "/api/v1/users/{target_user_id}/assignments", 201),
    ("secretaria", "POST", "/api/v1/users/{target_user_id}/assignments", 201),
    ("chefe_departamento", "POST", "/api/v1/users/{target_user_id}/assignments", 403),
]


def _login(client: TestClient, username: str) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": PASSWORDS[username]},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.cookies.get('sip_access_token')}"}


def _find_user(db_session: Session, username: str) -> User:
    user = db_session.scalar(select(User).where(User.username == username))
    assert user is not None, f"user {username} não existe no seed"
    return user


def test_authorization_matrix(client: TestClient, db_session: Session) -> None:
    """Cenários 1-12: cada perfil tem exatamente o acesso esperado."""
    target = _find_user(db_session, "secretaria")
    person_id = None
    unit = db_session.scalar(select(OrganizationalUnit).limit(1))
    assert unit is not None

    for username, method, raw_path, expected in MATRIX:
        path = raw_path
        if "{target_user_id}" in raw_path:
            path = raw_path.replace("{target_user_id}", str(target.id))
        if "{person_id}" in raw_path:
            assert person_id is not None, "person_id ainda não criado"
            path = raw_path.replace("{person_id}", person_id)

        headers = _login(client, username)
        body: dict[str, object] = {}
        if method == "POST" and path.endswith("/assignments") and "/users/" in path:
            body = {
                "organizational_unit_id": str(unit.id),
                "assignment_type": "SECONDARY",
                "is_primary": False,
            }
        if method == "POST" and path == "/api/v1/persons":
            body = {
                "full_name": f"Matriz {username} {uuid.uuid4().hex[:6]}",
                "email": f"matriz_{uuid.uuid4().hex[:6]}@example.com",
            }
        if method == "POST" and path == "/api/v1/organizations":
            body = {
                "code": f"MAT-{uuid.uuid4().hex[:6].upper()}",
                "name": "Matriz",
            }
        if method == "POST" and path == "/api/v1/responsibilities":
            body = {"user_id": str(target.id), "scope": "PROCESS_MANAGEMENT"}
        if method == "POST" and path == "/api/v1/delegations":
            body = {
                "delegator_user_id": str(target.id),
                "delegate_user_id": str(_find_user(db_session, "instrutor").id),
                "scope": "PROCESS_MANAGEMENT",
            }
        if method == "POST" and path.endswith("/deactivate"):
            body = {}

        response = client.request(method, path, json=body, headers=headers)
        assert response.status_code == expected, (
            f"{username} {method} {path}: esperado {expected}, obtido "
            f"{response.status_code} ({response.text[:120]})"
        )
        if method == "POST" and path == "/api/v1/persons" and response.status_code == 201:
            person_id = response.json()["id"]


def test_assignment_ownership_other_user_404(client: TestClient, db_session: Session) -> None:
    """Ownership: terminar atribuição de OUTRO utilizador -> 404 (não 403/200)."""
    from app.modules.organization.domain.user_assignment import (
        AssignmentStatus,
        AssignmentType,
        UserAssignment,
    )

    owner = _find_user(db_session, "instrutor")
    other = _find_user(db_session, "director")
    unit = db_session.scalar(select(OrganizationalUnit).limit(1))
    assert unit is not None

    assignment = UserAssignment(
        user_id=owner.id,
        organizational_unit_id=unit.id,
        assignment_type=AssignmentType.PRIMARY,
        is_primary=True,
        status=AssignmentStatus.ACTIVE,
    )
    db_session.add(assignment)
    db_session.flush()

    headers = _login(client, "admin")
    # user_id no path é o 'director', mas a atribuição pertence ao 'instrutor'
    response = client.post(
        f"/api/v1/users/{other.id}/assignments/{assignment.id}/end",
        headers=headers,
    )
    assert response.status_code == 404

    # a atribuição permanece intacta
    assert assignment.status == AssignmentStatus.ACTIVE


def test_assignment_end_requires_permission(client: TestClient, db_session: Session) -> None:
    """Cenário 12: director não tem assignment.end -> 403."""
    target = _find_user(db_session, "instrutor")
    unit = db_session.scalar(select(OrganizationalUnit).limit(1))
    assert unit is not None

    from app.modules.organization.domain.user_assignment import (
        AssignmentStatus,
        AssignmentType,
        UserAssignment,
    )

    assignment = UserAssignment(
        user_id=target.id,
        organizational_unit_id=unit.id,
        assignment_type=AssignmentType.SECONDARY,
        is_primary=False,
        status=AssignmentStatus.ACTIVE,
    )
    db_session.add(assignment)
    db_session.flush()

    headers = _login(client, "director")
    response = client.post(
        f"/api/v1/users/{target.id}/assignments/{assignment.id}/end",
        headers=headers,
    )
    assert response.status_code == 403
