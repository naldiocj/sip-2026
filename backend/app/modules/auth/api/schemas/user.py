"""Schemas da API de utilizadores.

Estes schemas são usados na serialização de pedidos/respostas da API.
password_hash NUNCA é incluído em nenhum schema de resposta.
"""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.modules.auth.domain.user import UserStatus


class UserBase(BaseModel):
    """Schema base de utilizador com campos comuns."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    employee_number: str | None = Field(None, max_length=50)


class UserCreate(UserBase):
    """Schema para criar um novo utilizador."""

    password: str = Field(..., min_length=8, max_length=128)
    status: UserStatus | None = None
    profile_ids: list[UUID] = []


class UserUpdate(BaseModel):
    """Schema para actualizar informação do utilizador."""

    full_name: str | None = Field(None, min_length=1, max_length=255)
    email: EmailStr | None = None
    employee_number: str | None = Field(None, max_length=50)


class UserResponse(UserBase):
    """Schema para respostas de utilizador.

    Nunca inclui password_hash nem campos sensíveis.
    """

    id: UUID
    status: UserStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None = None

    model_config = {"from_attributes": True}


class UnitPathItem(BaseModel):
    """Item do caminho hierárquico de uma unidade organizacional."""

    id: UUID
    name: str
    type: str
    type_label: str


class UserAssignmentSummary(BaseModel):
    """Atribuição organizacional resumida (com caminho hierárquico)."""

    id: UUID
    unit_id: UUID
    unit_path: list[UnitPathItem] = []
    assignment_type: str
    is_primary: bool
    start_date: date | None = None
    end_date: date | None = None
    status: str


class UserListItem(BaseModel):
    """Item de listagem/detalhe de utilizador (nunca expõe credenciais)."""

    id: UUID
    username: str
    full_name: str
    email: str
    employee_number: str | None = None
    person_id: UUID | None = None
    person_name: str | None = None
    status: str
    status_label: str
    profiles: list["ProfileSummary"] = []
    last_login_at: datetime | None = None
    created_at: datetime
    primary_assignment: UserAssignmentSummary | None = None


class UserListResponse(BaseModel):
    """Resposta de listagem paginada de utilizadores."""

    items: list[UserListItem]
    total: int
    page: int
    page_size: int


class UserWithProfiles(UserResponse):
    """Schema para resposta de utilizador com informação de perfil."""

    profiles: list["ProfileSummary"] = []


class ProfileSummary(BaseModel):
    """Schema resumido de perfil nas respostas de utilizador."""

    id: UUID
    code: str
    name: str
    label: str | None = None

    model_config = {"from_attributes": True}


class PermissionSummary(BaseModel):
    """Schema resumido de permissão nas respostas de perfil."""

    id: UUID
    code: str
    resource: str
    action: str
    description: str | None = None

    model_config = {"from_attributes": True}


class ProfileResponse(BaseModel):
    """Schema para respostas de perfil."""

    id: UUID
    code: str
    name: str
    description: str | None = None
    is_active: bool
    permissions: list[PermissionSummary] = []

    model_config = {"from_attributes": True}


class PermissionResponse(BaseModel):
    """Schema para respostas de permissão."""

    id: UUID
    code: str
    resource: str
    action: str
    description: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}


# Resolução de referência directa
UserWithProfiles.model_rebuild()
