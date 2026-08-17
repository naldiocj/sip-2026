"""Testes do serviço de passwords (TASK-003)."""

import pytest
from app.modules.auth.application.password import PasswordPolicy, PasswordService


def test_hash_password_never_returns_plaintext() -> None:
    service = PasswordService()
    password = "segredo123"
    hashed = service.hash_password(password)

    assert hashed != password
    assert password not in hashed
    assert hashed.startswith("$argon2")


def test_verify_password_correct() -> None:
    service = PasswordService()
    hashed = service.hash_password("segredo123")
    assert service.verify_password("segredo123", hashed) is True


def test_verify_password_wrong() -> None:
    service = PasswordService()
    hashed = service.hash_password("segredo123")
    assert service.verify_password("segredo-errado", hashed) is False


def test_password_policy_min_length() -> None:
    service = PasswordService(policy=PasswordPolicy(min_length=8))
    with pytest.raises(ValueError):
        service.hash_password("curta")


def test_password_policy_max_length() -> None:
    service = PasswordService(policy=PasswordPolicy(max_length=10))
    with pytest.raises(ValueError):
        service.hash_password("muitolongademais")


def test_password_policy_configurable_without_code_changes() -> None:
    strict = PasswordService(policy=PasswordPolicy(min_length=12))
    default = PasswordService()
    assert default.policy.min_length == 8
    assert strict.policy.min_length == 12
    assert strict.verify_password("senha-forte-123", strict.hash_password("senha-forte-123"))
