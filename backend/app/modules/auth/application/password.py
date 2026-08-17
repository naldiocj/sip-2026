"""Serviço de passwords — hashing e política centralizada.

Arquitectura preparada para alterar a política (ex.: comprimento,
complexidade, algoritmo de hashing) num único ponto sem alterar o
resto do sistema.

NUNCA: guardar password em texto, devolvê-la, escrevê-la em logs ou
incluí-la em auditoria.
"""

from dataclasses import dataclass

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError


@dataclass(frozen=True)
class PasswordPolicy:
    """Política mínima de passwords (centralizada)."""

    min_length: int = 8
    max_length: int = 128


class PasswordService:
    """Hashing e verificação de passwords (argon2id)."""

    def __init__(self, policy: PasswordPolicy | None = None) -> None:
        self.policy = policy or PasswordPolicy()
        self._hasher = PasswordHasher()

    def hash_password(self, password: str) -> str:
        """Gera o hash de uma password (nunca armazenar em texto)."""
        self.validate_password_strength(password)
        return self._hasher.hash(password)

    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verifica uma password contra o hash. Nunca devolve detalhes."""
        try:
            return self._hasher.verify(password_hash, password)
        except VerifyMismatchError:
            return False

    def validate_password_strength(self, password: str) -> None:
        """Valida a password contra a política vigente."""
        if len(password) < self.policy.min_length:
            raise ValueError(f"Password deve ter pelo menos {self.policy.min_length} caracteres")
        if len(password) > self.policy.max_length:
            raise ValueError(f"Password não pode exceder {self.policy.max_length} caracteres")
