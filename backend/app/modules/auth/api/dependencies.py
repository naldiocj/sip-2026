"""Dependências de autenticação do FastAPI.

Mecanismos centralizados — nunca duplicar lógica de auth nos endpoints:

- get_current_user(): utilizador autenticado (Bearer ou cookie httpOnly).
- require_authenticated_user(): garante autenticação.
- require_permission(): exige permissão (TASK-004).
- require_profile(): exige perfil (TASK-004).
"""

import uuid

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db_session
from app.modules.auth.application.tokens import TokenService
from app.modules.auth.domain.session import UserSession
from app.modules.auth.domain.user import User, UserStatus

_bearer = HTTPBearer(auto_error=False)


def _extract_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> str | None:
    if credentials is not None:
        return credentials.credentials
    return request.cookies.get(get_settings().access_token_cookie_name)


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db_session),
) -> User:
    """Devolve o utilizador autenticado ou levanta 401."""
    token = _extract_token(request, credentials)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    token_service = TokenService()
    try:
        payload = token_service.decode_access_token(token)
        user_id = uuid.UUID(payload["sub"])
        session_id = uuid.UUID(payload["sid"])
    except (InvalidTokenError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from None

    session = db.get(UserSession, session_id)
    if session is None or session.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session revoked",
        )

    user = db.get(User, user_id)
    if user is None or user.status != UserStatus.ACTIVE or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account unavailable",
        )

    return user


def require_authenticated_user(
    user: User = Depends(get_current_user),
) -> User:
    """Garante que o utilizador está autenticado."""
    return user
