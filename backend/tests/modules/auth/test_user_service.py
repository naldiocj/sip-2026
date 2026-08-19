"""Testes do UserService — ciclo de vida do utilizador (TASK-001).

Cobrem: criação com hash de password, actualização, activação,
desactivação, bloqueio, desbloqueio, revogação de sessões e auditoria
(USER_* nunca contém passwords).
"""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from app.modules.auth.application.password import PasswordService
from app.modules.auth.application.user_service import UserNotFoundError, UserService
from app.modules.auth.domain.audit import AuditEventType
from app.modules.auth.domain.session import UserSession
from app.modules.auth.domain.user import User, UserStatus
from sqlalchemy import select
from sqlalchemy.orm import Session
from tests.conftest import requires_database


def _create_test_user(
    db: Session,
    service: UserService,
    actor: User,
    username: str | None = None,
) -> User:
    return service.create(
        username=username or f"svc.user.{uuid.uuid4().hex[:8]}",
        email=f"{uuid.uuid4().hex[:8]}@sip.test",
        full_name="Utilizador de Serviço",
        password="segredo123",
        actor=actor,
    )


def _active_session(db: Session, user: User) -> UserSession:
    session = UserSession(
        user_id=user.id,
        expires_at=datetime.now(UTC) + timedelta(days=1),
    )
    db.add(session)
    db.flush()
    return session


def _audit_events(db: Session, event_type: AuditEventType) -> list:
    from app.modules.auth.domain.audit import AuditEvent

    return list(db.scalars(select(AuditEvent).where(AuditEvent.event_type == str(event_type))))


# ── Create ───────────────────────────────────────────────────────


@requires_database
def test_create_user_hashes_password_and_persists(
    db_session: Session, seeded_user_admin: User
) -> None:
    service = UserService(db_session)
    user = _create_test_user(db_session, service, seeded_user_admin)

    db_session.flush()
    assert user.id is not None
    assert user.password_hash != "segredo123"
    assert PasswordService().verify_password("segredo123", user.password_hash)


@requires_database
def test_create_user_records_audit_without_password(
    db_session: Session, seeded_user_admin: User
) -> None:
    service = UserService(db_session)
    before = len(_audit_events(db_session, AuditEventType.USER_CREATED))
    user = _create_test_user(db_session, service, seeded_user_admin)
    db_session.flush()

    events = _audit_events(db_session, AuditEventType.USER_CREATED)
    assert len(events) == before + 1
    assert str(events[-1].user_id) == str(seeded_user_admin.id)
    details = events[-1].details or {}
    assert details.get("user_id") == str(user.id)
    assert "password" not in str(details).lower()


@requires_database
def test_create_user_rejects_duplicate_username(
    db_session: Session, seeded_user_admin: User
) -> None:
    service = UserService(db_session)
    username = f"dup.{uuid.uuid4().hex[:8]}"
    _create_test_user(db_session, service, seeded_user_admin, username=username)
    with pytest.raises(ValueError):
        _create_test_user(db_session, service, seeded_user_admin, username=username)


# ── Update ───────────────────────────────────────────────────────


@requires_database
def test_update_user_changes_allowed_fields(db_session: Session, seeded_user_admin: User) -> None:
    service = UserService(db_session)
    user = _create_test_user(db_session, service, seeded_user_admin)
    new_email = f"novo.{uuid.uuid4().hex[:8]}@sip.test"
    db_session.flush()

    updated = service.update(
        user.id,
        full_name="Nome Alterado",
        email=new_email,
        employee_number="EMP-42",
        actor=seeded_user_admin,
    )
    db_session.flush()
    assert updated.full_name == "Nome Alterado"
    assert updated.email == new_email
    assert updated.employee_number == "EMP-42"
    assert updated.password_hash == user.password_hash


@requires_database
def test_update_user_records_audit(db_session: Session, seeded_user_admin: User) -> None:
    service = UserService(db_session)
    user = _create_test_user(db_session, service, seeded_user_admin)
    db_session.flush()

    before = len(_audit_events(db_session, AuditEventType.USER_UPDATED))
    service.update(user.id, full_name="Novo Nome", actor=seeded_user_admin)
    db_session.flush()
    assert len(_audit_events(db_session, AuditEventType.USER_UPDATED)) == before + 1


@requires_database
def test_update_unknown_user_raises(db_session: Session, seeded_user_admin: User) -> None:
    service = UserService(db_session)
    with pytest.raises(UserNotFoundError):
        service.update(uuid.uuid4(), full_name="X", actor=seeded_user_admin)


# ── Activate / Deactivate ────────────────────────────────────────


@requires_database
def test_deactivate_sets_inactive_and_revokes_sessions(
    db_session: Session, seeded_user_admin: User
) -> None:
    service = UserService(db_session)
    user = _create_test_user(db_session, service, seeded_user_admin)
    session = _active_session(db_session, user)
    db_session.flush()

    service.deactivate(user.id, actor=seeded_user_admin)
    db_session.flush()

    assert user.status == UserStatus.INACTIVE
    assert user.is_active is False
    assert session.is_revoked


@requires_database
def test_deactivate_rejects_admin_self_deactivation(
    db_session: Session, seeded_user_admin: User
) -> None:
    service = UserService(db_session)
    with pytest.raises(ValueError):
        service.deactivate(seeded_user_admin.id, actor=seeded_user_admin)


@requires_database
def test_activate_restores_active_state(db_session: Session, seeded_user_admin: User) -> None:
    service = UserService(db_session)
    user = _create_test_user(db_session, service, seeded_user_admin)
    service.deactivate(user.id, actor=seeded_user_admin)
    db_session.flush()

    service.activate(user.id, actor=seeded_user_admin)
    db_session.flush()
    assert user.status == UserStatus.ACTIVE
    assert user.is_active is True


@requires_database
def test_status_transitions_record_audit(db_session: Session, seeded_user_admin: User) -> None:
    service = UserService(db_session)
    user = _create_test_user(db_session, service, seeded_user_admin)
    db_session.flush()

    def _delta(event: AuditEventType) -> int:
        return len(_audit_events(db_session, event))

    base_deactivated = _delta(AuditEventType.USER_DEACTIVATED)
    base_activated = _delta(AuditEventType.USER_ACTIVATED)
    base_blocked = _delta(AuditEventType.USER_BLOCKED)
    base_unblocked = _delta(AuditEventType.USER_UNBLOCKED)

    service.deactivate(user.id, actor=seeded_user_admin)
    service.activate(user.id, actor=seeded_user_admin)
    service.block(user.id, actor=seeded_user_admin)
    service.unblock(user.id, actor=seeded_user_admin)
    db_session.flush()

    assert len(_audit_events(db_session, AuditEventType.USER_DEACTIVATED)) == base_deactivated + 1
    assert len(_audit_events(db_session, AuditEventType.USER_ACTIVATED)) == base_activated + 1
    assert len(_audit_events(db_session, AuditEventType.USER_BLOCKED)) == base_blocked + 1
    assert len(_audit_events(db_session, AuditEventType.USER_UNBLOCKED)) == base_unblocked + 1


@requires_database
def test_block_is_distinct_from_deactivate(db_session: Session, seeded_user_admin: User) -> None:
    service = UserService(db_session)
    user = _create_test_user(db_session, service, seeded_user_admin)
    session = _active_session(db_session, user)
    db_session.flush()

    service.block(user.id, actor=seeded_user_admin)
    db_session.flush()

    assert user.status == UserStatus.BLOCKED
    assert session.is_revoked
