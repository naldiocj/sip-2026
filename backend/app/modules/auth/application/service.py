"""Serviço de autenticação — login, logout e obtenção do utilizador.

Regras:
- Nunca revelar se o username existe (anti enumeração): o mesmo erro
  genérico é devolvido para utilizador inexistente ou password errada.
- Validar estado da conta após a validação das credenciais.
- Sessões revogáveis: logout revoga a sessão na BD.
"""

import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.modules.auth.application.audit import AuditService
from app.modules.auth.application.password import PasswordService
from app.modules.auth.application.tokens import TokenService
from app.modules.auth.domain.audit import AuditEventType, AuditResult
from app.modules.auth.domain.profile import Profile
from app.modules.auth.domain.session import UserSession
from app.modules.auth.domain.user import User, UserStatus


class AuthError(Exception):
    """Erro base de autenticação."""


class InvalidCredentialsError(AuthError):
    """Credenciais inválidas (genérico — sem enumeração)."""


class AccountBlockedError(AuthError):
    """Conta bloqueada."""


class AccountNotActiveError(AuthError):
    """Conta inactiva/pendente."""


@dataclass
class LoginResult:
    """Resultado de um login bem-sucedido."""

    user: User
    profiles: list[Profile]
    permissions: list[str]
    access_token: str
    organization_scope: list[str] = field(default_factory=list)


class AuthService:
    """Orquestra o fluxo de autenticação."""

    def __init__(
        self,
        db: Session,
        password_service: PasswordService | None = None,
        token_service: TokenService | None = None,
        audit_service: AuditService | None = None,
    ) -> None:
        self.db = db
        self.password_service = password_service or PasswordService()
        self.token_service = token_service or TokenService()
        self.audit_service = audit_service or AuditService(db)

    def login(
        self,
        username: str,
        password: str,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> LoginResult:
        """Autentica um utilizador e cria a sessão."""
        user = self.db.scalar(select(User).where(User.username == username))

        if user is None or not self.password_service.verify_password(password, user.password_hash):
            self.audit_service.record(
                AuditEventType.LOGIN_FAILED,
                user_id=user.id if user else None,
                ip_address=ip_address,
                user_agent=user_agent,
                details={"username": username},
                result=AuditResult.FAILURE,
            )
            raise InvalidCredentialsError("Invalid credentials")

        if user.status == UserStatus.BLOCKED:
            self.audit_service.record(
                AuditEventType.ACCOUNT_BLOCKED,
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                details={"username": username},
                result=AuditResult.FAILURE,
            )
            raise AccountBlockedError("Account blocked")
        if user.status != UserStatus.ACTIVE or not user.is_active:
            self.audit_service.record(
                AuditEventType.LOGIN_FAILED,
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                details={"username": username, "reason": "account_not_active"},
                result=AuditResult.FAILURE,
            )
            raise AccountNotActiveError("Account not active")

        session = self._create_session(user, ip_address, user_agent)
        user.last_login_at = datetime.now(UTC)

        access_token = self.token_service.create_access_token(user.id, session.id)
        self.db.commit()

        self.audit_service.record(
            AuditEventType.LOGIN_SUCCESS,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"session_id": str(session.id)},
        )

        profiles = list(user.profiles)
        permissions = sorted({p.code for profile in profiles for p in profile.permissions})
        return LoginResult(
            user=user,
            profiles=profiles,
            permissions=permissions,
            access_token=access_token,
        )

    def logout(
        self,
        user: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        """Revoga a sessão activa mais recente do utilizador (idempotente)."""
        session = self.db.scalar(
            select(UserSession)
            .where(UserSession.user_id == user.id, UserSession.revoked_at.is_(None))
            .order_by(UserSession.created_at.desc())
            .limit(1)
        )
        self.audit_service.record(
            AuditEventType.LOGOUT,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"session_id": str(session.id)} if session is not None else None,
        )
        if session is not None:
            session.revoke()
            self.db.commit()
            self.audit_service.record(
                AuditEventType.SESSION_REVOKED,
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                details={"session_id": str(session.id)},
            )

    def get_session(self, session_id: uuid.UUID) -> UserSession | None:
        """Devolve a sessão se válida (não revogada e dentro do TTL)."""
        session = self.db.get(UserSession, session_id)
        if session is None or session.is_revoked:
            return None
        if session.expires_at < datetime.now(UTC):
            return None
        return session

    def _create_session(
        self,
        user: User,
        ip_address: str | None,
        user_agent: str | None,
    ) -> UserSession:
        settings = get_settings()
        session = UserSession(
            user_id=user.id,
            expires_at=datetime.now(UTC) + timedelta(days=settings.session_ttl_days),
            ip_address=ip_address,
            user_agent=user_agent[:512] if user_agent else None,
        )
        self.db.add(session)
        self.db.flush()
        return session


def collect_permissions(profiles: list[Profile]) -> list[str]:
    """Permissões únicas (union) dos perfis do utilizador."""
    return sorted({p.code for profile in profiles for p in profile.permissions})
