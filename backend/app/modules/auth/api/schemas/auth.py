"""Authentication API schemas.

NUNCA incluir password_hash, refresh secrets ou segredos internos
em qualquer resposta.
"""

from uuid import UUID

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Schema for login request."""

    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=128)


class ProfileSummary(BaseModel):
    """Profile summary in auth responses."""

    id: UUID
    code: str
    name: str
    label: str | None = None

    model_config = {"from_attributes": True}


class UserSummary(BaseModel):
    """Summary of authenticated user in login response."""

    id: UUID
    username: str
    full_name: str
    email: str
    profiles: list[ProfileSummary]

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    """Schema for successful login response."""

    access_token: str
    token_type: str = "bearer"
    user: UserSummary


class MeResponse(BaseModel):
    """Schema for /auth/me response.

    Dados seguros do utilizador autenticado, incluindo perfis,
    permissões e scope organizacional (fundação).
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
    """Schema for logout response."""

    message: str = "Logout successful"


# Forward reference resolution
UserSummary.model_rebuild()
