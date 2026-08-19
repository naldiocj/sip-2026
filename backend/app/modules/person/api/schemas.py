"""Schemas da API de gestão de pessoas."""

from datetime import date
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class PersonCreate(BaseModel):
    """Schema para criar uma pessoa.

    Dados pessoais e funcionais separados; nunca contém dados de autenticação.
    """

    full_name: str = Field(..., min_length=1, max_length=255)
    preferred_name: str | None = Field(None, max_length=255)
    birth_date: date | None = None
    birth_place: str | None = Field(None, max_length=255)
    nationality: str | None = Field(None, max_length=100)
    gender: str | None = Field(None, max_length=30)
    bi_number: str | None = Field(None, max_length=50)
    phone: str | None = Field(None, max_length=30)
    email: EmailStr | None = None
    address: str | None = Field(None, max_length=500)
    employee_number: str | None = Field(None, max_length=50)
    functional_category: str | None = Field(None, max_length=100)
    job_title: str | None = Field(None, max_length=150)
    admission_date: date | None = None
    employment_status: str | None = Field(None, max_length=30)
    professional_registration: str | None = Field(None, max_length=100)
    notes: str | None = Field(None, max_length=2000)


class PersonUpdate(BaseModel):
    """Schema para actualizar uma pessoa (apenas campos fornecidos)."""

    full_name: str | None = Field(None, min_length=1, max_length=255)
    preferred_name: str | None = Field(None, max_length=255)
    birth_date: date | None = None
    birth_place: str | None = Field(None, max_length=255)
    nationality: str | None = Field(None, max_length=100)
    gender: str | None = Field(None, max_length=30)
    bi_number: str | None = Field(None, max_length=50)
    phone: str | None = Field(None, max_length=30)
    email: EmailStr | None = None
    address: str | None = Field(None, max_length=500)
    employee_number: str | None = Field(None, max_length=50)
    functional_category: str | None = Field(None, max_length=100)
    job_title: str | None = Field(None, max_length=150)
    admission_date: date | None = None
    employment_status: str | None = Field(None, max_length=30)
    professional_registration: str | None = Field(None, max_length=100)
    notes: str | None = Field(None, max_length=2000)


class PersonResponse(BaseModel):
    """Schema para resposta de pessoa.

    Nunca inclui dados de autenticação (password, tokens).
    """

    id: UUID
    person_number: str
    full_name: str
    preferred_name: str | None = None
    birth_date: date | None = None
    birth_place: str | None = None
    nationality: str | None = None
    gender: str | None = None
    bi_number: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    employee_number: str | None = None
    functional_category: str | None = None
    job_title: str | None = None
    admission_date: date | None = None
    employment_status: str | None = None
    professional_registration: str | None = None
    notes: str | None = None
    status: str
    status_label: str = ""
    is_active: bool

    model_config = {"from_attributes": True}


class PersonListResponse(BaseModel):
    """Resposta paginada de pessoas."""

    items: list[PersonResponse]
    total: int
    page: int
    page_size: int
