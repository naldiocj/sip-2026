"""Testes de tratamento global de erros."""

from app.api.errors import register_exception_handlers
from fastapi import FastAPI
from fastapi.testclient import TestClient


def test_unknown_route_returns_consistent_error(client) -> None:
    response = client.get("/api/v1/not-exists")

    assert response.status_code == 404
    body = response.json()
    assert body["code"] == "HTTP_404"
    assert body["message"]
    assert body["details"] == []


def test_validation_error_returns_consistent_error() -> None:
    app = FastAPI()

    @app.get("/items/{item_id}")
    def get_item(item_id: int) -> dict:
        return {"item_id": item_id}

    register_exception_handlers(app)

    response = TestClient(app).get("/items/not-a-number")

    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "VALIDATION_ERROR"
    assert body["message"] == "Validation failed"
    assert len(body["details"]) == 1
    assert body["details"][0]["field"] == "item_id"
    assert body["details"][0]["message"]


def test_errors_never_expose_stack_trace(client) -> None:
    response = client.get("/api/v1/not-exists")

    assert "Traceback" not in response.text
    assert "exc" not in response.text.lower()
