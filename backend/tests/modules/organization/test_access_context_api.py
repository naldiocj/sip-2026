"""Testes da API do contexto de acesso (TASK-015).

Cobre GET /api/v1/me/context:
- resposta com dados do utilizador autenticado;
- não expõe segredos;
- estrutura com perfis, permissões, organização e âmbitos.
"""

from fastapi.testclient import TestClient


def _login(client: TestClient, username: str = "admin", password: str = "admin123"):
    """Autentica e devolve a resposta de login."""
    return client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )


def test_me_context_returns_authenticated_user(client: TestClient) -> None:
    login = _login(client)
    assert login.status_code == 200, login.text
    response = client.get("/api/v1/me/context")
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["username"] == "admin"
    assert "profiles" in body
    assert "permissions" in body
    assert "effective_scopes" in body
    assert "humanized_scopes" in body


def test_me_context_requires_auth(client: TestClient) -> None:
    response = client.get("/api/v1/me/context")
    assert response.status_code in (401, 403)


def test_me_context_does_not_expose_secrets(client: TestClient) -> None:
    _login(client)
    response = client.get("/api/v1/me/context")
    assert response.status_code == 200
    text = response.text.lower()
    for secret in ("password", "access_token", "refresh_token", "token_hash"):
        assert secret not in text, f"Segredo exposto: {secret}"


def test_me_context_has_organization_shape(client: TestClient) -> None:
    _login(client)
    response = client.get("/api/v1/me/context")
    assert response.status_code == 200
    body = response.json()
    assert "organization_id" in body
    assert "primary_unit_id" in body
    assert "assignments" in body
    assert "responsibilities" in body
    assert "delegations" in body
