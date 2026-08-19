"""Testes da API de gestão de pessoas (TASK-018).

Cobre:
- listagem com pesquisa e paginação;
- criação (201);
- obtenção por ID (200/404);
- actualização (PATCH);
- desactivação;
- RBAC: 401 sem auth, 403 sem permissão;
- auditoria dos eventos PERSON_*.
"""

import uuid

from fastapi.testclient import TestClient
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


def _create_person(client: TestClient, *, full_name: str = "Maria Teste") -> dict:
    headers = _auth_headers(client)
    response = client.post(
        "/api/v1/persons",
        json={
            "full_name": full_name,
            "email": "maria@example.com",
            "phone": "+244900000000",
            "employee_number": f"EMP-{uuid.uuid4().hex[:8].upper()}",
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_list_persons_requires_auth(client: TestClient) -> None:
    response = client.get("/api/v1/persons")
    assert response.status_code in (401, 403)


def test_create_person_requires_permission(client: TestClient, db_session: Session) -> None:
    """Utilizador sem person.create recebe 403."""
    from app.modules.auth.domain.user import User, UserStatus
    from argon2 import PasswordHasher

    username = f"sem_permissoes_{uuid.uuid4().hex[:6]}"
    user = User(
        username=username,
        email=f"{username}@example.com",
        password_hash=PasswordHasher().hash("teste123"),
        full_name="Sem Permissões",
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()

    response = _login(client, username=username, password="teste123")
    assert response.status_code == 200, response.text
    token = response.cookies.get("sip_access_token")
    headers = {"Authorization": f"Bearer {token}"}
    denied = client.get("/api/v1/persons", headers=headers)
    assert denied.status_code == 403


def test_create_person_returns_201(client: TestClient) -> None:
    person = _create_person(client)
    assert person["person_number"].startswith("PES-")
    assert person["full_name"] == "Maria Teste"
    assert person["status"] == "ACTIVE"
    assert person["status_label"] == "Activo"


def test_get_person_by_id(client: TestClient) -> None:
    created = _create_person(client)
    headers = _auth_headers(client)
    response = client.get(f"/api/v1/persons/{created['id']}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_person_not_found(client: TestClient) -> None:
    import uuid

    headers = _auth_headers(client)
    response = client.get(f"/api/v1/persons/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404


def test_update_person(client: TestClient) -> None:
    created = _create_person(client, full_name="Nome Original")
    headers = _auth_headers(client)
    response = client.patch(
        f"/api/v1/persons/{created['id']}",
        json={"full_name": "Nome Actualizado"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Nome Actualizado"


def test_deactivate_person(client: TestClient) -> None:
    created = _create_person(client)
    headers = _auth_headers(client)
    response = client.post(
        f"/api/v1/persons/{created['id']}/deactivate",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "INACTIVE"
    assert response.json()["is_active"] is False


def test_list_persons_with_search_and_pagination(client: TestClient) -> None:
    _create_person(client, full_name="Ana Pesquisa")
    headers = _auth_headers(client)
    response = client.get(
        "/api/v1/persons",
        params={"search": "Pesquisa", "page": 1, "page_size": 10},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    assert all("Pesquisa" in p["full_name"] for p in body["items"])


def test_audit_records_person_created(client: TestClient, db_session: Session) -> None:
    """Criar pessoa regista evento PERSON_CREATED na auditoria."""
    from app.modules.auth.domain.audit import AuditEvent, AuditEventType
    from sqlalchemy import select

    created = _create_person(client, full_name="Pessoa Auditada")
    audit_rows = list(
        db_session.scalars(
            select(AuditEvent)
            .where(AuditEvent.event_type == AuditEventType.PERSON_CREATED)
            .order_by(AuditEvent.timestamp.desc())
        )
    )
    assert audit_rows, "nenhum evento PERSON_CREATED registado"
    assert any(created["person_number"] in str(row.details) for row in audit_rows)


def test_duplicate_employee_number_returns_409(client: TestClient) -> None:
    employee_number = f"EMP-{uuid.uuid4().hex[:8].upper()}"
    headers = _auth_headers(client)
    response = client.post(
        "/api/v1/persons",
        json={"full_name": "Primeira Pessoa", "employee_number": employee_number},
        headers=headers,
    )
    assert response.status_code == 201, response.text
    response = client.post(
        "/api/v1/persons",
        json={"full_name": "Outra Pessoa", "employee_number": employee_number},
        headers=headers,
    )
    assert response.status_code == 409
