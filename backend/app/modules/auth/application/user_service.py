"""Serviço de gestão do ciclo de vida do utilizador.

Responsável por criar, actualizar, activar, desactivar, bloquear e
desbloquear utilizadores, sempre com auditoria e revogação de sessões
quando o acesso deve ser cortado.

NUNCA expõe password_hash; NUNCA guarda passwords em auditoria.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.auth.application.audit import AuditService
from app.modules.auth.application.password import PasswordService
from app.modules.auth.domain.audit import AuditEventType
from app.modules.auth.domain.profile import Profile
from app.modules.auth.domain.session import UserSession
from app.modules.auth.domain.user import User, UserStatus


class UserNotFoundError(Exception):
    """Utilizador inexistente."""


class UserService:
    """Orquestra o ciclo de vida do utilizador."""

    def __init__(
        self,
        db: Session,
        password_service: PasswordService | None = None,
        audit_service: AuditService | None = None,
    ) -> None:
        self.db = db
        self.password_service = password_service or PasswordService()
        self.audit_service = audit_service or AuditService(db)

    def create(
        self,
        *,
        username: str,
        email: str,
        full_name: str,
        password: str,
        employee_number: str | None = None,
        status: UserStatus = UserStatus.PENDING,
        actor: User,
    ) -> User:
        """Cria um utilizador com password hasheada e regista auditoria."""
        exists = self.db.scalar(select(User).where(User.username == username))
        if exists is not None:
            raise ValueError("Username já em utilização")
        email_exists = self.db.scalar(select(User).where(User.email == email))
        if email_exists is not None:
            raise ValueError("Email já em utilização")

        user = User(
            username=username,
            email=email,
            full_name=full_name,
            employee_number=employee_number,
            password_hash=self.password_service.hash_password(password),
            status=status,
            is_active=status == UserStatus.ACTIVE,
        )
        self.db.add(user)
        self.db.flush()
        self.audit_service.record(
            AuditEventType.USER_CREATED,
            user_id=actor.id,
            details={"user_id": str(user.id), "username": username},
            commit=False,
        )
        return user

    def update(
        self,
        user_id: uuid.UUID,
        *,
        full_name: str | None = None,
        email: str | None = None,
        employee_number: str | None = None,
        actor: User,
    ) -> User:
        """Actualiza campos permitidos do utilizador e regista auditoria."""
        user = self.db.get(User, user_id)
        if user is None:
            raise UserNotFoundError("User not found")
        if email is not None and email != user.email:
            duplicate = self.db.scalar(select(User).where(User.email == email))
            if duplicate is not None and duplicate.id != user.id:
                raise ValueError("Email já em utilização")
            user.email = email
        if full_name is not None:
            user.full_name = full_name
        if employee_number is not None:
            user.employee_number = employee_number
        self.db.flush()
        self.audit_service.record(
            AuditEventType.USER_UPDATED,
            user_id=actor.id,
            details={"user_id": str(user_id)},
            commit=False,
        )
        return user

    def activate(self, user_id: uuid.UUID, *, actor: User) -> User:
        """Activa a conta (ACTIVE)."""
        user = self._get_or_raise(user_id)
        if user.status == UserStatus.ACTIVE:
            raise ValueError("Conta já está ativa")
        user.status = UserStatus.ACTIVE
        user.is_active = True
        self.db.flush()
        self.audit_service.record(
            AuditEventType.USER_ACTIVATED,
            user_id=actor.id,
            details={"user_id": str(user_id)},
            commit=False,
        )
        return user

    def deactivate(self, user_id: uuid.UUID, *, actor: User) -> User:
        """Desactiva a conta (INACTIVE) e revoga sessões activas."""
        if user_id == actor.id:
            raise ValueError("Não é possível desactivar a própria conta")
        user = self._get_or_raise(user_id)
        user.status = UserStatus.INACTIVE
        user.is_active = False
        self._revoke_sessions(user_id)
        self.db.flush()
        self.audit_service.record(
            AuditEventType.USER_DEACTIVATED,
            user_id=actor.id,
            details={"user_id": str(user_id)},
            commit=False,
        )
        return user

    def block(self, user_id: uuid.UUID, *, actor: User) -> User:
        """Bloqueia a conta (BLOCKED) e revoga sessões activas."""
        if user_id == actor.id:
            raise ValueError("Não é possível bloquear a própria conta")
        user = self._get_or_raise(user_id)
        if user.status == UserStatus.BLOCKED:
            raise ValueError("Conta já está bloqueada")
        user.status = UserStatus.BLOCKED
        self._revoke_sessions(user_id)
        self.db.flush()
        self.audit_service.record(
            AuditEventType.USER_BLOCKED,
            user_id=actor.id,
            details={"user_id": str(user_id)},
            commit=False,
        )
        return user

    def unblock(self, user_id: uuid.UUID, *, actor: User) -> User:
        """Desbloqueia a conta (ACTIVE)."""
        user = self._get_or_raise(user_id)
        if user.status != UserStatus.BLOCKED:
            raise ValueError("Conta não está bloqueada")
        user.status = UserStatus.ACTIVE
        user.is_active = True
        self.db.flush()
        self.audit_service.record(
            AuditEventType.USER_UNBLOCKED,
            user_id=actor.id,
            details={"user_id": str(user_id)},
            commit=False,
        )
        return user

    def assign_profile(
        self,
        user_id: uuid.UUID,
        profile_id: uuid.UUID,
        *,
        actor: User,
    ) -> User:
        """Atribui um perfil activo ao utilizador e regista auditoria."""
        user = self._get_or_raise(user_id)
        profile = self.db.get(Profile, profile_id)
        if profile is None or not profile.is_active:
            raise ValueError("Perfil inválido ou inactivo")
        if any(p.id == profile_id for p in user.profiles):
            raise ValueError("Perfil já atribuído a este utilizador")
        user.profiles.append(profile)
        self.db.flush()
        self.audit_service.record(
            AuditEventType.USER_PROFILE_ASSIGNED,
            user_id=actor.id,
            details={
                "user_id": str(user_id),
                "profile_id": str(profile_id),
                "profile": profile.code,
            },
            commit=False,
        )
        return user

    def remove_profile(
        self,
        user_id: uuid.UUID,
        profile_id: uuid.UUID,
        *,
        actor: User,
    ) -> User:
        """Remove um perfil do utilizador e regista auditoria."""
        user = self._get_or_raise(user_id)
        profile = next((p for p in user.profiles if p.id == profile_id), None)
        if profile is None:
            raise ValueError("Perfil não atribuído a este utilizador")
        user.profiles.remove(profile)
        self.db.flush()
        self.audit_service.record(
            AuditEventType.USER_PROFILE_REMOVED,
            user_id=actor.id,
            details={
                "user_id": str(user_id),
                "profile_id": str(profile_id),
                "profile": profile.code,
            },
            commit=False,
        )
        return user

    def _get_or_raise(self, user_id: uuid.UUID) -> User:
        user = self.db.get(User, user_id)
        if user is None:
            raise UserNotFoundError("User not found")
        return user

    def _revoke_sessions(self, user_id: uuid.UUID) -> None:
        """Revoga todas as sessões activas do utilizador."""
        sessions = list(
            self.db.scalars(
                select(UserSession).where(
                    UserSession.user_id == user_id,
                    UserSession.revoked_at.is_(None),
                )
            )
        )
        for session in sessions:
            session.revoke()
