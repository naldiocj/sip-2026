"""Testes do seed de desenvolvimento (TASK-002)."""

import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from app.core.config import get_settings
from app.modules.auth.domain import (
    Permission,
    PermissionConstants,
    Profile,
    ProfileEnum,
    User,
)
from argon2 import PasswordHasher
from scripts.seed_dev import DEV_USERS, PROFILE_PERMISSIONS, seed
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

BACKEND_DIR = Path(__file__).resolve().parents[3]
TEST_DATABASE_URL = "postgresql+psycopg://sip:sip@localhost:5432/sip_test"


def _database_available() -> bool:
    try:
        engine = create_engine(TEST_DATABASE_URL, connect_args={"connect_timeout": 2})
        with engine.connect():
            pass
        engine.dispose()
        return True
    except Exception:
        return False


requires_database = pytest.mark.skipif(
    not _database_available(),
    reason="PostgreSQL indisponível (docker compose infra)",
)


@pytest.fixture(scope="module")
def seeded_session() -> Session:
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
    get_settings.cache_clear()
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.downgrade(cfg, "base")
    command.upgrade(cfg, "head")
    get_settings.cache_clear()
    os.environ.pop("DATABASE_URL", None)

    engine = create_engine(TEST_DATABASE_URL)
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    with session_factory() as session:
        seed(session, hasher=PasswordHasher())
        yield session
    engine.dispose()


@requires_database
def test_seed_creates_all_profiles(seeded_session: Session) -> None:
    profiles = seeded_session.scalars(select(Profile)).all()
    assert {p.code for p in profiles} == set(ProfileEnum)


@requires_database
def test_seed_creates_all_permissions(seeded_session: Session) -> None:
    permissions = seeded_session.scalars(select(Permission)).all()
    assert {p.code for p in permissions} == set(PermissionConstants.all_permissions())


@requires_database
def test_seed_creates_nine_dev_users(seeded_session: Session) -> None:
    users = seeded_session.scalars(select(User)).all()
    assert len(users) == 9
    assert {u.username for u in users} == {u["username"] for u in DEV_USERS}


@requires_database
def test_seed_hashes_passwords(seeded_session: Session) -> None:
    hasher = PasswordHasher()
    users = seeded_session.scalars(select(User)).all()
    for user in users:
        assert user.password_hash
        assert "admin123" not in user.password_hash
        dev_user = next(u for u in DEV_USERS if u["username"] == user.username)
        assert hasher.verify(user.password_hash, str(dev_user["password"]))


@requires_database
def test_seed_is_idempotent(seeded_session: Session) -> None:
    created = seed(seeded_session, hasher=PasswordHasher())
    assert created == {"profiles": 0, "permissions": 0, "users": 0}
    assert len(seeded_session.scalars(select(User)).all()) == 9


@requires_database
def test_admin_has_all_permissions(seeded_session: Session) -> None:
    admin = seeded_session.scalar(select(User).where(User.username == "admin"))
    assert admin is not None
    codes = {p.code for p in admin.profiles[0].permissions}
    assert codes == set(PermissionConstants.all_permissions())


@requires_database
def test_profile_permission_mapping_respected(seeded_session: Session) -> None:
    for profile_enum, expected_codes in PROFILE_PERMISSIONS.items():
        profile = seeded_session.scalar(select(Profile).where(Profile.code == profile_enum))
        assert profile is not None
        codes = {p.code for p in profile.permissions}
        assert codes == set(expected_codes), f"{profile_enum}: {codes}"


@requires_database
def test_pgr_has_no_global_process_access(seeded_session: Session) -> None:
    pgr_profile = seeded_session.scalar(
        select(Profile).where(Profile.code == ProfileEnum.AGENTE_PGR)
    )
    assert pgr_profile is not None
    codes = {p.code for p in pgr_profile.permissions}
    assert PermissionConstants.PROCESS_READ not in codes
    assert PermissionConstants.PGR_READ in codes


@requires_database
def test_profiles_do_not_leak_permissions_from_other_profiles(seeded_session: Session) -> None:
    piquete_profile = seeded_session.scalar(
        select(Profile).where(Profile.code == ProfileEnum.AGENTE_PIQUETE)
    )
    editor_profile = seeded_session.scalar(
        select(Profile).where(Profile.code == ProfileEnum.EDITOR_DOCUMENTAL)
    )
    piquete_codes = {p.code for p in piquete_profile.permissions}
    editor_codes = {p.code for p in editor_profile.permissions}
    assert PermissionConstants.TEMPLATE_PUBLISH not in piquete_codes
    assert PermissionConstants.PIQUETE_CREATE not in editor_codes
