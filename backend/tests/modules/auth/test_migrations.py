"""Testes de migrações Alembic (TASK-002).

Requerem PostgreSQL disponível em localhost (docker). São ignorados
(skip) quando a base não está acessível.
"""

import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from app.core.config import get_settings
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Engine

BACKEND_DIR = Path(__file__).resolve().parents[3]
ALEMBIC_INI = BACKEND_DIR / "alembic.ini"
TEST_DATABASE_URL = "postgresql+psycopg://sip:sip@localhost:5432/sip_test"

AUTH_TABLES = {
    "users",
    "profiles",
    "permissions",
    "user_profiles",
    "profile_permissions",
    "user_sessions",
}


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


def _create_test_database_if_missing() -> None:
    admin_url = get_settings().database_url
    admin_engine = create_engine(admin_url, connect_args={"connect_timeout": 2})
    try:
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = 'sip_test'")
            ).scalar()
            if not exists:
                conn.execute(text("COMMIT"))
                conn.execute(text("CREATE DATABASE sip_test"))
    finally:
        admin_engine.dispose()


def _alembic_config() -> Config:
    cfg = Config(str(ALEMBIC_INI))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    return cfg


@pytest.fixture(scope="module")
def migrated_db() -> Engine:
    _create_test_database_if_missing()
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
    get_settings.cache_clear()
    command.upgrade(_alembic_config(), "head")
    yield create_engine(TEST_DATABASE_URL)
    get_settings.cache_clear()
    os.environ.pop("DATABASE_URL", None)


@requires_database
def test_upgrade_creates_all_auth_tables(migrated_db: Engine) -> None:
    tables = set(inspect(migrated_db).get_table_names())
    assert tables >= AUTH_TABLES


@requires_database
def test_tables_have_expected_columns(migrated_db: Engine) -> None:
    users_columns = {col["name"] for col in inspect(migrated_db).get_columns("users")}
    assert {
        "id",
        "username",
        "email",
        "password_hash",
        "full_name",
        "employee_number",
        "status",
        "is_active",
        "created_at",
        "updated_at",
        "last_login_at",
    } <= users_columns

    sessions_columns = {col["name"] for col in inspect(migrated_db).get_columns("user_sessions")}
    assert {"user_id", "expires_at", "revoked_at", "ip_address", "user_agent"} <= sessions_columns


@requires_database
def test_unique_indexes_on_username_email_code(migrated_db: Engine) -> None:
    users_indexes = inspect(migrated_db).get_indexes("users")
    unique_columns = {tuple(i["column_names"]) for i in users_indexes if i["unique"]}
    assert ("username",) in unique_columns
    assert ("email",) in unique_columns

    profiles_indexes = inspect(migrated_db).get_indexes("profiles")
    assert ("code",) in {tuple(i["column_names"]) for i in profiles_indexes if i["unique"]}


@requires_database
def test_downgrade_base_drops_all_tables(migrated_db: Engine) -> None:
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
    get_settings.cache_clear()
    command.downgrade(_alembic_config(), "base")
    try:
        tables = set(inspect(migrated_db).get_table_names())
        assert tables <= {"alembic_version"}
    finally:
        command.upgrade(_alembic_config(), "head")
        get_settings.cache_clear()
        os.environ.pop("DATABASE_URL", None)
