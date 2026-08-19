"""Schemas da API de organização."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

# --- Organization ---


class OrganizationCreate(BaseModel):
    """Schema para criar uma organização."""

    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    short_name: str | None = Field(None, max_length=100)
    description: str | None = None
    organization_type: str = "INTERNAL"


class OrganizationResponse(BaseModel):
    """Schema para resposta de organização."""

    id: UUID
    code: str
    name: str
    short_name: str | None = None
    description: str | None = None
    organization_type: str = "INTERNAL"
    organization_type_label: str = "Interna"
    status: str
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


# --- Organizational Unit ---


class UnitCreate(BaseModel):
    """Schema para criar uma unidade organizacional."""

    organization_id: UUID
    type_id: str = Field(..., min_length=1, max_length=30)
    name: str = Field(..., min_length=1, max_length=255)
    code: str | None = Field(None, max_length=50)
    parent_id: UUID | None = None
    short_name: str | None = Field(None, max_length=100)
    description: str | None = None


class UnitUpdate(BaseModel):
    """Schema para actualizar uma unidade organizacional."""

    name: str | None = Field(None, min_length=1, max_length=255)
    code: str | None = Field(None, max_length=50)
    parent_id: UUID | None = None
    short_name: str | None = Field(None, max_length=100)
    description: str | None = None
    status: str | None = None


class UnitResponse(BaseModel):
    """Schema para resposta de unidade organizacional."""

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
    """Schema para um nó na árvore organizacional."""

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
    """Resposta de unidade com o nome do tipo resolvido."""

    type_name: str = ""


# --- Unit Type ---


class UnitTypeItem(BaseModel):
    """Schema para uma opção de tipo de unidade."""

    value: str
    label: str
    description: str = ""
    icon: str = ""


# --- User Assignment ---


class UserAssignmentCreate(BaseModel):
    """Schema para criar uma atribuição de utilizador."""

    organizational_unit_id: UUID
    assignment_type: str = "PRIMARY"
    is_primary: bool = False
    start_date: str | None = None
    end_date: str | None = None


class UserAssignmentResponse(BaseModel):
    """Schema para resposta de atribuição de utilizador."""

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
    """Resposta de atribuição com unidade e informações do utilizador resolvidas."""

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
    """Schema para a resposta de /me/organization-context."""

    organization: OrganizationResponse | None = None
    primary_unit: UnitResponse | None = None
    units: list[UnitResponse] = Field(default_factory=list)
    responsibility_scopes: list[str] = Field(default_factory=list)


class AccessContextResponse(BaseModel):
    """Schema para a resposta de /me/context.

    Contexto de acesso completo do utilizador autenticado.
    Nunca inclui passwords, tokens ou dados sensíveis.
    """

    user_id: UUID
    username: str
    person: dict[str, object] | None = None
    profiles: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)
    organization_id: UUID | None = None
    organization_name: str | None = None
    primary_unit_id: UUID | None = None
    primary_unit_name: str | None = None
    assignments: list[object] = Field(default_factory=list)
    responsibilities: list[object] = Field(default_factory=list)
    delegations: list[object] = Field(default_factory=list)
    responsibility_scopes: list[str] = Field(default_factory=list)
    effective_scopes: list[str] = Field(default_factory=list)
    humanized_scopes: list[str] = Field(default_factory=list)
    functional_roles: list[str] = Field(default_factory=list)


# --- Assignment update ---


class UserAssignmentUpdate(BaseModel):
    """Schema para actualizar uma atribuição (períodos e tipo)."""

    assignment_type: str | None = None
    is_primary: bool | None = None
    start_date: str | None = None
    end_date: str | None = None


# --- Responsibility ---


class ResponsibilityCreate(BaseModel):
    """Schema para criar uma responsabilidade funcional."""

    user_id: UUID
    scope: str = Field(..., min_length=1, max_length=50)
    organizational_unit_id: UUID | None = None
    resource_type: str | None = Field(None, max_length=100)
    start_date: str | None = None
    end_date: str | None = None


class ResponsibilityResponse(BaseModel):
    """Resposta de responsabilidade funcional."""

    id: UUID
    user_id: UUID
    scope: str
    organizational_unit_id: UUID | None = None
    resource_type: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: str
    is_active: bool
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


# --- Delegation ---


class DelegationCreate(BaseModel):
    """Schema para criar uma delegação."""

    delegator_user_id: UUID
    delegate_user_id: UUID
    scope: str = Field(..., min_length=1, max_length=50)
    organizational_unit_id: UUID | None = None
    start_date: str | None = None
    end_date: str | None = None
    reason: str | None = Field(None, max_length=500)


class DelegationResponse(BaseModel):
    """Resposta de delegação."""

    id: UUID
    delegator_user_id: UUID
    delegate_user_id: UUID
    scope: str
    organizational_unit_id: UUID | None = None
    start_date: str | None = None
    end_date: str | None = None
    reason: str | None = None
    status: str
    is_active: bool
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
