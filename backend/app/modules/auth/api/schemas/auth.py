"""Authentication API schemas."""

from uuid import UUID

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Schema for login request."""

    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=128)


class LoginResponse(BaseModel):
    """Schema for successful login response."""

    access_token: str
    token_type: str = "bearer"
    user: "UserSummary"


class UserSummary(BaseModel):
    """Summary of authenticated user in login response."""

    id: UUID
    username: str
    full_name: str
    email: str
    profiles: list["ProfileSummary"]

    model_config = {"from_attributes": True}


class ProfileSummary(BaseModel):
    """Profile summary in login response."""

    id: UUID
    code: str
    name: str
    label: str | None = None

    model_config = {"from_attributes": True}


class LogoutResponse(BaseModel):
    """Schema for logout response."""

    message: str = "Logout successful"


class TokenPayload(BaseModel):
    """JWT token payload."""

    sub: str  # user_id
    exp: int
    iat: int
    iss: str = "sip-backend"


# Forward reference resolution
LoginResponse.model_rebuild()
UserSummary.model_rebuild()
