"""Router da API de gestão de pessoas."""

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.auth.api.dependencies import require_permission
from app.modules.auth.application.audit import AuditService
from app.modules.auth.domain.audit import AuditEventType
from app.modules.auth.domain.user import User
from app.modules.person.api.schemas import (
    PersonCreate,
    PersonListResponse,
    PersonResponse,
    PersonUpdate,
)
from app.modules.person.application.person_service import PersonService
from app.modules.person.domain.exceptions import (
    DuplicateEmployeeNumberError,
    PersonNotFoundError,
)
from app.modules.person.domain.humanize import humanize_person_status
from app.modules.person.domain.person import Person

logger = structlog.get_logger("person")

router = APIRouter(prefix="/persons", tags=["persons"])


def _to_response(person: Person) -> PersonResponse:
    """Converte a entidade Person em resposta API com humanização."""
    return PersonResponse(
        id=person.id,
        person_number=person.person_number,
        full_name=person.full_name,
        preferred_name=person.preferred_name,
        birth_date=person.birth_date,
        birth_place=person.birth_place,
        nationality=person.nationality,
        gender=person.gender,
        bi_number=person.bi_number,
        phone=person.phone,
        email=person.email,
        address=person.address,
        employee_number=person.employee_number,
        functional_category=person.functional_category,
        job_title=person.job_title,
        admission_date=person.admission_date,
        employment_status=person.employment_status,
        professional_registration=person.professional_registration,
        notes=person.notes,
        status=str(person.status),
        status_label=humanize_person_status(person.status),
        is_active=person.is_active,
    )


def _handle_error(e: Exception) -> None:
    """Converte erros de domínio de pessoa em erros HTTP."""
    if isinstance(e, PersonNotFoundError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None
    if isinstance(e, DuplicateEmployeeNumberError):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        ) from None
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error",
    ) from None


@router.get("", response_model=PersonListResponse)
def list_persons(
    search: str | None = Query(None, max_length=100),
    status_filter: str | None = Query(None, alias="status", max_length=30),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    user: User = Depends(require_permission("person.read")),
    db: Session = Depends(get_db_session),
) -> PersonListResponse:
    """Lista pessoas com pesquisa, filtro por estado e paginação."""
    service = PersonService(db)
    items, total = service.list(
        search=search,
        status=status_filter,
        page=page,
        page_size=page_size,
    )
    return PersonListResponse(
        items=[_to_response(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=PersonResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_person(
    body: PersonCreate,
    request: Request,
    user: User = Depends(require_permission("person.create")),
    db: Session = Depends(get_db_session),
) -> PersonResponse:
    """Cria uma nova pessoa."""
    service = PersonService(db)
    try:
        person = service.create(
            full_name=body.full_name,
            preferred_name=body.preferred_name,
            birth_date=body.birth_date,
            birth_place=body.birth_place,
            nationality=body.nationality,
            gender=body.gender,
            bi_number=body.bi_number,
            phone=body.phone,
            email=str(body.email) if body.email else None,
            address=body.address,
            employee_number=body.employee_number,
            functional_category=body.functional_category,
            job_title=body.job_title,
            admission_date=body.admission_date,
            employment_status=body.employment_status,
            professional_registration=body.professional_registration,
            notes=body.notes,
        )
        db.commit()
        db.refresh(person)
        _record_audit(
            db,
            AuditEventType.PERSON_CREATED,
            user,
            request,
            {"person_id": str(person.id), "person_number": person.person_number},
        )
        logger.info("person_created", person_number=person.person_number)
        return _to_response(person)
    except Exception as e:
        db.rollback()
        _handle_error(e)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error",
    )


@router.get("/{person_id}", response_model=PersonResponse)
def get_person(
    person_id: str,
    user: User = Depends(require_permission("person.read")),
    db: Session = Depends(get_db_session),
) -> PersonResponse:
    """Obtém uma pessoa pelo ID."""
    import uuid

    service = PersonService(db)
    person = service.get(uuid.UUID(person_id))
    if person is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found",
        )
    return _to_response(person)


@router.patch("/{person_id}", response_model=PersonResponse)
def update_person(
    person_id: str,
    body: PersonUpdate,
    request: Request,
    user: User = Depends(require_permission("person.update")),
    db: Session = Depends(get_db_session),
) -> PersonResponse:
    """Actualiza os campos fornecidos de uma pessoa."""
    import uuid

    service = PersonService(db)
    try:
        person = service.update(
            uuid.UUID(person_id),
            full_name=body.full_name,
            preferred_name=body.preferred_name,
            birth_date=body.birth_date,
            birth_place=body.birth_place,
            nationality=body.nationality,
            gender=body.gender,
            bi_number=body.bi_number,
            phone=body.phone,
            email=str(body.email) if body.email else None,
            address=body.address,
            employee_number=body.employee_number,
            functional_category=body.functional_category,
            job_title=body.job_title,
            admission_date=body.admission_date,
            employment_status=body.employment_status,
            professional_registration=body.professional_registration,
            notes=body.notes,
        )
        db.commit()
        _record_audit(
            db,
            AuditEventType.PERSON_UPDATED,
            user,
            request,
            {"person_id": str(person.id), "person_number": person.person_number},
        )
        logger.info("person_updated", person_number=person.person_number)
        return _to_response(person)
    except Exception as e:
        db.rollback()
        _handle_error(e)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error",
    )


@router.post("/{person_id}/deactivate", response_model=PersonResponse)
def deactivate_person(
    person_id: str,
    request: Request,
    user: User = Depends(require_permission("person.deactivate")),
    db: Session = Depends(get_db_session),
) -> PersonResponse:
    """Desactiva uma pessoa (suave — histórico preservado)."""
    import uuid

    service = PersonService(db)
    try:
        person = service.deactivate(uuid.UUID(person_id))
        db.commit()
        _record_audit(
            db,
            AuditEventType.PERSON_DEACTIVATED,
            user,
            request,
            {"person_id": str(person.id), "person_number": person.person_number},
        )
        logger.info("person_deactivated", person_number=person.person_number)
        return _to_response(person)
    except Exception as e:
        db.rollback()
        _handle_error(e)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error",
    )


def _record_audit(
    db: Session,
    event_type: AuditEventType,
    user: User,
    request: Request,
    details: dict[str, object],
) -> None:
    """Regista um evento de auditoria com contexto do pedido."""
    client_ip = request.client.host if request.client else None
    AuditService(db).record(
        event_type,
        user_id=user.id,
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent"),
        details=details,
    )
