"""Testes dos modelos do domínio de autenticação (TASK-001)."""

import uuid
from datetime import UTC, datetime

from app.modules.auth.domain import (
    PROFILE_LABELS,
    USER_STATUS_LABELS,
    humanize_enum,
    humanize_permission,
    humanize_profile,
    humanize_user_status,
    profile_permissions,
    user_profiles,
)
from app.modules.auth.domain.permission import Permission
from app.modules.auth.domain.permissions import PermissionConstants
from app.modules.auth.domain.profile import Profile, ProfileEnum
from app.modules.auth.domain.scope import OrganizationScope
from app.modules.auth.domain.session import UserSession
from app.modules.auth.domain.user import User, UserStatus


def test_user_status_enum_values() -> None:
    assert [s.value for s in UserStatus] == ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"]


def test_profile_enum_values() -> None:
    expected = [
        "ADMINISTRADOR_SISTEMA",
        "DIRECTOR",
        "SECRETARIA_GERAL",
        "CHEFE_DEPARTAMENTO",
        "CHEFE_SECCAO",
        "INSTRUTOR_PROCESSUAL",
        "AGENTE_PIQUETE",
        "EDITOR_DOCUMENTAL",
        "AGENTE_PGR",
    ]
    assert [p.value for p in ProfileEnum] == expected


def test_organization_scope_values() -> None:
    expected = [
        "GLOBAL",
        "ORGANIZATION",
        "DIRECTION",
        "DEPARTMENT",
        "SECTION",
        "OWN",
        "ASSIGNED",
        "PGR",
        "PIQUETE",
    ]
    assert [s.value for s in OrganizationScope] == expected


def test_user_instantiation() -> None:
    user = User(
        id=uuid.uuid4(),
        username="admin",
        email="admin@sip.test",
        password_hash="hashed-value",
        full_name="Administrador do Sistema",
        employee_number="0001",
        status=UserStatus.ACTIVE,
        is_active=True,
    )

    assert user.username == "admin"
    assert user.email == "admin@sip.test"
    assert user.password_hash == "hashed-value"
    assert user.status == UserStatus.ACTIVE
    assert user.is_active is True
    assert user.created_at is None  # server default aplicado pela BD


def test_profile_instantiation_and_label() -> None:
    profile = Profile(
        code=ProfileEnum.CHEFE_SECCAO,
        name="Chefe de Secção",
        description="Coordena uma secção",
        is_active=True,
    )

    assert profile.code == ProfileEnum.CHEFE_SECCAO
    assert profile.label == "Chefe de Secção"
    assert profile.is_active is True


def test_permission_instantiation() -> None:
    permission = Permission(
        code=PermissionConstants.PROCESS_READ,
        resource="process",
        action="read",
        description="Consultar processos",
        is_active=True,
    )

    assert permission.code == "process.read"
    assert permission.resource == "process"
    assert permission.action == "read"


def test_user_session_instantiation_and_revocation() -> None:
    session = UserSession(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        expires_at=datetime.now(UTC),
        ip_address="127.0.0.1",
        user_agent="pytest",
    )

    assert session.is_revoked is False
    session.revoke()
    assert session.is_revoked is True
    assert session.revoked_at is not None
    assert session.revoked_at.tzinfo is not None
    session.revoke()  # idempotente


def test_association_tables_registered() -> None:
    assert "user_profiles" in user_profiles.name
    assert "profile_permissions" in profile_permissions.name
    assert "user_profiles" in User.__mapper__.relationships["profiles"].secondary.name
    assert "profile_permissions" in Profile.__mapper__.relationships["permissions"].secondary.name
    assert "profiles" in User.__mapper__.relationships["profiles"].target.name
    assert "users" in Profile.__mapper__.relationships["users"].target.name


def test_all_profiles_have_human_labels() -> None:
    for profile in ProfileEnum:
        label = PROFILE_LABELS[profile]
        assert label
        assert "_" not in label


def test_humanize_profile() -> None:
    assert humanize_profile(ProfileEnum.CHEFE_SECCAO) == "Chefe de Secção"
    assert humanize_profile("ADMINISTRADOR_SISTEMA") == "Administrador do Sistema"


def test_humanize_user_status() -> None:
    assert humanize_user_status(UserStatus.BLOCKED) == "Bloqueado"
    assert humanize_user_status("ACTIVE") == "Ativo"
    assert humanize_user_status(UserStatus.PENDING) == "Pendente"
    assert USER_STATUS_LABELS[UserStatus.INACTIVE] == "Inativo"


def test_humanize_permission() -> None:
    assert humanize_permission(PermissionConstants.PROCESS_READ) == "Consultar Processos"
    assert humanize_permission(PermissionConstants.TEMPLATE_PUBLISH) == "Publicar Templates"


def test_humanize_permission_fallback() -> None:
    assert humanize_permission("custom.thing") == "Custom: Thing"


def test_humanize_enum_fallback() -> None:
    assert humanize_enum("CHEFE_SECCAO") == "Chefe Seccao"
    assert humanize_enum("MEU_PROCESSO_STATUS") == "Meu Processo Status"


def test_permission_constants_are_unique_and_formatted() -> None:
    codes = PermissionConstants.all_permissions()
    assert len(codes) == len(set(codes))
    for code in codes:
        resource, _, action = code.partition(".")
        assert resource
        assert action
        assert "." in code
