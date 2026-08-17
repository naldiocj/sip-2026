"""Fixtures partilhadas para testes de auth com PostgreSQL (docker).

Quando a base sip_test não está acessível, as fixtures falham com skip
nos testes que dependem dela (o CI local sem docker continua verde).
"""

import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from app.core.config import get_settings
from app.db.session import get_db_session
from app.main import app
from argon2 import PasswordHasher
from fastapi.testclient import TestClient
from scripts.seed_dev import seed
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

BACKEND_DIR = Path(__file__).resolve().parents[3]
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
    get_settings.cache_clear()
    os.environ.pop("DATABASE_URL", None)


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
