"""Routers de autenticação.

POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
"""

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db_session
from app.modules.auth.api.dependencies import require_authenticated_user
from app.modules.auth.api.schemas.auth import (
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
    ProfileSummary,
    UserSummary,
)
from app.modules.auth.application.service import (
    AccountBlockedError,
    AccountNotActiveError,
    AuthService,
    InvalidCredentialsError,
)
from app.modules.auth.domain.humanize import humanize_user_status
from app.modules.auth.domain.user import User
from app.modules.auth.infrastructure.rate_limit import RateLimiter

logger = structlog.get_logger("auth")

router = APIRouter(prefix="/auth", tags=["auth"])
rate_limiter = RateLimiter()


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db_session),
) -> LoginResponse:
    """Autentica o utilizador e devolve access token (cookie httpOnly)."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    if not rate_limiter.is_allowed(f"login:ip:{client_ip}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Try again later.",
        )
    if not rate_limiter.is_allowed(f"login:user:{body.username}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Try again later.",
        )

    service = AuthService(db)
    try:
        result = service.login(
            body.username,
            body.password,
            ip_address=client_ip,
            user_agent=user_agent,
        )
    except InvalidCredentialsError:
        logger.info("login_failed", username=body.username, reason="invalid_credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        ) from None
    except AccountBlockedError:
        logger.info("login_failed", username=body.username, reason="blocked")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account blocked",
        ) from None
    except AccountNotActiveError:
        logger.info("login_failed", username=body.username, reason="not_active")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not active",
        ) from None

    settings = get_settings()
    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=result.access_token,
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )

    logger.info("login_success", username=body.username)
    return LoginResponse(
        access_token=result.access_token,
        user=UserSummary(
            id=result.user.id,
            username=result.user.username,
            full_name=result.user.full_name,
            email=result.user.email,
            profiles=[
                ProfileSummary(
                    id=profile.id,
                    code=profile.code,
                    name=profile.name,
                    label=profile.label,
                )
                for profile in result.profiles
            ],
        ),
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
)
def logout(
    request: Request,
    user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db_session),
) -> LogoutResponse:
    """Revoga a sessão do utilizador autenticado e limpa o cookie."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    AuthService(db).logout(user, ip_address=client_ip, user_agent=user_agent)

    response = Response()
    response.delete_cookie(get_settings().access_token_cookie_name, path="/")
    return LogoutResponse()


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(require_authenticated_user)) -> MeResponse:
    """Devolve dados seguros do utilizador autenticado."""
    permissions = sorted(
        {permission.code for profile in user.profiles for permission in profile.permissions}
    )
    return MeResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        employee_number=user.employee_number,
        status=user.status,
        status_label=humanize_user_status(user.status),
        profiles=[
            ProfileSummary(
                id=profile.id,
                code=profile.code,
                name=profile.name,
                label=profile.label,
            )
            for profile in user.profiles
        ],
        permissions=permissions,
        organization_scope=[],
    )
