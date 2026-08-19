"""Router da API de organização."""

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.auth.api.dependencies import get_current_user
from app.modules.auth.domain.user import User
from app.modules.organization.api.dependencies import (
    require_organization_manage,
    require_organization_read,
)
from app.modules.organization.api.schemas import (
    OrganizationContextResponse,
    OrganizationCreate,
    OrganizationResponse,
    UnitCreate,
    UnitResponse,
    UnitTreeNode,
    UnitTypeItem,
    UnitUpdate,
    UserAssignmentCreate,
    UserAssignmentResponse,
    UserAssignmentWithDetailsResponse,
)
from app.modules.organization.application.access_context import AccessContextService
from app.modules.organization.application.organization_service import (
    OrganizationService,
)
from app.modules.organization.domain.exceptions import (
    CircularHierarchyError,
    CrossOrganizationError,
    DuplicateCodeError,
    InvalidParentError,
    OrganizationNotFoundError,
    SelfParentError,
    UnitNotFoundError,
)
from app.modules.organization.domain.unit_type import UNIT_TYPE_LABELS, UnitType

logger = structlog.get_logger("organization")

router = APIRouter(prefix="/organizations", tags=["organizations"])


def _handle_error(e: Exception) -> None:
    """Converte erros de domínio em erros HTTP."""
    if isinstance(e, OrganizationNotFoundError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None
    if isinstance(e, DuplicateCodeError):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        ) from None
    if isinstance(e, (SelfParentError, CircularHierarchyError, InvalidParentError)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        ) from None
    if isinstance(e, CrossOrganizationError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        ) from None
    if isinstance(e, UnitNotFoundError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from None
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error",
    ) from None


# --- Unit Types endpoint ---

unit_types_router = APIRouter(prefix="/unit-types", tags=["unit-types"])

_UNIT_TYPE_ICONS: dict[UnitType, str] = {
    UnitType.ORGANIZATION: "Building",
    UnitType.DIRECTION: "Landmark",
    UnitType.DEPARTMENT: "Building2",
    UnitType.SECTION: "LayoutList",
    UnitType.UNIT: "Box",
    UnitType.PIQUETE: "MapPin",
    UnitType.OTHER: "Folder",
}

_UNIT_TYPE_DESCRIPTIONS: dict[UnitType, str] = {
    UnitType.ORGANIZATION: "Entidade institucional principal.",
    UnitType.DIRECTION: "Unidade de topo responsável por uma área de atuação.",
    UnitType.DEPARTMENT: "Divisão dentro de uma direção.",
    UnitType.SECTION: "Subdivisão dentro de um departamento.",
    UnitType.UNIT: "Unidade funcional de menor dimensão.",
    UnitType.PIQUETE: "Unidade operacional de piquete.",
    UnitType.OTHER: "Outra classificação não categorizada.",
}


@unit_types_router.get("", response_model=list[UnitTypeItem])
def list_unit_types(
    user: User = Depends(require_organization_read),
) -> list[UnitTypeItem]:
    """Lista todos os tipos de unidade disponíveis com rótulos e metadados."""
    return [
        UnitTypeItem(
            value=t.value,
            label=UNIT_TYPE_LABELS[t],
            description=_UNIT_TYPE_DESCRIPTIONS.get(t, ""),
            icon=_UNIT_TYPE_ICONS.get(t, "Folder"),
        )
        for t in UnitType
        if t != UnitType.ORGANIZATION
    ]


# --- Organization endpoints ---


