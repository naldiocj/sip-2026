"""Dependências da API de organização."""

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.auth.api.dependencies import get_current_user
from app.modules.auth.application.audit import AuditService
from app.modules.auth.application.authorization import AuthorizationService
from app.modules.auth.domain.audit import AuditEventType, AuditResult
from app.modules.auth.domain.user import User


def require_organization_manage(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> User:
    """Exige a permissão organization.manage."""
    service = AuthorizationService(db)
    if not service.check_permission(user, "organization.manage"):
        client_ip = request.client.host if request.client else None
        AuditService(db).record(
            AuditEventType.PERMISSION_DENIED,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=request.headers.get("user-agent"),
            details={"permission": "organization.manage"},
            result=AuditResult.FAILURE,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied",
        )
    return user


def require_organization_read(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> User:
    """Exige a permissão organization.read."""
    service = AuthorizationService(db)
    if not service.check_permission(user, "organization.read"):
        client_ip = request.client.host if request.client else None
        AuditService(db).record(
            AuditEventType.PERMISSION_DENIED,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=request.headers.get("user-agent"),
            details={"permission": "organization.read"},
            result=AuditResult.FAILURE,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied",
        )
    return user
