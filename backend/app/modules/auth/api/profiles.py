"""Router de perfis: listagem para pickers e gestão (labels humanizados).

NUNCA apresenta enums técnicos: devolve code (uso interno) e label
(humano) — a UI deve exibir sempre label.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.auth.api.dependencies import require_permission
from app.modules.auth.domain.profile import Profile
from app.modules.auth.domain.user import User

router = APIRouter(prefix="/profiles", tags=["profiles"])


class ProfileListItem(BaseModel):
    """Item de listagem de perfil (label humanizado incluído)."""

    id: str
    code: str
    name: str
    label: str
    is_active: bool


class ProfileListResponse(BaseModel):
    """Resposta de listagem de perfis."""

    items: list[ProfileListItem]
    total: int


@router.get("", response_model=ProfileListResponse)
def list_profiles(
    user: User = Depends(require_permission("profile.read")),
    db: Session = Depends(get_db_session),
) -> ProfileListResponse:
    """Lista perfis activos para selecção em formulários de gestão."""
    profiles = list(
        db.scalars(select(Profile).where(Profile.is_active.is_(True)).order_by(Profile.name))
    )
    items = [
        ProfileListItem(
            id=str(p.id),
            code=str(p.code),
            name=p.name,
            label=p.label,
            is_active=p.is_active,
        )
        for p in profiles
    ]
    return ProfileListResponse(items=items, total=len(items))
