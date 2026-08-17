"""Testes de integração da API de autenticação (TASK-003).

Cobrem: login válido/inválido, estados de conta, tokens inválidos/
expirados, endpoints protegidos, /me, logout, sessão e rate limiting.
"""

import uuid
from datetime import UTC, datetime, timedelta

import jwt
import pytest
from app.core.config import get_settings
from app.modules.auth.application.password import PasswordService
from app.modules.auth.domain.session import UserSession
from app.modules.auth.domain.user import User, UserStatus
from app.shared.cache import ping_redis
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.modules.auth.conftest import requires_database

ADMIN_CREDENTIALS = {"username": "admin", "password": "admin123"}
LOGIN_URL = "/api/v1/auth/login"
LOGOUT_URL = "/api/v1/auth/logout"
ME_URL = "/api/v1/auth/me"


def _login(client: TestClient, username: str = "admin", password: str = "admin123"):
    return client.post(LOGIN_URL, json={"username": username, "password": password})


def _expired_token() -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": str(uuid.uuid4()),
        "sid": str(uuid.uuid4()),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": now - timedelta(hours=2),
        "exp": now - timedelta(minutes=30),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


# ── Login ─────────────────────────────────────────────────────────


@requires_database
def test_login_valid_returns_token_and_user(client: TestClient) -> None:
    response = _login(client)

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["username"] == "admin"
    assert body["user"]["profiles"][0]["code"] == "ADMINISTRADOR_SISTEMA"
    assert "password" not in body
    assert "password_hash" not in body


@requires_database
def test_login_sets_httponly_cookie(client: TestClient) -> None:
    response = _login(client)

    cookie_header = response.headers.get("set-cookie", "")
    assert "sip_access_token=" in cookie_header
    assert "HttpOnly" in cookie_header
    assert "SameSite=lax" in cookie_header


@requires_database
def test_login_invalid_password_returns_generic_401(client: TestClient) -> None:
    response = _login(client, password="password-errada")

    assert response.status_code == 401
    assert response.json()["message"] == "Invalid credentials"


@requires_database
def test_login_unknown_username_returns_same_generic_error(client: TestClient) -> None:
    response = _login(client, username="utilizador-inexistente")

    assert response.status_code == 401
    assert response.json()["message"] == "Invalid credentials"


