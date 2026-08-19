"""Constantes de permissões.

Registo centralizado de todas as permissões do sistema.
Formato: RECURSO.ACÇÃO

Utilizar estas constantes em vez de literais de texto em todo o código.
"""


class PermissionConstants:
    """Todas as permissões do sistema organizadas por recurso."""

    # Permissões de processos
    PROCESS_READ = "process.read"
    PROCESS_CREATE = "process.create"
    PROCESS_UPDATE = "process.update"
    PROCESS_ASSIGN = "process.assign"
    PROCESS_DELETE = "process.delete"

    # Permissões de documentos
    DOCUMENT_READ = "document.read"
    DOCUMENT_CREATE = "document.create"
    DOCUMENT_EDIT = "document.edit"
    DOCUMENT_PUBLISH = "document.publish"
    DOCUMENT_DELETE = "document.delete"

    # Permissões de utilizadores
    USER_READ = "user.read"
    USER_CREATE = "user.create"
    USER_UPDATE = "user.update"
    USER_DELETE = "user.delete"

    # Permissões de perfis
    PROFILE_READ = "profile.read"
    PROFILE_MANAGE = "profile.manage"

    # Permissões de permissões
    PERMISSION_READ = "permission.read"
    PERMISSION_MANAGE = "permission.manage"

    # Permissões de notificações
    NOTIFICATION_READ = "notification.read"
    NOTIFICATION_MANAGE = "notification.manage"

    # Permissões de organização
    ORGANIZATION_READ = "organization.read"
    ORGANIZATION_CREATE = "organization.create"
    ORGANIZATION_UPDATE = "organization.update"
    ORGANIZATION_MANAGE = "organization.manage"

    # Permissões de pessoas
    PERSON_READ = "person.read"
    PERSON_CREATE = "person.create"
    PERSON_UPDATE = "person.update"
    PERSON_DEACTIVATE = "person.deactivate"

    # Permissões de atribuições
    ASSIGNMENT_READ = "assignment.read"
    ASSIGNMENT_CREATE = "assignment.create"
    ASSIGNMENT_UPDATE = "assignment.update"
    ASSIGNMENT_END = "assignment.end"

    # Permissões de responsabilidades
    RESPONSIBILITY_READ = "responsibility.read"
    RESPONSIBILITY_MANAGE = "responsibility.manage"

    # Permissões de delegações
    DELEGATION_READ = "delegation.read"
    DELEGATION_MANAGE = "delegation.manage"

    # Permissões de administração do sistema
    SYSTEM_ADMIN = "system.admin"
    SYSTEM_CONFIG = "system.config"
    SYSTEM_AUDIT = "system.audit"

    # Permissões de relatórios
    REPORT_READ = "report.read"
    REPORT_CREATE = "report.create"
    REPORT_EXPORT = "report.export"

    # Permissões de modelos (Editor Documental)
    TEMPLATE_READ = "template.read"
    TEMPLATE_CREATE = "template.create"
    TEMPLATE_EDIT = "template.edit"
    TEMPLATE_PUBLISH = "template.publish"

    # Permissões de piquete
    PIQUETE_READ = "piquete.read"
    PIQUETE_CREATE = "piquete.create"
    PIQUETE_UPDATE = "piquete.update"

    # Permissões de PGR
    PGR_READ = "pgr.read"
    PGR_MANAGE = "pgr.manage"

    @classmethod
    def all_permissions(cls) -> list[str]:
        """Devolve todos os códigos de permissão."""
        return [
            value
            for name, value in vars(cls).items()
            if not name.startswith("_") and isinstance(value, str) and "." in value
        ]
