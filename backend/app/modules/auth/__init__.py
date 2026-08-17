"""Auth module — Identity, Authentication, and Authorization."""

from app.modules.auth.domain.associations import profile_permissions, user_profiles
from app.modules.auth.domain.permission import Permission
from app.modules.auth.domain.profile import Profile, ProfileEnum
from app.modules.auth.domain.scope import OrganizationScope
from app.modules.auth.domain.user import User, UserStatus

__all__ = [
    "User",
    "UserStatus",
    "Profile",
    "ProfileEnum",
    "Permission",
    "user_profiles",
    "profile_permissions",
    "OrganizationScope",
]