@router.get("", response_model=list[OrganizationResponse])
def list_organizations(
    user: User = Depends(require_organization_read),
    db: Session = Depends(get_db_session),
) -> list[OrganizationResponse]:
    """Lista todas as organizações activas."""
    service = OrganizationService(db)
    return service.list_organizations()  # type: ignore[return-value]


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_organization(
    body: OrganizationCreate,
    request: Request,
    user: User = Depends(require_organization_manage),
    db: Session = Depends(get_db_session),
) -> OrganizationResponse:
    """Cria uma nova organização."""
    service = OrganizationService(db)
    try:
        org = service.create_organization(
            code=body.code,
            name=body.name,
            short_name=body.short_name,
            description=body.description,
            organization_type=body.organization_type,
        )
        db.commit()
        logger.info(
            "organization_created",
            user_id=str(user.id),
            org_code=org.code,
        )
        return org  # type: ignore[return-value]
    except Exception as e:
        db.rollback()
        _handle_error(e)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error",
    )


# --- Organizational Unit endpoints ---

units_router = APIRouter(prefix="/units", tags=["organizational-units"])


@units_router.get("/tree", response_model=list[UnitTreeNode])
def get_unit_tree(
    organization_id: str,
    user: User = Depends(require_organization_read),
    db: Session = Depends(get_db_session),
) -> list[UnitTreeNode]:
    """Obtém a árvore organizacional completa de uma organização."""
    import uuid

    service = OrganizationService(db)
    tree = service.get_unit_tree(uuid.UUID(organization_id))
    return tree  # type: ignore[return-value]


@units_router.get("", response_model=list[UnitResponse])
def list_units(
    organization_id: str,
    user: User = Depends(require_organization_read),
    db: Session = Depends(get_db_session),
) -> list[UnitResponse]:
    """Lista todas as unidades de uma organização (lista plana)."""
    import uuid

    service = OrganizationService(db)
    return service.list_all_units(uuid.UUID(organization_id))  # type: ignore[return-value]


@units_router.post(
    "",
    response_model=UnitResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_unit(
    body: UnitCreate,
    request: Request,
    user: User = Depends(require_organization_manage),
    db: Session = Depends(get_db_session),
) -> UnitResponse:
    """Cria uma nova unidade organizacional."""
    service = OrganizationService(db)
    try:
        unit = service.create_unit(
            organization_id=body.organization_id,
            type_id=body.type_id,
            name=body.name,
            code=body.code,
            parent_id=body.parent_id,
            short_name=body.short_name,
            description=body.description,
        )
        db.commit()
        logger.info(
            "unit_created",
            user_id=str(user.id),
            unit_code=unit.code,
            unit_name=unit.name,
        )
        return unit  # type: ignore[return-value]
    except Exception as e:
        db.rollback()
        _handle_error(e)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error",
    )


@units_router.get("/{unit_id}", response_model=UnitResponse)
def get_unit(
    unit_id: str,
    user: User = Depends(require_organization_read),
    db: Session = Depends(get_db_session),
) -> UnitResponse:
    """Obtém uma unidade organizacional pelo ID."""
    import uuid

    service = OrganizationService(db)
    unit = service.get_unit(uuid.UUID(unit_id))
    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )
    return unit  # type: ignore[return-value]


@units_router.patch("/{unit_id}", response_model=UnitResponse)
def update_unit(
    unit_id: str,
    body: UnitUpdate,
    request: Request,
    user: User = Depends(require_organization_manage),
    db: Session = Depends(get_db_session),
) -> UnitResponse:
    """Actualiza uma unidade organizacional."""
    import uuid

    service = OrganizationService(db)
    unit = service.get_unit(uuid.UUID(unit_id))
    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )

    try:
        if body.name is not None:
            unit.name = body.name
        if body.code is not None:
            unit.code = body.code
        if body.short_name is not None:
            unit.short_name = body.short_name
        if body.description is not None:
            unit.description = body.description
        if body.status is not None:
            unit.status = body.status  # type: ignore[assignment]
            unit.is_active = body.status == "ACTIVE"

        if body.parent_id is not None:
            service.move_unit(unit.id, body.parent_id)

        db.commit()
        logger.info(
            "unit_updated",
            user_id=str(user.id),
            unit_code=unit.code,
        )
    except Exception as e:
        db.rollback()
        _handle_error(e)

    return UnitResponse(
        id=unit.id,
        organization_id=unit.organization_id,
        type_id=unit.type_id,
        name=unit.name,
        status=unit.status,
        is_active=unit.is_active,
    )


