"""Auth domain layer."""

from app.modules.auth.domain.associations import profile_permissions, user_profiles
from app.modules.auth.domain.audit import AuditEvent, AuditEventType, AuditResult
from app.modules.auth.domain.humanize import (
    PERMISSION_LABELS,
    USER_STATUS_LABELS,
    humanize_enum,
    humanize_permission,
    humanize_profile,
    humanize_user_status,
)
from app.modules.auth.domain.permission import Permission
from app.modules.auth.domain.permissions import PermissionConstants
from app.modules.auth.domain.profile import PROFILE_LABELS, Profile, ProfileEnum
from app.modules.auth.domain.scope import OrganizationScope
from app.modules.auth.domain.session import UserSession
from app.modules.auth.domain.user import User, UserStatus
from app.modules.person.domain.person import (
    Person,  # noqa: F401  (registers Person mapper before User)
)

__all__ = [
    "User",
    "UserStatus",
    "Profile",
    "ProfileEnum",
    "Permission",
    "PermissionConstants",
    "UserSession",
    "AuditEvent",
    "AuditEventType",
    "AuditResult",
    "user_profiles",
    "profile_permissions",
    "OrganizationScope",
    "PROFILE_LABELS",
    "USER_STATUS_LABELS",
    "PERMISSION_LABELS",
    "humanize_profile",
    "humanize_user_status",
    "humanize_permission",
    "humanize_enum",
]
