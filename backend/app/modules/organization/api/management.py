"""Routers de gestão: atribuições (PATCH/end), responsabilidades e delegações."""

import uuid
from datetime import date
from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.auth.api.dependencies import require_permission
from app.modules.auth.application.audit import AuditService
from app.modules.auth.domain.audit import AuditEventType
from app.modules.auth.domain.user import User
from app.modules.organization.api.schemas import (
    DelegationCreate,
    ResponsibilityCreate,
    SubstitutionCreate,
    UserAssignmentUpdate,
)
from app.modules.organization.application.assignment_service import AssignmentService
from app.modules.organization.application.delegation_service import DelegationService
from app.modules.organization.application.responsibility_service import ResponsibilityService
from app.modules.organization.application.substitution_service import SubstitutionService
from app.modules.organization.domain.exceptions import (
    AssignmentNotFoundError,
    DelegationNotFoundError,
    InvalidDelegationError,
    InvalidResponsibilityError,
    InvalidSubstitutionError,
    MultiplePrimaryAssignmentError,
    OverlappingDelegationError,
    ResponsibilityNotFoundError,
    SubstitutionNotFoundError,
    UnitNotFoundError,
)
from app.modules.organization.domain.responsibility import Responsibility
from app.modules.organization.domain.substitution import Substitution

logger = structlog.get_logger("org-management")

assignments_router = APIRouter(prefix="/users/{user_id}/assignments", tags=["user-assignments"])
responsibilities_router = APIRouter(prefix="/responsibilities", tags=["responsibilities"])
delegations_router = APIRouter(prefix="/delegations", tags=["delegations"])
substitutions_router = APIRouter(prefix="/substitutions", tags=["substitutions"])


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


def _parse_date(value: str | None) -> date | None:
    """Converte string ISO em date (None quando ausente ou inválido)."""
    if value is None:
        return None
    return date.fromisoformat(value)


def _http_error(detail: str) -> HTTPException:
    """Cria HTTPException 422 com mensagem (formato consistente)."""
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


# --- Assignments: PATCH e end (sem destruir histórico) ---


