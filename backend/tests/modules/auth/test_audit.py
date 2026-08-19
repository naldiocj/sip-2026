"""Testes da fundação de auditoria de segurança (TASK-007).

Cobrem: modelo e serviço de auditoria, eventos gerados pelo fluxo de
autenticação (login/logout/autorização) e security headers.
"""

import uuid

from app.modules.auth.application.audit import AuditService
from app.modules.auth.application.password import PasswordService
from app.modules.auth.domain.audit import AuditEvent, AuditEventType
from app.modules.auth.domain.user import User, UserStatus
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.conftest import requires_database

pytestmark = requires_database

LOGIN_URL = "/api/v1/auth/login"
LOGOUT_URL = "/api/v1/auth/logout"
ME_URL = "/api/v1/auth/me"


def _events(db: Session) -> list[AuditEvent]:
    return list(db.scalars(select(AuditEvent).order_by(AuditEvent.timestamp)))


def _events_of(db: Session, event_type: AuditEventType) -> list[AuditEvent]:
    return [e for e in _events(db) if e.event_type == event_type]


# ── Modelo / Serviço ───────────────────────────────────────────────


def test_audit_event_model_fields(db_session: Session) -> None:
    service = AuditService(db_session)
    event = service.record(
        AuditEventType.PASSWORD_CHANGED,
        user_id=None,
        ip_address="10.0.0.1",
        user_agent="pytest",
        details={"reason": "expired"},
    )

    assert event.id is not None
    assert event.event_type == AuditEventType.PASSWORD_CHANGED
    assert event.result == "success"
    assert event.timestamp.tzinfo is not None
    assert isinstance(event.details, dict)


def test_audit_event_never_stores_passwords_or_tokens(db_session: Session) -> None:
    service = AuditService(db_session)
    service.record(
        AuditEventType.LOGIN_FAILED,
        details={"username": "alguem", "password": "segredo", "token": "xyz"},
    )
    stored = _events_of(db_session, AuditEventType.LOGIN_FAILED)[-1]
    assert stored.details == {"username": "alguem"}


# ── Eventos do fluxo de autenticação ───────────────────────────────


def test_login_success_records_audit_event(client: TestClient, db_session: Session) -> None:
    client.post(LOGIN_URL, json={"username": "admin", "password": "admin123"})

    events = _events_of(db_session, AuditEventType.LOGIN_SUCCESS)
    assert events
    latest = events[-1]
    assert latest.result == "success"
    assert "session_id" in latest.details


def test_login_failure_records_audit_event(client: TestClient, db_session: Session) -> None:
    client.post(LOGIN_URL, json={"username": "admin", "password": "errada"})

    events = _events_of(db_session, AuditEventType.LOGIN_FAILED)
    assert events
    assert events[-1].result == "failure"
    assert events[-1].details["username"] == "admin"
    assert "password" not in events[-1].details


def test_blocked_account_records_audit_event(client: TestClient, db_session: Session) -> None:
    hasher = PasswordService()
    user = User(
        username=f"audit-blocked-{uuid.uuid4().hex[:8]}",
        email=f"audit-blocked-{uuid.uuid4().hex[:8]}@sip.test",
        password_hash=hasher.hash_password("segredo123"),
        full_name="Audit Blocked",
        status=UserStatus.BLOCKED,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    client.post(LOGIN_URL, json={"username": user.username, "password": "segredo123"})

    events = _events_of(db_session, AuditEventType.ACCOUNT_BLOCKED)
    assert events
    assert events[-1].user_id == user.id


def test_logout_records_logout_and_session_revoked(client: TestClient, db_session: Session) -> None:
    client.post(LOGIN_URL, json={"username": "admin", "password": "admin123"})
    client.post(LOGOUT_URL)

    assert _events_of(db_session, AuditEventType.LOGOUT)
    assert _events_of(db_session, AuditEventType.SESSION_REVOKED)


def test_permission_denied_records_audit_event(client: TestClient, db_session: Session) -> None:
    login = client.post(LOGIN_URL, json={"username": "pgr", "password": "pgr123"})
    token = login.cookies.get("sip_access_token", "")

    from typing import Annotated

    from app.api.errors import register_exception_handlers
    from app.api.v1.router import api_router
    from app.core.config import get_settings
    from app.core.middleware import CorrelationIdMiddleware
    from app.db.session import get_db_session
    from app.modules.auth.api.dependencies import require_permission
    from app.modules.auth.domain.user import User
    from fastapi import Depends, FastAPI

    audit_app = FastAPI()
    register_exception_handlers(audit_app)
    audit_app.add_middleware(CorrelationIdMiddleware, settings=get_settings())
    audit_app.include_router(api_router, prefix="/api/v1")

    @audit_app.get("/__test__/audit-protected")
    def _protected(user: Annotated[User, Depends(require_permission("process.read"))]):
        return {"ok": True}

    def _override_db():
        yield db_session

    audit_app.dependency_overrides[get_db_session] = _override_db
    audit_client = TestClient(audit_app)
    response = audit_client.get(
        "/__test__/audit-protected", headers={"Authorization": f"Bearer {token}"}
    )
    audit_app.dependency_overrides.pop(get_db_session, None)

    assert response.status_code == 403
    events = _events_of(db_session, AuditEventType.PERMISSION_DENIED)
    assert events
    assert events[-1].details["permission"] == "process.read"
    assert events[-1].user_id is not None


# ── Security headers ───────────────────────────────────────────────


def test_security_headers_present_on_api_responses(client: TestClient) -> None:
    response = client.get(ME_URL)

    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "default-src" in response.headers["content-security-policy"]


def test_csp_not_applied_to_docs(client: TestClient) -> None:
    response = client.get("/api/docs")
    assert "content-security-policy" not in response.headers
