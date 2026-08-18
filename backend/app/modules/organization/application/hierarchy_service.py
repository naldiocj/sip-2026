"""Hierarchy service — tree operations for organizational units.

Centralized hierarchy logic — never duplicate tree queries across modules.
"""

import uuid

from sqlalchemy.orm import Session

from app.modules.organization.domain.exceptions import (
    CircularHierarchyError,
    CrossOrganizationError,
    InvalidParentError,
    SelfParentError,
)
from app.modules.organization.domain.unit import OrganizationalUnit


class HierarchyService:
    """Tree operations for organizational units."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_parent(self, unit_id: uuid.UUID) -> OrganizationalUnit | None:
        """Get the direct parent of a unit."""
        unit = self.db.get(OrganizationalUnit, unit_id)
        if unit is None:
            return None
        parent = unit.parent
        return parent  # type: ignore[no-any-return]

    def get_children(self, unit_id: uuid.UUID) -> list[OrganizationalUnit]:
        """Get direct children of a unit."""
        unit = self.db.get(OrganizationalUnit, unit_id)
        if unit is None:
            return []
        return [child for child in unit.children if child.is_active]

    def get_ancestors(self, unit_id: uuid.UUID) -> list[OrganizationalUnit]:
        """Get all ancestors from parent to root."""
        ancestors = []
        current = self.db.get(OrganizationalUnit, unit_id)
        if current is None:
            return []

        visited: set[uuid.UUID] = set()
        while current.parent_id is not None:
            if current.id in visited:
                raise CircularHierarchyError(
                    f"Circular reference detected for unit {current.id}"
                )
            visited.add(current.id)
            current = current.parent
            if current is not None:
                ancestors.append(current)

        return ancestors

    def get_descendants(self, unit_id: uuid.UUID) -> list[OrganizationalUnit]:
        """Get all descendants recursively (depth-first)."""
        descendants = []
        stack = list(self.get_children(unit_id))

        while stack:
            current = stack.pop()
            descendants.append(current)
            stack.extend(self.get_children(current.id))

        return descendants

    def get_root(self, unit_id: uuid.UUID) -> OrganizationalUnit | None:
        """Get the root unit of the hierarchy."""
        ancestors = self.get_ancestors(unit_id)
        if not ancestors:
            return self.db.get(OrganizationalUnit, unit_id)
        return ancestors[-1]

    def get_unit_path(self, unit_id: uuid.UUID) -> list[OrganizationalUnit]:
        """Get full path from root to the unit (inclusive)."""
        ancestors = self.get_ancestors(unit_id)
        unit = self.db.get(OrganizationalUnit, unit_id)
        if unit is None:
            return []
        ancestors.reverse()
        return ancestors + [unit]

    def validate_parent(
        self,
        unit_id: uuid.UUID,
        parent_id: uuid.UUID | None,
        organization_id: uuid.UUID,
    ) -> None:
        """Validate that a parent assignment is valid.

        Checks:
        - Not self-parent
        - No circular references
        - Parent exists in same organization
        - Parent is active
        """
        if parent_id is None:
            return

        if unit_id == parent_id:
            raise SelfParentError("A unit cannot be its own parent.")

        parent = self.db.get(OrganizationalUnit, parent_id)
        if parent is None:
            raise InvalidParentError(f"Parent unit {parent_id} not found.")

        if parent.organization_id != organization_id:
            raise CrossOrganizationError(
                "Cannot assign parent from a different organization."
            )

        if not parent.is_active:
            raise InvalidParentError("Parent unit is inactive.")

        # Check for circular references
        self._check_cycle(unit_id, parent_id)

    def _check_cycle(
        self, unit_id: uuid.UUID, proposed_parent_id: uuid.UUID
    ) -> None:
        """Check if setting parent_id would create a cycle."""
        visited: set[uuid.UUID] = set()
        current_id: uuid.UUID | None = proposed_parent_id

        while current_id is not None:
            if current_id == unit_id:
                raise CircularHierarchyError(
                    "Setting this parent would create a circular reference."
                )
            if current_id in visited:
                raise CircularHierarchyError(
                    "Circular reference detected in existing hierarchy."
                )
            visited.add(current_id)

            unit = self.db.get(OrganizationalUnit, current_id)
            if unit is None:
                break
            current_id = unit.parent_id