@requires_database
def test_login_blocked_user_returns_403(client: TestClient, db_session: Session) -> None:
    hasher = PasswordService()
    user = User(
        username=f"bloqueado-{uuid.uuid4().hex[:8]}",
        email=f"bloqueado-{uuid.uuid4().hex[:8]}@sip.test",
        password_hash=hasher.hash_password("segredo123"),
        full_name="Utilizador Bloqueado",
        status=UserStatus.BLOCKED,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(LOGIN_URL, json={"username": user.username, "password": "segredo123"})

    assert response.status_code == 403
    assert response.json()["message"] == "Account blocked"


@requires_database
def test_login_inactive_user_returns_403(client: TestClient, db_session: Session) -> None:
    hasher = PasswordService()
    user = User(
        username=f"inactivo-{uuid.uuid4().hex[:8]}",
        email=f"inactivo-{uuid.uuid4().hex[:8]}@sip.test",
        password_hash=hasher.hash_password("segredo123"),
        full_name="Utilizador Inactivo",
        status=UserStatus.INACTIVE,
        is_active=False,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(LOGIN_URL, json={"username": user.username, "password": "segredo123"})

    assert response.status_code == 403
    assert response.json()["message"] == "Account not active"


@requires_database
def test_login_pending_user_returns_403(client: TestClient, db_session: Session) -> None:
    hasher = PasswordService()
    user = User(
        username=f"pendente-{uuid.uuid4().hex[:8]}",
        email=f"pendente-{uuid.uuid4().hex[:8]}@sip.test",
        password_hash=hasher.hash_password("segredo123"),
        full_name="Utilizador Pendente",
        status=UserStatus.PENDING,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(LOGIN_URL, json={"username": user.username, "password": "segredo123"})

    assert response.status_code == 403
    assert response.json()["message"] == "Account not active"


@requires_database
def test_login_creates_session_row(client: TestClient, db_session: Session) -> None:
    response = _login(client)
    assert response.status_code == 200

    sessions = db_session.scalars(select(UserSession)).all()
    active = [s for s in sessions if not s.is_revoked]
    assert active
    assert active[-1].expires_at > datetime.now(UTC)


# ── /me ───────────────────────────────────────────────────────────


@requires_database
def test_me_returns_safe_user_data(client: TestClient) -> None:
    _login(client)
    response = client.get(ME_URL)

    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "admin"
    assert body["full_name"]
    assert body["status"] == "ACTIVE"
    assert body["status_label"] == "Ativo"
    assert "password" not in body
    assert "password_hash" not in body
    assert "ADMINISTRADOR_SISTEMA" in {p["code"] for p in body["profiles"]}
    assert "process.read" in body["permissions"]
    assert "system.admin" in body["permissions"]
    assert body["organization_scope"] == []


@requires_database
def test_me_uses_httponly_cookie(client: TestClient) -> None:
    _login(client)
    response = client.get(ME_URL)  # sem header Authorization

    assert response.status_code == 200
    assert response.json()["username"] == "admin"


@requires_database
def test_me_without_authentication_returns_401(client: TestClient) -> None:
    response = client.get(ME_URL)

    assert response.status_code == 401


@requires_database
def test_protected_endpoint_with_invalid_token_returns_401(client: TestClient) -> None:
    response = client.get(ME_URL, headers={"Authorization": "Bearer token-invalido"})

    assert response.status_code == 401


@requires_database
def test_protected_endpoint_with_expired_token_returns_401(client: TestClient) -> None:
    response = client.get(ME_URL, headers={"Authorization": f"Bearer {_expired_token()}"})

    assert response.status_code == 401


@requires_database
def test_me_returns_instructor_permissions(client: TestClient) -> None:
    _login(client, username="instrutor", password="instrutor123")
    body = client.get(ME_URL).json()

    assert {p["code"] for p in body["profiles"]} == {"INSTRUTOR_PROCESSUAL"}
    assert "process.read" in body["permissions"]
    assert "system.admin" not in body["permissions"]
    assert "user.manage" not in body["permissions"]


# ── Logout / Sessão ───────────────────────────────────────────────


@requires_database
def test_logout_revokes_session(client: TestClient, db_session: Session) -> None:
    login_response = _login(client)
    token = login_response.json()["access_token"]

    logout_response = client.post(LOGOUT_URL)
    assert logout_response.status_code == 200

    session_row = db_session.scalar(select(UserSession).order_by(UserSession.created_at.desc()))
    assert session_row is not None
    assert session_row.is_revoked

    me_response = client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 401
    assert me_response.json()["message"] == "Session revoked"


@requires_database
def test_logout_without_authentication_returns_401(client: TestClient) -> None:
    response = client.post(LOGOUT_URL)
    assert response.status_code == 401


# ── Rate limiting ─────────────────────────────────────────────────


@requires_database
def test_login_rate_limited_after_limit(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    if not ping_redis():
        pytest.skip("Redis indisponível")
    settings = get_settings()
    monkeypatch.setattr(settings, "rate_limit_enabled", True)
    monkeypatch.setattr(settings, "login_rate_limit_attempts", 10)

    from app.shared.cache import get_redis

    redis = get_redis()
    redis.delete("rl:login:ip:testclient")
    unique_username = f"rl-{uuid.uuid4().hex[:8]}"
    unique_key = f"rl:login:user:{unique_username}"
    redis.delete(unique_key)
    try:
        for _ in range(10):
            response = _login(client, username=unique_username, password="errada")
            assert response.status_code == 401

        response = _login(client, username=unique_username, password="errada")
        assert response.status_code == 429
        assert "Too many login attempts" in response.json()["message"]
    finally:
        redis.delete(unique_key)
        redis.delete("rl:login:ip:testclient")
