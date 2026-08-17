"""Testes de health checks."""

from app.db.session import get_db_session
from fastapi.testclient import TestClient


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "sip-backend"
    assert body["version"] == "0.1.0"
    assert body["environment"] == "development"


def test_live_returns_alive(client: TestClient) -> None:
    response = client.get("/api/v1/health/live")

    assert response.status_code == 200
    assert response.json()["status"] == "alive"


def test_ready_returns_ready_when_database_is_healthy(client: TestClient) -> None:
    client.app.dependency_overrides[get_db_session] = lambda: _FakeSession(healthy=True)
    response = client.get("/api/v1/health/ready")
    client.app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["checks"]["database"] == "ok"


def test_ready_returns_503_when_database_is_down(client: TestClient) -> None:
    client.app.dependency_overrides[get_db_session] = lambda: _FakeSession(healthy=False)
    response = client.get("/api/v1/health/ready")
    client.app.dependency_overrides.clear()

    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "not_ready"
    assert body["checks"]["database"] == "error"


class _FakeSession:
    def __init__(self, healthy: bool) -> None:
        self.healthy = healthy

    def execute(self, statement: str) -> None:
        if not self.healthy:
            raise RuntimeError("database unavailable")