@units_router.get("/{unit_id}/assignments", response_model=list[UserAssignmentWithDetailsResponse])
def list_unit_assignments(
    unit_id: str,
    user: User = Depends(require_organization_read),
    db: Session = Depends(get_db_session),
) -> list[UserAssignmentWithDetailsResponse]:
    """Lista todas as atribuições activas de uma unidade, com detalhes do utilizador."""
    import uuid

    service = OrganizationService(db)
    enriched = service.get_unit_assignments(uuid.UUID(unit_id))
    return [
        UserAssignmentWithDetailsResponse(
            id=a.id,
            user_id=a.user_id,
            username=username,
            user_full_name=full_name,
            organizational_unit_id=a.organizational_unit_id,
            unit_name=a.organizational_unit.name if a.organizational_unit else "",
            unit_type_id=str(a.organizational_unit.type_id) if a.organizational_unit else "",
            assignment_type=str(a.assignment_type),
            is_primary=a.is_primary,
            start_date=str(a.start_date) if a.start_date else None,
            end_date=str(a.end_date) if a.end_date else None,
            status=str(a.status),
            created_at=a.created_at,
            updated_at=a.updated_at,
        )
        for a, username, full_name in enriched
    ]


# --- User Assignment endpoints ---

assignments_router = APIRouter(
    prefix="/users/{user_id}/assignments",
    tags=["user-assignments"],
)


@assignments_router.get("", response_model=list[UserAssignmentResponse])
def list_user_assignments(
    user_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> list[UserAssignmentResponse]:
    """Lista as atribuições de um utilizador."""
    import uuid

    service = OrganizationService(db)
    return service.get_user_assignments(uuid.UUID(user_id))  # type: ignore[return-value]


@assignments_router.post(
    "",
    response_model=UserAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_assignment(
    user_id: str,
    body: UserAssignmentCreate,
    request: Request,
    user: User = Depends(require_organization_manage),
    db: Session = Depends(get_db_session),
) -> UserAssignmentResponse:
    """Cria uma atribuição de utilizador."""
    import uuid

    from app.modules.organization.domain.user_assignment import (
        AssignmentStatus,
        AssignmentType,
        UserAssignment,
    )

    org_service = OrganizationService(db)
    unit = org_service.get_unit(body.organizational_unit_id)
    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organizational unit not found",
        )

    if body.is_primary:
        existing_primary = org_service.get_user_primary_assignment(
            uuid.UUID(user_id),
        )
        if existing_primary is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has a primary assignment. Deactivate it first.",
            )

    assignment = UserAssignment(
        user_id=uuid.UUID(user_id),
        organizational_unit_id=body.organizational_unit_id,
        assignment_type=AssignmentType(body.assignment_type),
        is_primary=body.is_primary,
        status=AssignmentStatus.ACTIVE,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    logger.info(
        "user_assigned",
        user_id=user_id,
        unit_id=str(body.organizational_unit_id),
        assignment_type=body.assignment_type,
    )
    return assignment  # type: ignore[return-value]


# --- Organization Context endpoint ---

me_router = APIRouter(prefix="/me", tags=["me"])


@me_router.get(
    "/organization-context",
    response_model=OrganizationContextResponse,
)
def get_organization_context(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> OrganizationContextResponse:
    """Obtém o contexto organizacional do utilizador actual."""
    service = AccessContextService(db)
    context = service.get_context(user)

    return OrganizationContextResponse(
        organization=context.organization.organization if context.organization else None,
        primary_unit=context.organization.primary_unit if context.organization else None,
        units=context.organization.units if context.organization else [],
        responsibility_scopes=context.responsibility_scopes,
    )
