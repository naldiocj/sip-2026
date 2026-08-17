"""Testes do serviço de tokens JWT (TASK-003)."""

import uuid
from datetime import UTC, datetime, timedelta

import jwt
import pytest
from app.core.config import get_settings
from app.modules.auth.application.tokens import TokenService
from jwt import InvalidTokenError


def _expired_token() -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": str(uuid.uuid4()),
        "sid": str(uuid.uuid4()),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": now - timedelta(hours=1),
        "exp": now - timedelta(minutes=30),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def test_create_and_decode_access_token() -> None:
    service = TokenService()
    user_id = uuid.uuid4()
    session_id = uuid.uuid4()

    token = service.create_access_token(user_id, session_id)
    payload = service.decode_access_token(token)

    assert payload["sub"] == str(user_id)
    assert payload["sid"] == str(session_id)
    assert payload["iss"] == get_settings().jwt_issuer
    assert payload["aud"] == get_settings().jwt_audience


def test_token_contains_only_minimal_claims() -> None:
    service = TokenService()
    token = service.create_access_token(uuid.uuid4(), uuid.uuid4())
    payload = service.decode_access_token(token)

    assert set(payload) <= {"sub", "sid", "iss", "aud", "iat", "exp"}
    assert "password" not in payload
    assert "email" not in payload


def test_decode_invalid_signature_raises() -> None:
    service = TokenService()
    token = service.create_access_token(uuid.uuid4(), uuid.uuid4())
    tampered = token[:-4] + ("abcd" if not token.endswith("abcd") else "xyzw")

    with pytest.raises(InvalidTokenError):
        service.decode_access_token(tampered)


def test_decode_expired_token_raises() -> None:
    with pytest.raises(InvalidTokenError):
        TokenService().decode_access_token(_expired_token())


def test_decode_wrong_audience_raises() -> None:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": str(uuid.uuid4()),
        "sid": str(uuid.uuid4()),
        "iss": settings.jwt_issuer,
        "aud": "outra-aplicacao",
        "iat": now,
        "exp": now + timedelta(minutes=30),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    with pytest.raises(InvalidTokenError):
        TokenService().decode_access_token(token)


def test_decode_garbage_raises() -> None:
    with pytest.raises(InvalidTokenError):
        TokenService().decode_access_token("not-a-jwt")
