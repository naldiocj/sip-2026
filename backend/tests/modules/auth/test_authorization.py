"""Testes do motor de autorização (TASK-004)."""

from typing import Annotated

import pytest
from app.api.errors import register_exception_handlers
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.middleware import CorrelationIdMiddleware
from app.db.session import get_db_session
from app.modules.auth.api.dependencies import require_permission, require_profile
from app.modules.auth.application.authorization import AuthorizationService
from app.modules.auth.domain.user import User
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.modules.auth.conftest import requires_database

pytestmark = requires_database


def _get_user(db: Session, username: str) -> User:
    return db.scalar(select(User).where(User.username == username))


def test_get_user_permissions_returns_union_sorted(db_session: Session) -> None:
    admin = _get_user(db_session, "admin")
    service = AuthorizationService(db_session)
    permissions = service.get_user_permissions(admin)
    assert permissions == sorted(set(permissions))
    assert "process.read" in permissions
    assert "process.delete" in permissions


def test_check_permission_granted(db_session: Session) -> None:
    admin = _get_user(db_session, "admin")
    service = AuthorizationService(db_session)
    assert service.check_permission(admin, "process.read")
    assert service.check_permission(admin, "process.delete")


def test_check_permission_denied_for_profile_without_it(db_session: Session) -> None:
    pgr = _get_user(db_session, "pgr")
    service = AuthorizationService(db_session)
    assert not service.check_permission(pgr, "process.read")
    assert service.check_permission(pgr, "pgr.read")


def test_check_permission_denied_for_unknown_permission(db_session: Session) -> None:
    admin = _get_user(db_session, "admin")
    service = AuthorizationService(db_session)
    assert not service.check_permission(admin, "nonexistent.permission")


def test_check_profile_granted_and_denied(db_session: Session) -> None:
    director = _get_user(db_session, "director")
    piquete = _get_user(db_session, "piquete")
    service = AuthorizationService(db_session)
    assert service.check_profile(director, "DIRECTOR")
    assert not service.check_profile(piquete, "DIRECTOR")
    assert service.check_profile(piquete, "AGENTE_PIQUETE")


def test_profile_isolation_between_director_and_instructor(db_session: Session) -> None:
    """Um perfil não recebe permissões de outro sem configuração.

    O instrutor possui process.read (com scope OWN/ASSIGNED a aprofundar
    na SPRINT-02), mas NÃO permissões de outros perfis (pgr, piquete,
    sistema, organização).
    """
    director = _get_user(db_session, "director")
    instrutor = _get_user(db_session, "instrutor")
    service = AuthorizationService(db_session)
    assert service.check_permission(director, "process.read")
    assert service.check_permission(instrutor, "process.read")
    assert not service.check_permission(instrutor, "pgr.read")
    assert not service.check_permission(instrutor, "piquete.read")
    assert not service.check_permission(instrutor, "system.admin")
    assert not service.check_permission(instrutor, "organization.manage")
    assert not service.check_permission(director, "pgr.read")
    assert not service.check_permission(director, "piquete.read")
    assert service.check_permission(instrutor, "process.create")


# --- Dependências FastAPI end-to-end (401/403/200) ---

_test_app = FastAPI()
register_exception_handlers(_test_app)
_test_app.add_middleware(CorrelationIdMiddleware, settings=get_settings())
_test_app.include_router(api_router, prefix="/api/v1")


@_test_app.get("/__test__/permission-protected")
def _permission_protected(
    user: Annotated[User, Depends(require_permission("process.read"))],
) -> dict[str, str]:
    return {"username": user.username}


@_test_app.get("/__test__/profile-protected")
def _profile_protected(
    user: Annotated[User, Depends(require_profile("DIRECTOR"))],
) -> dict[str, str]:
    return {"username": user.username}


@pytest.fixture()
def auth_client(db_session: Session, monkeypatch) -> TestClient:
    """TestClient dedicado (app próprio) com DB de teste e sem rate limit."""
    monkeypatch.setattr(get_settings(), "rate_limit_enabled", False)

    def _override_db():
        yield db_session

    _test_app.dependency_overrides[get_db_session] = _override_db
    client = TestClient(_test_app)
    yield client
    _test_app.dependency_overrides.pop(get_db_session, None)
    monkeypatch.undo()


def _login(client: TestClient, username: str, password: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200
    return response.cookies.get("sip_access_token", "")


def test_require_permission_allows_with_permission(auth_client: TestClient) -> None:
    token = _login(auth_client, "admin", "admin123")
    response = auth_client.get(
        "/__test__/permission-protected",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json() == {"username": "admin"}


def test_require_permission_denies_without_permission(auth_client: TestClient) -> None:
    token = _login(auth_client, "pgr", "pgr123")
    response = auth_client.get(
        "/__test__/permission-protected",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert response.json()["message"] == "Permission denied"


def test_require_permission_requires_authentication(auth_client: TestClient) -> None:
    response = auth_client.get("/__test__/permission-protected")
    assert response.status_code == 401


def test_require_profile_allows_matching_profile(auth_client: TestClient) -> None:
    token = _login(auth_client, "director", "director123")
    response = auth_client.get(
        "/__test__/profile-protected",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json() == {"username": "director"}


def test_require_profile_denies_other_profile(auth_client: TestClient) -> None:
    token = _login(auth_client, "piquete", "piquete123")
    response = auth_client.get(
        "/__test__/profile-protected",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert response.json()["message"] == "Profile required"
