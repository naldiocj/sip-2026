"""Router de utilizadores: listagem para pickers administrativos."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.auth.api.dependencies import require_permission
from app.modules.auth.domain.user import User, UserStatus

router = APIRouter(prefix="/users", tags=["users"])


class UserListItem(BaseModel):
    """Item de listagem de utilizador para selecção (nunca expõe credenciais)."""

    id: uuid.UUID
    username: str
    full_name: str
    email: str
    employee_number: str | None = None
    person_id: uuid.UUID | None = None
    person_name: str | None = None
    status: str


class UserListResponse(BaseModel):
    """Resposta de listagem de utilizadores."""

    items: list[UserListItem]
    total: int


@router.get("", response_model=UserListResponse)
def list_users(
    search: str | None = None,
    user: User = Depends(require_permission("user.read")),
    db: Session = Depends(get_db_session),
) -> UserListResponse:
    """Lista utilizadores (activos) para selecção em formulários de gestão."""
    query = select(User).where(User.status == UserStatus.ACTIVE, User.is_active.is_(True))
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
    query = query.order_by(User.full_name).limit(200)

    users = list(db.scalars(query))
    items: list[UserListItem] = []
    for u in users:
        person: Any = u.person if hasattr(u, "person") else None
        items.append(
            UserListItem(
                id=u.id,
                username=u.username,
                full_name=u.full_name,
                email=u.email or "",
                employee_number=u.employee_number,
                person_id=person.id if person is not None else None,
                person_name=person.full_name if person is not None else None,
                status=str(u.status),
            )
        )
    return UserListResponse(items=items, total=len(items))


@router.get("/{user_id}", response_model=UserListItem)
def get_user(
    user_id: uuid.UUID,
    user: User = Depends(require_permission("user.read")),
    db: Session = Depends(get_db_session),
) -> UserListItem:
    """Obtém um utilizador pelo ID (sem credenciais)."""
    u = db.get(User, user_id)
    if u is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    person: Any = u.person if hasattr(u, "person") else None
    return UserListItem(
        id=u.id,
        username=u.username,
        full_name=u.full_name,
        email=u.email or "",
        employee_number=u.employee_number,
        person_id=person.id if person is not None else None,
        person_name=person.full_name if person is not None else None,
        status=str(u.status),
    )
