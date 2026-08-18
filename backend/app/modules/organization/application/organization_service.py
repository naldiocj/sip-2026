"""Organization service — central operations for organizational management.

Provides CRUD, hierarchy access, context retrieval, and user-unit resolution.
"""

import uuid
from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.organization.application.hierarchy_service import HierarchyService
from app.modules.organization.domain.exceptions import (
    DuplicateCodeError,
    UnitNotFoundError,
)
from app.modules.organization.domain.organization import Organization
from app.modules.organization.domain.unit import OrganizationalUnit, UnitStatus
from app.modules.organization.domain.user_assignment import UserAssignment


@dataclass
class OrganizationContext:
    """Contextual information for a user within the organization."""

    organization: Organization | None = None
    primary_unit: OrganizationalUnit | None = None
    units: list[OrganizationalUnit] = field(default_factory=list)
    responsibility_scopes: list[str] = field(default_factory=list)


class OrganizationService:
    """Central service for organization operations."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.hierarchy = HierarchyService(db)

    def get_organization(self, org_id: uuid.UUID) -> Organization | None:
        """Get organization by ID."""
        return self.db.get(Organization, org_id)

    def get_organization_by_code(self, code: str) -> Organization | None:
        """Get organization by code."""
        return self.db.scalar(
            select(Organization).where(Organization.code == code)
        )

    def list_organizations(self) -> list[Organization]:
        """List all active organizations."""
        return list(
            self.db.scalars(
                select(Organization).where(Organization.is_active == True)  # noqa: E712
            )
        )

    def create_organization(
        self,
        code: str,
        name: str,
        short_name: str | None = None,
        description: str | None = None,
    ) -> Organization:
        """Create a new organization."""
        existing = self.get_organization_by_code(code)
        if existing is not None:
            raise DuplicateCodeError(f"Organization code '{code}' already exists.")

        org = Organization(
            code=code,
            name=name,
            short_name=short_name,
            description=description,
        )
        self.db.add(org)
        self.db.flush()
        return org

    def get_unit(self, unit_id: uuid.UUID) -> OrganizationalUnit | None:
        """Get organizational unit by ID."""
        return self.db.get(OrganizationalUnit, unit_id)

    def get_unit_by_code(
        self, organization_id: uuid.UUID, code: str
    ) -> OrganizationalUnit | None:
        """Get unit by code within an organization."""
        return self.db.scalar(
            select(OrganizationalUnit).where(
                OrganizationalUnit.organization_id == organization_id,
                OrganizationalUnit.code == code,
            )
        )

    def list_root_units(self, organization_id: uuid.UUID) -> list[OrganizationalUnit]:
        """List top-level units (no parent) for an organization."""
        return list(
            self.db.scalars(
                select(OrganizationalUnit).where(
                    OrganizationalUnit.organization_id == organization_id,
                    OrganizationalUnit.parent_id.is_(None),
                    OrganizationalUnit.is_active == True,  # noqa: E712
                )
            )
        )

    def list_all_units(self, organization_id: uuid.UUID) -> list[OrganizationalUnit]:
        """List all units for an organization (flat list)."""
        return list(
            self.db.scalars(
                select(OrganizationalUnit).where(
                    OrganizationalUnit.organization_id == organization_id,
                    OrganizationalUnit.is_active == True,  # noqa: E712
                ).order_by(OrganizationalUnit.sort_order, OrganizationalUnit.name)
            )
        )

    def get_unit_tree(self, organization_id: uuid.UUID) -> list[dict]:
        """Build the full organizational tree for an organization.

        Returns a nested dict structure suitable for JSON serialization.
        """
        all_units = list(
            self.db.scalars(
                select(OrganizationalUnit).where(
                    OrganizationalUnit.organization_id == organization_id,
                ).order_by(OrganizationalUnit.sort_order, OrganizationalUnit.name)
            )
        )

        unit_map: dict[uuid.UUID, dict] = {}
        for unit in all_units:
            unit_map[unit.id] = {
                "id": unit.id,
                "organization_id": unit.organization_id,
                "parent_id": unit.parent_id,
                "type_id": unit.type_id,
                "code": unit.code,
                "name": unit.name,
                "short_name": unit.short_name,
                "status": str(unit.status),
                "is_active": unit.is_active,
                "sort_order": unit.sort_order,
                "children": [],
                "children_count": 0,
            }

        roots: list[dict] = []
        for unit in all_units:
            node = unit_map[unit.id]
            if unit.parent_id and unit.parent_id in unit_map:
                parent = unit_map[unit.parent_id]
                parent["children"].append(node)
                parent["children_count"] = len(parent["children"])
            else:
                roots.append(node)

        return roots

    def get_unit_assignments(
        self, unit_id: uuid.UUID
    ) -> list[tuple[UserAssignment, str, str]]:
        """Get all active assignments for a unit.

        Returns list of (assignment, username, user_full_name).
        """
        from app.modules.auth.domain.user import User as UserModel

        results = list(
            self.db.scalars(
                select(UserAssignment).where(
                    UserAssignment.organizational_unit_id == unit_id,
                    UserAssignment.status == "ACTIVE",
                )
            )
        )

        enriched = []
        for assignment in results:
            user = self.db.get(UserModel, assignment.user_id)
            username = user.username if user else ""
            full_name = user.full_name if user else ""
            enriched.append((assignment, username, full_name))

        return enriched

    def list_units_by_type(
        self, organization_id: uuid.UUID, type_id: str
    ) -> list[OrganizationalUnit]:
        """List units of a specific type within an organization."""
        return list(
            self.db.scalars(
                select(OrganizationalUnit).where(
                    OrganizationalUnit.organization_id == organization_id,
                    OrganizationalUnit.type_id == type_id,
                    OrganizationalUnit.is_active == True,  # noqa: E712
                )
            )
        )

    def create_unit(
        self,
        organization_id: uuid.UUID,
        type_id: str,
        name: str,
        code: str | None = None,
        parent_id: uuid.UUID | None = None,
        short_name: str | None = None,
        description: str | None = None,
    ) -> OrganizationalUnit:
        """Create a new organizational unit."""
        if code is not None:
            existing = self.get_unit_by_code(organization_id, code)
            if existing is not None:
                raise DuplicateCodeError(
                    f"Unit code '{code}' already exists in this organization."
                )

        # Validate parent
        self.hierarchy.validate_parent(uuid.uuid4(), parent_id, organization_id)

        unit = OrganizationalUnit(
            organization_id=organization_id,
            type_id=type_id,
            name=name,
            code=code,
            parent_id=parent_id,
            short_name=short_name,
            description=description,
        )
        self.db.add(unit)
        self.db.flush()
        return unit

    def move_unit(self, unit_id: uuid.UUID, new_parent_id: uuid.UUID | None) -> None:
        """Move a unit to a new parent."""
        unit = self.db.get(OrganizationalUnit, unit_id)
        if unit is None:
            raise UnitNotFoundError(f"Unit {unit_id} not found.")

        self.hierarchy.validate_parent(
            unit_id, new_parent_id, unit.organization_id
        )

        unit.parent_id = new_parent_id
        self.db.flush()

    def deactivate_unit(self, unit_id: uuid.UUID) -> None:
        """Deactivate a unit (soft delete)."""
        unit = self.db.get(OrganizationalUnit, unit_id)
        if unit is None:
            raise UnitNotFoundError(f"Unit {unit_id} not found.")

        unit.is_active = False
        unit.status = UnitStatus.INACTIVE
        self.db.flush()

    def get_user_assignments(self, user_id: uuid.UUID) -> list[UserAssignment]:
        """Get all active assignments for a user."""
        return list(
            self.db.scalars(
                select(UserAssignment).where(
                    UserAssignment.user_id == user_id,
                    UserAssignment.status == "ACTIVE",
                )
            )
        )

    def get_user_primary_assignment(
        self, user_id: uuid.UUID
    ) -> UserAssignment | None:
        """Get the primary assignment for a user."""
        return self.db.scalar(
            select(UserAssignment).where(
                UserAssignment.user_id == user_id,
                UserAssignment.is_primary == True,  # noqa: E712
                UserAssignment.status == "ACTIVE",
            )
        )

    def get_user_context(self, user_id: uuid.UUID) -> OrganizationContext:
        """Get the full organizational context for a user."""
        assignments = self.get_user_assignments(user_id)
        if not assignments:
            return OrganizationContext()

        primary = None
        units = []
        for assignment in assignments:
            unit = self.db.get(
                OrganizationalUnit, assignment.organizational_unit_id
            )
            if unit is not None and unit.is_active:
                units.append(unit)
                if assignment.is_primary:
                    primary = unit

        organization = None
        if primary is not None:
            organization = self.db.get(Organization, primary.organization_id)

        return OrganizationContext(
            organization=organization,
            primary_unit=primary,
            units=units,
        )
