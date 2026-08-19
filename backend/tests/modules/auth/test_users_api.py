"""Testes da API de listagem de utilizadores (pickers administrativos)."""

import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from tests.conftest import requires_database


def _auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200, response.text
    token = response.cookies.get("sip_access_token")
    return {"Authorization": f"Bearer {token}"}


@requires_database
def test_list_users_requires_permission(client: TestClient) -> None:
    """Sem autenticação, a listagem de utilizadores é rejeitada."""
    response = client.get("/api/v1/users")
    assert response.status_code == 401


@requires_database
def test_list_users_returns_items(client: TestClient, db_session: Session) -> None:
    """A listagem devolve utilizadores activos com dados seguros."""
    headers = _auth_headers(client)
    response = client.get("/api/v1/users", headers=headers)
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["total"] >= 1
    admin = next(u for u in payload["items"] if u["username"] == "admin")
    assert admin["full_name"]
    assert "password" not in admin
    assert "password_hash" not in admin


@requires_database
def test_list_users_search_filter(client: TestClient) -> None:
    """A pesquisa filtra por username/nome."""
    headers = _auth_headers(client)
    response = client.get("/api/v1/users?search=admin", headers=headers)
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] >= 1
    assert all(
        "admin" in u["username"] or "admin" in (u["full_name"] or "") for u in payload["items"]
    )


@requires_database
def test_get_user_by_id(client: TestClient) -> None:
    """Obtém um utilizador pelo ID; IDs inexistentes devolvem 404."""
    headers = _auth_headers(client)
    listed = client.get("/api/v1/users", headers=headers)
    user_id = listed.json()["items"][0]["id"]

    response = client.get(f"/api/v1/users/{user_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == user_id

    missing = client.get(f"/api/v1/users/{uuid.uuid4()}", headers=headers)
    assert missing.status_code == 404
