"""Motor de autorização centralizado (RBAC).

Toda a autorização passa por aqui — NUNCA espalhar regras pelos
controllers/endpoints.

Princípios:
- PERMISSION ≠ acesso universal: o scope organizacional (GLOBAL,
  ORGANIZATION, DIRECTION, DEPARTMENT, SECTION, OWN, ASSIGNED, PGR,
  PIQUETE) é preparado nesta Sprint e aprofundado na SPRINT-02.
- ADMINISTRADOR_SISTEMA não recebe tratamento "if admin" especial:
  as suas permissões continuam a ser avaliadas por este motor.
"""

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.modules.auth.domain.profile import ProfileEnum
from app.modules.auth.domain.scope import OrganizationScope
from app.modules.auth.domain.user import User


@dataclass(frozen=True)
class ResourceScope:
    """Scope de recurso — fundação para a SPRINT-02.

    Permite já expressar, no ponto de autorização, que a permissão
    deve ser avaliada dentro de um scope organizacional concreto.
    """

    scope: OrganizationScope = OrganizationScope.GLOBAL
    resource_id: str | None = None


class AuthorizationService:
    """Avalia permissões e perfis de um utilizador."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_user_permissions(self, user: User) -> list[str]:
        """Permissões activas (union) dos perfis activos do utilizador."""
        return sorted(
            {
                permission.code
                for profile in user.profiles
                if profile.is_active
                for permission in profile.permissions
                if permission.is_active
            }
        )

    def check_permission(self, user: User, permission_code: str) -> bool:
        """O utilizador possui a permissão (qualquer perfil activo)."""
        return permission_code in self.get_user_permissions(user)

    def check_profile(self, user: User, profile_code: str | ProfileEnum) -> bool:
        """O utilizador possui o perfil (activo)."""
        expected = ProfileEnum(profile_code)
        return any(profile.code == expected and profile.is_active for profile in user.profiles)