@assignments_router.patch(
    "/{assignment_id}",
    response_model=dict[str, object],
)
def update_user_assignment(
    user_id: str,
    assignment_id: str,
    body: UserAssignmentUpdate,
    request: Request,
    user: User = Depends(require_permission("assignment.update")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Actualiza períodos/tipo de uma atribuição (nunca apaga)."""
    service = AssignmentService(db)
    try:
        assignment = service.get(uuid.UUID(assignment_id))
        if assignment is None or str(assignment.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found"
            ) from None
        assignment = service.update(
            uuid.UUID(assignment_id),
            assignment_type=body.assignment_type,
            is_primary=body.is_primary,
            start_date=_parse_date(body.start_date),
            end_date=_parse_date(body.end_date),
        )
        db.commit()
        _record_audit(
            db,
            AuditEventType.ASSIGNMENT_UPDATED,
            user,
            request,
            {"assignment_id": str(assignment.id), "user_id": user_id, "action": "update"},
        )
        logger.info("assignment_updated", assignment_id=str(assignment.id))
        return {
            "id": str(assignment.id),
            "user_id": str(assignment.user_id),
            "organizational_unit_id": str(assignment.organizational_unit_id),
            "assignment_type": str(assignment.assignment_type),
            "is_primary": assignment.is_primary,
            "start_date": assignment.start_date.isoformat() if assignment.start_date else None,
            "end_date": assignment.end_date.isoformat() if assignment.end_date else None,
            "status": str(assignment.status),
        }
    except AssignmentNotFoundError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found"
        ) from None
    except MultiplePrimaryAssignmentError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from None
    except ValueError as e:
        db.rollback()
        raise _http_error(str(e)) from None


@assignments_router.post(
    "/{assignment_id}/end",
    response_model=dict[str, object],
)
def end_user_assignment(
    user_id: str,
    assignment_id: str,
    request: Request,
    user: User = Depends(require_permission("assignment.end")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Termina uma atribuição suavemente (histórico preservado)."""
    service = AssignmentService(db)
    try:
        assignment = service.get(uuid.UUID(assignment_id))
        if assignment is None or str(assignment.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found"
            ) from None
        assignment = service.end(uuid.UUID(assignment_id))
        db.commit()
        _record_audit(
            db,
            AuditEventType.ASSIGNMENT_ENDED,
            user,
            request,
            {"assignment_id": str(assignment.id), "user_id": user_id, "action": "end"},
        )
        logger.info("assignment_ended", assignment_id=str(assignment.id))
        return {
            "id": str(assignment.id),
            "user_id": str(assignment.user_id),
            "organizational_unit_id": str(assignment.organizational_unit_id),
            "assignment_type": str(assignment.assignment_type),
            "is_primary": assignment.is_primary,
            "status": str(assignment.status),
        }
    except AssignmentNotFoundError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found"
        ) from None


# --- Responsibilities ---


@responsibilities_router.get("", response_model=list[dict[str, object]])
def list_responsibilities(
    user_id: uuid.UUID | None = None,
    user: User = Depends(require_permission("responsibility.read")),
    db: Session = Depends(get_db_session),
) -> list[dict[str, object]]:
    """Lista responsabilidades (todas ou de um utilizador)."""
    service = ResponsibilityService(db)
    if user_id is not None:
        items = service.list_for_user(user_id, include_inactive=True)
    else:
        items = list(db.scalars(select(Responsibility)))
    return [_responsibility_dict(r) for r in items]


def _responsibility_dict(r: Any) -> dict[str, object]:
    """Converte uma responsabilidade em dict serializável."""
    return {
        "id": str(r.id),
        "user_id": str(r.user_id),
        "scope": str(r.scope),
        "organizational_unit_id": str(r.organizational_unit_id)
        if r.organizational_unit_id
        else None,
        "resource_type": r.resource_type,
        "start_date": r.start_date.isoformat() if r.start_date else None,
        "end_date": r.end_date.isoformat() if r.end_date else None,
        "status": str(r.status),
        "is_active": r.is_active,
    }


@responsibilities_router.get("/{responsibility_id}", response_model=dict[str, object])
def get_responsibility(
    responsibility_id: str,
    user: User = Depends(require_permission("responsibility.read")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Obtém uma responsabilidade pelo ID."""
    service = ResponsibilityService(db)
    r = service.get(uuid.UUID(responsibility_id))
    if r is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Responsibility not found"
        )
    return _responsibility_dict(r)


@responsibilities_router.post(
    "",
    response_model=dict[str, object],
    status_code=status.HTTP_201_CREATED,
)
def create_responsibility(
    body: ResponsibilityCreate,
    request: Request,
    user: User = Depends(require_permission("responsibility.manage")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Cria uma responsabilidade funcional (apenas administradores)."""
    service = ResponsibilityService(db)
    try:
        r = service.create(
            user_id=body.user_id,
            scope=body.scope,
            organizational_unit_id=body.organizational_unit_id,
            resource_type=body.resource_type,
            start_date=_parse_date(body.start_date),
            end_date=_parse_date(body.end_date),
        )
        db.commit()
        _record_audit(
            db,
            AuditEventType.RESPONSIBILITY_CREATED,
            user,
            request,
            {"responsibility_id": str(r.id), "user_id": str(r.user_id), "scope": str(r.scope)},
        )
        logger.info("responsibility_granted", responsibility_id=str(r.id))
        return _responsibility_dict(r)
    except (UnitNotFoundError, InvalidResponsibilityError) as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        ) from None
    except ValueError as e:
        db.rollback()
        raise _http_error(str(e)) from None


@responsibilities_router.post(
    "/{responsibility_id}/end",
    response_model=dict[str, object],
)
def end_responsibility(
    responsibility_id: str,
    request: Request,
    user: User = Depends(require_permission("responsibility.manage")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Termina uma responsabilidade (histórico preservado)."""
    service = ResponsibilityService(db)
    try:
        r = service.end(uuid.UUID(responsibility_id))
        db.commit()
        _record_audit(
            db,
            AuditEventType.RESPONSIBILITY_ENDED,
            user,
            request,
            {"responsibility_id": str(r.id), "user_id": str(r.user_id), "scope": str(r.scope)},
        )
        logger.info("responsibility_ended", responsibility_id=str(r.id))
        return _responsibility_dict(r)
    except ResponsibilityNotFoundError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Responsibility not found"
        ) from None


# --- Delegations ---


@delegations_router.get("", response_model=list[dict[str, object]])
def list_delegations(
    user_id: uuid.UUID | None = None,
    as_delegator: bool = True,
    user: User = Depends(require_permission("delegation.read")),
    db: Session = Depends(get_db_session),
) -> list[dict[str, object]]:
    """Lista delegações (todas, como delegante ou como delegado)."""
    service = DelegationService(db)
    if user_id is not None:
        items = service.list_for_user(user_id, as_delegator=as_delegator)
    else:
        items = service.list_active()
    return [_delegation_dict(d) for d in items]


def _delegation_dict(d: Any) -> dict[str, object]:
    """Converte uma delegação em dict serializável."""
    return {
        "id": str(d.id),
        "delegator_user_id": str(d.delegator_user_id),
        "delegate_user_id": str(d.delegate_user_id),
        "scope": str(d.scope),
        "organizational_unit_id": str(d.organizational_unit_id)
        if d.organizational_unit_id
        else None,
        "start_date": d.start_date.isoformat() if d.start_date else None,
        "end_date": d.end_date.isoformat() if d.end_date else None,
        "reason": d.reason,
        "status": str(d.status),
        "is_active": d.is_active,
    }


@delegations_router.get("/{delegation_id}", response_model=dict[str, object])
def get_delegation(
    delegation_id: str,
    user: User = Depends(require_permission("delegation.read")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Obtém uma delegação pelo ID."""
    service = DelegationService(db)
    d = service.get(uuid.UUID(delegation_id))
    if d is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delegation not found")
    return _delegation_dict(d)


@delegations_router.post(
    "",
    response_model=dict[str, object],
    status_code=status.HTTP_201_CREATED,
)
def create_delegation(
    body: DelegationCreate,
    request: Request,
    user: User = Depends(require_permission("delegation.manage")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Cria uma delegação (apenas administradores)."""
    service = DelegationService(db)
    try:
        d = service.create(
            delegator_user_id=body.delegator_user_id,
            delegate_user_id=body.delegate_user_id,
            scope=body.scope,
            organizational_unit_id=body.organizational_unit_id,
            start_date=_parse_date(body.start_date),
            end_date=_parse_date(body.end_date),
            reason=body.reason,
        )
        db.commit()
        _record_audit(
            db,
            AuditEventType.DELEGATION_CREATED,
            user,
            request,
            {
                "delegation_id": str(d.id),
                "delegator": str(d.delegator_user_id),
                "delegate": str(d.delegate_user_id),
            },
        )
        logger.info("delegation_created", delegation_id=str(d.id))
        return _delegation_dict(d)
    except (UnitNotFoundError, InvalidDelegationError, OverlappingDelegationError) as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        ) from None
    except ValueError as e:
        db.rollback()
        raise _http_error(str(e)) from None


@delegations_router.post(
    "/{delegation_id}/revoke",
    response_model=dict[str, object],
)
def revoke_delegation(
    delegation_id: str,
    request: Request,
    user: User = Depends(require_permission("delegation.manage")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Revoga uma delegação (histórico preservado)."""
    service = DelegationService(db)
    try:
        d = service.revoke(uuid.UUID(delegation_id))
        db.commit()
        _record_audit(
            db,
            AuditEventType.DELEGATION_REVOKED,
            user,
            request,
            {
                "delegation_id": str(d.id),
                "delegator": str(d.delegator_user_id),
                "delegate": str(d.delegate_user_id),
            },
        )
        logger.info("delegation_revoked", delegation_id=str(d.id))
        return _delegation_dict(d)
    except DelegationNotFoundError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Delegation not found"
        ) from None


# --- Substitutions ---


@substitutions_router.get("", response_model=list[dict[str, object]])
def list_substitutions(
    user_id: uuid.UUID | None = None,
    as_substitute: bool = False,
    user: User = Depends(require_permission("delegation.read")),
    db: Session = Depends(get_db_session),
) -> list[dict[str, object]]:
    """Lista substituições (todas ou de um utilizador)."""
    service = SubstitutionService(db)
    if user_id is not None:
        items = service.list_for_user(user_id, as_substitute=as_substitute)
    else:
        items = list(db.scalars(select(Substitution)))
    return [_substitution_dict(s) for s in items]


def _substitution_dict(s: Any) -> dict[str, object]:
    """Converte uma substituição em dict serializável."""
    return {
        "id": str(s.id),
        "substituted_user_id": str(s.substituted_user_id),
        "substitute_user_id": str(s.substitute_user_id),
        "organizational_unit_id": str(s.organizational_unit_id)
        if s.organizational_unit_id
        else None,
        "functional_role": s.functional_role,
        "start_date": s.start_date.isoformat() if s.start_date else None,
        "end_date": s.end_date.isoformat() if s.end_date else None,
        "reason": s.reason,
        "status": str(s.status),
        "is_active": s.is_active,
    }


@substitutions_router.get("/{substitution_id}", response_model=dict[str, object])
def get_substitution(
    substitution_id: str,
    user: User = Depends(require_permission("delegation.read")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Obtém uma substituição pelo ID."""
    service = SubstitutionService(db)
    s = service.get(uuid.UUID(substitution_id))
    if s is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Substitution not found")
    return _substitution_dict(s)


@substitutions_router.post(
    "",
    response_model=dict[str, object],
    status_code=status.HTTP_201_CREATED,
)
def create_substitution(
    body: SubstitutionCreate,
    request: Request,
    user: User = Depends(require_permission("delegation.manage")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Cria uma substituição temporária (apenas administradores)."""
    service = SubstitutionService(db)
    try:
        s = service.create(
            substituted_user_id=body.substituted_user_id,
            substitute_user_id=body.substitute_user_id,
            organizational_unit_id=body.organizational_unit_id,
            functional_role=body.functional_role,
            start_date=_parse_date(body.start_date),
            end_date=_parse_date(body.end_date),
            reason=body.reason,
        )
        db.commit()
        _record_audit(
            db,
            AuditEventType.SUBSTITUTION_CREATED,
            user,
            request,
            {
                "substitution_id": str(s.id),
                "substituted": str(s.substituted_user_id),
                "substitute": str(s.substitute_user_id),
            },
        )
        logger.info("substitution_created", substitution_id=str(s.id))
        return _substitution_dict(s)
    except (UnitNotFoundError, InvalidSubstitutionError) as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        ) from None
    except ValueError as e:
        db.rollback()
        raise _http_error(str(e)) from None


@substitutions_router.post(
    "/{substitution_id}/end",
    response_model=dict[str, object],
)
def end_substitution(
    substitution_id: str,
    request: Request,
    user: User = Depends(require_permission("delegation.manage")),
    db: Session = Depends(get_db_session),
) -> dict[str, object]:
    """Termina uma substituição (histórico preservado)."""
    service = SubstitutionService(db)
    try:
        s = service.end(uuid.UUID(substitution_id))
        db.commit()
        _record_audit(
            db,
            AuditEventType.SUBSTITUTION_ENDED,
            user,
            request,
            {
                "substitution_id": str(s.id),
                "substituted": str(s.substituted_user_id),
                "substitute": str(s.substitute_user_id),
            },
        )
        logger.info("substitution_ended", substitution_id=str(s.id))
        return _substitution_dict(s)
    except SubstitutionNotFoundError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Substitution not found"
        ) from None
