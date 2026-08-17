"""User API schemas.

These schemas are used for API request/response serialization.
password_hash is NEVER included in any response schema.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.modules.auth.domain.user import UserStatus


class UserBase(BaseModel):
    """Base user schema with common fields."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    employee_number: str | None = Field(None, max_length=50)


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    """Schema for updating user information."""

    full_name: str | None = Field(None, min_length=1, max_length=255)
    email: EmailStr | None = None
    employee_number: str | None = Field(None, max_length=50)
    status: UserStatus | None = None
    is_active: bool | None = None


class UserResponse(UserBase):
    """Schema for user responses.

    Never includes password_hash or sensitive fields.
    """

    id: UUID
    status: UserStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserWithProfiles(UserResponse):
    """Schema for user response with profile information."""

    profiles: list["ProfileSummary"] = []


class ProfileSummary(BaseModel):
    """Summary schema for profile in user responses."""

    id: UUID
    code: str
    name: str
    label: str | None = None

    model_config = {"from_attributes": True}


class PermissionSummary(BaseModel):
    """Summary schema for permission in profile responses."""

    id: UUID
    code: str
    resource: str
    action: str
    description: str | None = None

    model_config = {"from_attributes": True}


class ProfileResponse(BaseModel):
    """Schema for profile responses."""

    id: UUID
    code: str
    name: str
    description: str | None = None
    is_active: bool
    permissions: list[PermissionSummary] = []

    model_config = {"from_attributes": True}


class PermissionResponse(BaseModel):
    """Schema for permission responses."""

    id: UUID
    code: str
    resource: str
    action: str
    description: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}


# Forward reference resolution
UserWithProfiles.model_rebuild()
