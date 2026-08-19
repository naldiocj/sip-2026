"""Router de utilizadores: CRUD, listagem administrativa e detalhe.

NUNCA expõe password_hash nem credenciais. Toda a escrita é feita via
UserService (auditoria e validações no serviço); o router apenas orquestra
HTTP e commits.
"""

import uuid
from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, aliased

from app.db.session import get_db_session
from app.modules.auth.api.dependencies import require_permission
from app.modules.auth.api.schemas.user import (
    ProfileSummary,
    UnitPathItem,
    UserAssignmentSummary,
    UserCreate,
    UserListItem,
    UserListResponse,
    UserUpdate,
)
from app.modules.auth.application.user_service import UserNotFoundError, UserService
from app.modules.auth.domain.humanize import humanize_user_status
from app.modules.auth.domain.user import User, UserStatus
from app.modules.organization.domain.humanize import humanize_unit_type
from app.modules.organization.domain.unit import OrganizationalUnit
from app.modules.organization.domain.user_assignment import UserAssignment

logger = structlog.get_logger("users")

router = APIRouter(prefix="/users", tags=["users"])

_SORT_WHITELIST: dict[str, Any] = {
    "full_name": User.full_name,
    "username": User.username,
    "email": User.email,
    "created_at": User.created_at,
    "-created_at": User.created_at.desc(),
}


def _unit_path_map(db: Session, assignment: UserAssignment) -> list[UnitPathItem]:
    """Resolve o caminho hierárquico (raiz → folha) da unidade da atribuição."""
    unit = db.get(OrganizationalUnit, assignment.organizational_unit_id)
    if unit is None:
        return []
    chain: list[OrganizationalUnit] = []
    current: OrganizationalUnit | None = unit
    while current is not None:
        chain.append(current)
        if current.parent_id is None:
            break
        current = db.get(OrganizationalUnit, current.parent_id)
    chain.reverse()
    return [
        UnitPathItem(
            id=item.id,
            name=item.name,
            type=str(item.type_id),
            type_label=humanize_unit_type(item.type_id),
        )
        for item in chain
    ]


def _assignment_summary(
    db: Session, assignment: UserAssignment | None
) -> UserAssignmentSummary | None:
    """Converte uma atribuição em resumo com caminho hierárquico."""
    if assignment is None:
        return None
    return UserAssignmentSummary(
        id=assignment.id,
        unit_id=assignment.organizational_unit_id,
        unit_path=_unit_path_map(db, assignment),
        assignment_type=str(assignment.assignment_type),
        is_primary=assignment.is_primary,
        start_date=assignment.start_date,
        end_date=assignment.end_date,
        status=str(assignment.status),
    )


def _item_dict(
    db: Session, u: User, assignments_by_user: dict[str, UserAssignment] | None = None
) -> UserListItem:
    """Converte um User em UserListItem (sem credenciais)."""
    person: Any = u.person if hasattr(u, "person") else None
    primary: UserAssignment | None = None
    if assignments_by_user is not None:
        primary = assignments_by_user.get(str(u.id))
    return UserListItem(
        id=u.id,
        username=u.username,
        full_name=u.full_name,
        email=u.email or "",
        employee_number=u.employee_number,
        person_id=person.id if person is not None else None,
        person_name=person.full_name if person is not None else None,
        status=str(u.status),
        status_label=humanize_user_status(u.status),
        profiles=[
            ProfileSummary(id=p.id, code=p.code, name=p.name, label=p.label) for p in u.profiles
        ],
        last_login_at=u.last_login_at,
        created_at=u.created_at,
        primary_assignment=_assignment_summary(db, primary),
    )


def _primary_assignments(db: Session, user_ids: list[uuid.UUID]) -> dict[str, UserAssignment]:
    """Devolve a atribuição principal de cada utilizador (uma query)."""
    if not user_ids:
        return {}
    rows = db.scalars(
        select(UserAssignment)
        .where(UserAssignment.user_id.in_(user_ids), UserAssignment.is_primary.is_(True))
        .order_by(UserAssignment.created_at)
    )
    result: dict[str, UserAssignment] = {}
    for row in rows:
        result.setdefault(str(row.user_id), row)
    return result


