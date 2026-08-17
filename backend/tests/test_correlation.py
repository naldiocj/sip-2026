"""Testes de correlation ID e logging estruturado."""

from fastapi.testclient import TestClient


def test_correlation_ids_generated_when_not_provided(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.headers["X-Request-ID"]
    assert response.headers["X-Correlation-ID"]


def test_correlation_ids_preserved_when_provided(client: TestClient) -> None:
    response = client.get(
        "/api/v1/health",
        headers={
            "X-Request-ID": "req-123",
            "X-Correlation-ID": "corr-456",
        },
    )

    assert response.headers["X-Request-ID"] == "req-123"
    assert response.headers["X-Correlation-ID"] == "corr-456"


def test_metrics_endpoint_exposes_prometheus_format(client: TestClient) -> None:
    response = client.get("/api/v1/metrics")

    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    assert "sip_http_requests_total" in response.text
