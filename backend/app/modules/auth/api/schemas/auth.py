"""Schemas da API de autenticação.

NUNCA incluir password_hash, segredos de refresh nem segredos internos
em qualquer resposta.
"""

from uuid import UUID

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Schema para pedido de login."""

    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=128)


class ProfileSummary(BaseModel):
    """Resumo de perfil nas respostas de autenticação."""

    id: UUID
    code: str
    name: str
    label: str | None = None

    model_config = {"from_attributes": True}


class UserSummary(BaseModel):
    """Resumo do utilizador autenticado na resposta de login."""

    id: UUID
    username: str
    full_name: str
    email: str
    profiles: list[ProfileSummary]

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    """Schema para resposta de login bem-sucedido.

    O access_token é transmitido APENAS via cookie httpOnly.
    Nunca retornar tokens no body da resposta.
    """

    user: UserSummary


class MeResponse(BaseModel):
    """Schema para a resposta de /auth/me.

    Dados seguros do utilizador autenticado, incluindo perfis,
    permissões e âmbito organizacional (fundação).
    """

    id: UUID
    username: str
    email: str
    full_name: str
    employee_number: str | None = None
    status: str
    status_label: str
    profiles: list[ProfileSummary]
    permissions: list[str]
    organization_scope: list[str] = Field(default_factory=list)


class LogoutResponse(BaseModel):
    """Schema para resposta de logout."""

    message: str = "Logout successful"


# Resolução de referência directa
UserSummary.model_rebuild()
