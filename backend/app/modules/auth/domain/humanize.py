"""Humanização central de códigos técnicos.

NUNCA apresentar enums técnicos directamente na interface
(ex.: CHEFE_SECCAO, PROCESS_READ, ACTIVE).

Toda apresentação ao utilizador deve passar por este módulo.
"""

import re

from app.modules.auth.domain.permissions import PermissionConstants
from app.modules.auth.domain.profile import PROFILE_LABELS, ProfileEnum
from app.modules.auth.domain.user import UserStatus

# Estados do utilizador (UserStatus)
USER_STATUS_LABELS: dict[UserStatus, str] = {
    UserStatus.ACTIVE: "Ativo",
    UserStatus.INACTIVE: "Inativo",
    UserStatus.BLOCKED: "Bloqueado",
    UserStatus.PENDING: "Pendente",
}

# Permissões — nome humanizado (RESOURCE.ACTION → frase em português)
PERMISSION_LABELS: dict[str, str] = {
    PermissionConstants.PROCESS_READ: "Consultar Processos",
    PermissionConstants.PROCESS_CREATE: "Criar Processos",
    PermissionConstants.PROCESS_UPDATE: "Atualizar Processos",
    PermissionConstants.PROCESS_ASSIGN: "Atribuir Processos",
    PermissionConstants.PROCESS_DELETE: "Eliminar Processos",
    PermissionConstants.DOCUMENT_READ: "Consultar Documentos",
    PermissionConstants.DOCUMENT_CREATE: "Criar Documentos",
    PermissionConstants.DOCUMENT_EDIT: "Editar Documentos",
    PermissionConstants.DOCUMENT_PUBLISH: "Publicar Documentos",
    PermissionConstants.DOCUMENT_DELETE: "Eliminar Documentos",
    PermissionConstants.USER_READ: "Consultar Utilizadores",
    PermissionConstants.USER_CREATE: "Criar Utilizadores",
    PermissionConstants.USER_UPDATE: "Atualizar Utilizadores",
    PermissionConstants.USER_DELETE: "Eliminar Utilizadores",
    PermissionConstants.PROFILE_READ: "Consultar Perfis",
    PermissionConstants.PROFILE_MANAGE: "Gerir Perfis",
    PermissionConstants.PERMISSION_READ: "Consultar Permissões",
    PermissionConstants.PERMISSION_MANAGE: "Gerir Permissões",
    PermissionConstants.NOTIFICATION_READ: "Consultar Notificações",
    PermissionConstants.NOTIFICATION_MANAGE: "Gerir Notificações",
    PermissionConstants.ORGANIZATION_READ: "Consultar Organização",
    PermissionConstants.ORGANIZATION_MANAGE: "Gerir Organização",
    PermissionConstants.SYSTEM_ADMIN: "Administrar o Sistema",
    PermissionConstants.SYSTEM_CONFIG: "Configurar o Sistema",
    PermissionConstants.SYSTEM_AUDIT: "Consultar Auditoria",
    PermissionConstants.REPORT_READ: "Consultar Relatórios",
    PermissionConstants.REPORT_CREATE: "Criar Relatórios",
    PermissionConstants.REPORT_EXPORT: "Exportar Relatórios",
    PermissionConstants.TEMPLATE_READ: "Consultar Templates",
    PermissionConstants.TEMPLATE_CREATE: "Criar Templates",
    PermissionConstants.TEMPLATE_EDIT: "Editar Templates",
    PermissionConstants.TEMPLATE_PUBLISH: "Publicar Templates",
    PermissionConstants.PIQUETE_READ: "Consultar Piquete",
    PermissionConstants.PIQUETE_CREATE: "Criar Piquete",
    PermissionConstants.PIQUETE_UPDATE: "Atualizar Piquete",
    PermissionConstants.PGR_READ: "Consultar PGR",
    PermissionConstants.PGR_MANAGE: "Gerir PGR",
}


def humanize_profile(code: str | ProfileEnum) -> str:
    """Nome humanizado de um perfil."""
    return PROFILE_LABELS.get(ProfileEnum(code), str(code))


def humanize_user_status(status: str | UserStatus) -> str:
    """Nome humanizado de um estado de utilizador."""
    return USER_STATUS_LABELS.get(UserStatus(status), str(status))


def humanize_permission(code: str) -> str:
    """Nome humanizado de uma permissão.

    Usa o mapa explícito; como fallback, transforma
    ``resource.action`` em "Recurso: Acção" legível.
    """
    label = PERMISSION_LABELS.get(code)
    if label is not None:
        return label
    resource, _, action = code.partition(".")
    return f"{_title_case(resource)}: {_title_case(action)}"


def humanize_enum(value: str) -> str:
    """Fallback genérico: CHEFE_SECCAO → Chefe Secção."""
    return _title_case(value)


def _title_case(value: str) -> str:
    words = re.split(r"[_.-]+", value)
    return " ".join(word.capitalize() for word in words if word)
