"""Permission constants.

Centralized registry of all system permissions.
Format: RESOURCE.ACTION

Use these constants instead of string literals throughout the codebase.
"""


class PermissionConstants:
    """All system permissions organized by resource."""

    # Process permissions
    PROCESS_READ = "process.read"
    PROCESS_CREATE = "process.create"
    PROCESS_UPDATE = "process.update"
    PROCESS_ASSIGN = "process.assign"
    PROCESS_DELETE = "process.delete"

    # Document permissions
    DOCUMENT_READ = "document.read"
    DOCUMENT_CREATE = "document.create"
    DOCUMENT_EDIT = "document.edit"
    DOCUMENT_PUBLISH = "document.publish"
    DOCUMENT_DELETE = "document.delete"

    # User permissions
    USER_READ = "user.read"
    USER_CREATE = "user.create"
    USER_UPDATE = "user.update"
    USER_DELETE = "user.delete"

    # Profile permissions
    PROFILE_READ = "profile.read"
    PROFILE_MANAGE = "profile.manage"

    # Permission permissions
    PERMISSION_READ = "permission.read"
    PERMISSION_MANAGE = "permission.manage"

    # Notification permissions
    NOTIFICATION_READ = "notification.read"
    NOTIFICATION_MANAGE = "notification.manage"

    # Organization permissions
    ORGANIZATION_READ = "organization.read"
    ORGANIZATION_MANAGE = "organization.manage"

    # System administration permissions
    SYSTEM_ADMIN = "system.admin"
    SYSTEM_CONFIG = "system.config"
    SYSTEM_AUDIT = "system.audit"

    # Report permissions
    REPORT_READ = "report.read"
    REPORT_CREATE = "report.create"
    REPORT_EXPORT = "report.export"

    # Template permissions (Editor Documental)
    TEMPLATE_READ = "template.read"
    TEMPLATE_CREATE = "template.create"
    TEMPLATE_EDIT = "template.edit"
    TEMPLATE_PUBLISH = "template.publish"

    # Piquete permissions
    PIQUETE_READ = "piquete.read"
    PIQUETE_CREATE = "piquete.create"
    PIQUETE_UPDATE = "piquete.update"

    # PGR permissions
    PGR_READ = "pgr.read"
    PGR_MANAGE = "pgr.manage"

    @classmethod
    def all_permissions(cls) -> list[str]:
        """Return all permission codes."""
        return [
            value
            for name, value in vars(cls).items()
            if not name.startswith("_") and isinstance(value, str) and "." in value
        ]
