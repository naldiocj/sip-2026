"""Access context service — resolves user's organizational context.

Centralizes the logic for determining what organizational data
a user can access based on their assignments and responsibility scopes.
"""

import uuid
from dataclasses import dataclass, field

from sqlalchemy.orm import Session

from app.modules.auth.domain.user import User
from app.modules.organization.application.organization_service import (
    OrganizationContext,
    OrganizationService,
)


@dataclass
class AccessContext:
    """Full access context for a user.

    Combines user identity, organizational placement, and
    responsibility scope for authorization decisions.
    """

    user_id: uuid.UUID
    username: str
    organization: OrganizationContext | None = None
    responsibility_scopes: list[str] = field(default_factory=list)

    @property
    def primary_unit_id(self) -> uuid.UUID | None:
        """ID of the user's primary organizational unit."""
        if self.organization and self.organization.primary_unit:
            return self.organization.primary_unit.id
        return None

    @property
    def organization_id(self) -> uuid.UUID | None:
        """ID of the user's organization."""
        if self.organization and self.organization.organization:
            return self.organization.organization.id
        return None

    @property
    def unit_ids(self) -> list[uuid.UUID]:
        """IDs of all units the user belongs to."""
        if self.organization:
            return [u.id for u in self.organization.units]
        return []


class AccessContextService:
    """Resolves access context for users."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.org_service = OrganizationService(db)

    def get_context(self, user: User) -> AccessContext:
        """Get the full access context for a user."""
        org_context = self.org_service.get_user_context(user.id)

        return AccessContext(
            user_id=user.id,
            username=user.username,
            organization=org_context,
        )

    def get_context_for_user_id(self, user_id: uuid.UUID) -> AccessContext:
        """Get access context by user ID (without loading User entity)."""
        org_context = self.org_service.get_user_context(user_id)

        return AccessContext(
            user_id=user_id,
            username="",
            organization=org_context,
        )
