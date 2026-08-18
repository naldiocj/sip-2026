"""Organization API schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# --- Organization ---


class OrganizationCreate(BaseModel):
    """Schema for creating an organization."""

    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    short_name: str | None = Field(None, max_length=100)
    description: str | None = None


class OrganizationResponse(BaseModel):
    """Schema for organization response."""

    id: UUID
    code: str
    name: str
    short_name: str | None = None
    description: str | None = None
    status: str
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


# --- Organizational Unit ---


class UnitCreate(BaseModel):
    """Schema for creating an organizational unit."""

    organization_id: UUID
    type_id: str = Field(..., min_length=1, max_length=30)
    name: str = Field(..., min_length=1, max_length=255)
    code: str | None = Field(None, max_length=50)
    parent_id: UUID | None = None
    short_name: str | None = Field(None, max_length=100)
    description: str | None = None


class UnitUpdate(BaseModel):
    """Schema for updating an organizational unit."""

    name: str | None = Field(None, min_length=1, max_length=255)
    code: str | None = Field(None, max_length=50)
    parent_id: UUID | None = None
    short_name: str | None = Field(None, max_length=100)
    description: str | None = None
    status: str | None = None


class UnitResponse(BaseModel):
    """Schema for organizational unit response."""

    id: UUID
    organization_id: UUID
    parent_id: UUID | None = None
    type_id: str
    code: str | None = None
    name: str
    short_name: str | None = None
    description: str | None = None
    status: str
    is_active: bool
    sort_order: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UnitTreeNode(BaseModel):
    """Schema for a node in the organizational tree."""

    id: UUID
    organization_id: UUID
    parent_id: UUID | None = None
    type_id: str
    code: str | None = None
    name: str
    short_name: str | None = None
    status: str
    is_active: bool
    sort_order: int | None = None
    children: list["UnitTreeNode"] = Field(default_factory=list)
    children_count: int = 0

    model_config = {"from_attributes": True}


class UnitWithTypeResponse(UnitResponse):
    """Unit response with resolved type name."""

    type_name: str = ""


# --- Unit Type ---


class UnitTypeItem(BaseModel):
    """Schema for a unit type option."""

    value: str
    label: str
    description: str = ""
    icon: str = ""


# --- User Assignment ---


class UserAssignmentCreate(BaseModel):
    """Schema for creating a user assignment."""

    organizational_unit_id: UUID
    assignment_type: str = "PRIMARY"
    is_primary: bool = False
    start_date: str | None = None
    end_date: str | None = None


class UserAssignmentResponse(BaseModel):
    """Schema for user assignment response."""

    id: UUID
    user_id: UUID
    organizational_unit_id: UUID
    assignment_type: str
    is_primary: bool
    start_date: str | None = None
    end_date: str | None = None
    status: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserAssignmentWithDetailsResponse(BaseModel):
    """Assignment response with resolved unit and user info."""

    id: UUID
    user_id: UUID
    username: str = ""
    user_full_name: str = ""
    organizational_unit_id: UUID
    unit_name: str = ""
    unit_type_id: str = ""
    assignment_type: str
    is_primary: bool
    start_date: str | None = None
    end_date: str | None = None
    status: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


# --- Organization Context ---


class OrganizationContextResponse(BaseModel):
    """Schema for /me/organization-context response."""

    organization: OrganizationResponse | None = None
    primary_unit: UnitResponse | None = None
    units: list[UnitResponse] = Field(default_factory=list)
    responsibility_scopes: list[str] = Field(default_factory=list)
