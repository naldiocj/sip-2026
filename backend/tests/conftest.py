"""Fixtures comuns dos testes do backend."""

import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from app.core.config import get_settings
from app.db.session import get_db_session
from app.main import app
from app.modules.auth.domain.user import User, UserStatus
from argon2 import PasswordHasher
from fastapi.testclient import TestClient
from scripts.seed_dev import seed
from sqlalchemy import create_engine, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

BACKEND_DIR = Path(__file__).resolve().parents[1]
TEST_DATABASE_URL = "postgresql+psycopg://sip:sip@localhost:5432/sip_test"


def database_available() -> bool:
    try:
        engine = create_engine(TEST_DATABASE_URL, connect_args={"connect_timeout": 2})
        with engine.connect():
            pass
        engine.dispose()
        return True
    except Exception:
        return False


requires_database = pytest.mark.skipif(
    not database_available(),
    reason="PostgreSQL indisponível (docker compose infra)",
)


def _prepare_test_database() -> None:
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

    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
    get_settings.cache_clear()
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.upgrade(cfg, "head")

    _clean_test_data()
    get_settings.cache_clear()
    os.environ.pop("DATABASE_URL", None)


def _clean_test_data() -> None:
    """Limpa dados transitórios da base de teste entre sessões.

    Remove pessoas e dados de organização criados por testes anteriores,
    preservando os dados de seed (users, perfis, unidades e a organização SIC).
    """
    engine = create_engine(TEST_DATABASE_URL)
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM audit_events"))
        conn.execute(text("DELETE FROM user_assignments"))
        conn.execute(text("DELETE FROM responsibilities"))
        conn.execute(text("DELETE FROM delegations"))
        conn.execute(text("DELETE FROM substitutions"))
        conn.execute(text("DELETE FROM persons WHERE person_number NOT LIKE 'PES-000001'"))
    engine.dispose()


@pytest.fixture(scope="session")
def test_engine() -> Engine:
    """Engine para a base de teste, com migrações aplicadas e seed."""
    if not database_available():
        pytest.skip("PostgreSQL indisponível (docker compose infra)")
    _prepare_test_database()
    engine = create_engine(TEST_DATABASE_URL)
    with Session(engine) as session:
        seed(session, hasher=PasswordHasher())
    yield engine
    engine.dispose()


@pytest.fixture()
def db_session(test_engine: Engine) -> Session:
    """Sessão limpa por teste (rollback no final)."""
    factory = sessionmaker(bind=test_engine, expire_on_commit=False)
    session = factory()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture()
def client(db_session: Session, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    """TestClient com a sessão de teste e rate limiting desactivado."""
    settings = get_settings()
    monkeypatch.setattr(settings, "rate_limit_enabled", False)

    def _override_db():
        yield db_session

    app.dependency_overrides[get_db_session] = _override_db
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.pop(get_db_session, None)
    monkeypatch.undo()


@pytest.fixture()
def seeded_user_admin(db_session: Session) -> User:
    """Utilizador admin criado pelo seed (ou criado à medida)."""
    user = db_session.scalar(select(User).where(User.username == "admin"))
    if user is not None:
        return user
    user = User(
        username="admin",
        email="admin@sip.dev.local",
        password_hash="unused",
        full_name="Admin",
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture()
def seeded_users(db_session: Session) -> list[User]:
    """Dois utilizadores de teste."""
    users = []
    for i in range(2):
        user = db_session.scalar(select(User).where(User.username == f"test_user_{i}"))
        if user is None:
            user = User(
                username=f"test_user_{i}",
                email=f"test_user_{i}@sip.dev.local",
                password_hash="unused",
                full_name=f"Test User {i}",
                status=UserStatus.ACTIVE,
                is_active=True,
            )
            db_session.add(user)
            db_session.flush()
        users.append(user)
    return users