@router.get("", response_model=UserListResponse)
def list_users(
    search: str | None = None,
    status: UserStatus | None = None,
    profile_id: uuid.UUID | None = None,
    unit_id: uuid.UUID | None = None,
    page: int = 1,
    page_size: int = 20,
    sort: str = "full_name",
    user: User = Depends(require_permission("user.read")),
    db: Session = Depends(get_db_session),
) -> UserListResponse:
    """Lista utilizadores com paginação, pesquisa e filtros server-side."""
    if page < 1:
        page = 1
    page_size = min(max(page_size, 1), 100)

    query = select(User)
    if search:
        like = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.username.ilike(like),
                User.full_name.ilike(like),
                User.email.ilike(like),
                func.coalesce(User.employee_number, "").ilike(like),
            )
        )
    if status is not None:
        query = query.where(User.status == status)
    if profile_id is not None:
        query = query.where(User.profiles.any(id=profile_id))
    if unit_id is not None:
        subtree = (
            select(OrganizationalUnit.id)
            .where(OrganizationalUnit.id == unit_id)
            .cte(name="unit_subtree", recursive=True)
        )
        unit_alias = aliased(OrganizationalUnit)
        subtree = subtree.union_all(
            select(unit_alias.id).join(subtree, unit_alias.parent_id == subtree.c.id)
        )
        query = query.where(
            User.id.in_(
                select(UserAssignment.user_id).where(
                    UserAssignment.organizational_unit_id.in_(select(subtree.c.id))
                )
            )
        )

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    order_by = _SORT_WHITELIST.get(sort, User.full_name)
    users = list(
        db.scalars(query.order_by(order_by).offset((page - 1) * page_size).limit(page_size))
    )
    assignments = _primary_assignments(db, [u.id for u in users])
    items = [_item_dict(db, u, assignments) for u in users]
    return UserListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post(
    "",
    response_model=UserListItem,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    body: UserCreate,
    request: Request,
    user: User = Depends(require_permission("user.create")),
    db: Session = Depends(get_db_session),
) -> UserListItem:
    """Cria um utilizador (password hasheada, auditoria registada)."""
    service = UserService(db)
    try:
        created = service.create(
            username=body.username,
            email=str(body.email),
            full_name=body.full_name,
            password=body.password,
            employee_number=body.employee_number,
            status=body.status or UserStatus.PENDING,
            actor=user,
        )
        for profile_id in body.profile_ids:
            service.assign_profile(created.id, profile_id, actor=user)
        db.commit()
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        ) from None
    logger.info("user_created", user_id=str(created.id), by=str(user.id))
    return _item_dict(db, created)


@router.get("/{user_id}", response_model=UserListItem)
def get_user(
    user_id: uuid.UUID,
    user: User = Depends(require_permission("user.read")),
    db: Session = Depends(get_db_session),
) -> UserListItem:
    """Obtém um utilizador pelo ID (detalhe com perfis e atribuição)."""
    u = db.get(User, user_id)
    if u is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    assignments = _primary_assignments(db, [u.id])
    return _item_dict(db, u, assignments)


@router.patch("/{user_id}", response_model=UserListItem)
def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    request: Request,
    user: User = Depends(require_permission("user.update")),
    db: Session = Depends(get_db_session),
) -> UserListItem:
    """Actualiza campos permitidos do utilizador."""
    service = UserService(db)
    try:
        updated = service.update(
            user_id,
            full_name=body.full_name,
            email=str(body.email) if body.email is not None else None,
            employee_number=body.employee_number,
            actor=user,
        )
        db.commit()
    except UserNotFoundError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        ) from None
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        ) from None
    logger.info("user_updated", user_id=str(user_id), by=str(user.id))
    return _item_dict(db, updated)


def _status_endpoint(service_method: str, detail: str) -> Any:
    """Factory de endpoint de transição de estado (activa/desactiva/bloqueia)."""

    def endpoint(
        user_id: uuid.UUID,
        request: Request,
        user: User = Depends(require_permission("user.update")),
        db: Session = Depends(get_db_session),
    ) -> UserListItem:
        service = UserService(db)
        try:
            updated = getattr(service, service_method)(user_id, actor=user)
            db.commit()
        except UserNotFoundError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            ) from None
        except ValueError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
            ) from None
        logger.info(detail, user_id=str(user_id), by=str(user.id))
        return _item_dict(db, updated)

    return endpoint


router.post("/{user_id}/activate", response_model=UserListItem)(
    _status_endpoint("activate", "user_activated")
)
router.post("/{user_id}/deactivate", response_model=UserListItem)(
    _status_endpoint("deactivate", "user_deactivated")
)
router.post("/{user_id}/block", response_model=UserListItem)(
    _status_endpoint("block", "user_blocked")
)
router.post("/{user_id}/unblock", response_model=UserListItem)(
    _status_endpoint("unblock", "user_unblocked")
)


# --- Perfis do utilizador ---


class UserProfileAssignRequest(BaseModel):
    """Corpo de atribuição de perfil a um utilizador."""

    profile_id: uuid.UUID


@router.post(
    "/{user_id}/profiles",
    response_model=UserListItem,
    status_code=status.HTTP_201_CREATED,
)
def assign_user_profile(
    user_id: uuid.UUID,
    body: UserProfileAssignRequest,
    request: Request,
    user: User = Depends(require_permission("profile.manage")),
    db: Session = Depends(get_db_session),
) -> UserListItem:
    """Atribui um perfil activo ao utilizador (auditoria registada)."""
    service = UserService(db)
    try:
        service.assign_profile(user_id, body.profile_id, actor=user)
        db.commit()
    except UserNotFoundError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        ) from None
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        ) from None
    logger.info("profile_assigned", user_id=str(user_id), profile_id=str(body.profile_id))
    return _item_dict(db, db.get(User, user_id))  # type: ignore[arg-type]


@router.delete("/{user_id}/profiles/{profile_id}", response_model=UserListItem)
def remove_user_profile(
    user_id: uuid.UUID,
    profile_id: uuid.UUID,
    request: Request,
    user: User = Depends(require_permission("profile.manage")),
    db: Session = Depends(get_db_session),
) -> UserListItem:
    """Remove um perfil do utilizador (auditoria registada)."""
    service = UserService(db)
    try:
        service.remove_profile(user_id, profile_id, actor=user)
        db.commit()
    except UserNotFoundError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        ) from None
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        ) from None
    logger.info("profile_removed", user_id=str(user_id), profile_id=str(profile_id))
    return _item_dict(db, db.get(User, user_id))  # type: ignore[arg-type]
