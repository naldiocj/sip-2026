"""Humanized labels for organizational entities."""

from app.modules.organization.domain.responsibility_scope import (
    RESPONSIBILITY_SCOPE_LABELS,
    ResponsibilityScope,
)
from app.modules.organization.domain.unit import UnitStatus
from app.modules.organization.domain.unit_type import UNIT_TYPE_LABELS, UnitType
from app.modules.organization.domain.user_assignment import (
    ASSIGNMENT_TYPE_LABELS,
    AssignmentStatus,
    AssignmentType,
)

UNIT_STATUS_LABELS: dict[UnitStatus, str] = {
    UnitStatus.ACTIVE: "Ativo",
    UnitStatus.INACTIVE: "Inativo",
}

ASSIGNMENT_STATUS_LABELS: dict[AssignmentStatus, str] = {
    AssignmentStatus.ACTIVE: "Ativa",
    AssignmentStatus.INACTIVE: "Inativa",
}

ORGANIZATION_STATUS_LABELS: dict[str, str] = {
    "ACTIVE": "Ativa",
    "INACTIVE": "Inativa",
}


def humanize_unit_type(code: str | UnitType) -> str:
    """Human-readable label for a unit type."""
    return UNIT_TYPE_LABELS.get(UnitType(code), str(code))


def humanize_unit_status(status: str | UnitStatus) -> str:
    """Human-readable label for a unit status."""
    return UNIT_STATUS_LABELS.get(UnitStatus(status), str(status))


def humanize_assignment_type(code: str | AssignmentType) -> str:
    """Human-readable label for an assignment type."""
    return ASSIGNMENT_TYPE_LABELS.get(AssignmentType(code), str(code))


def humanize_assignment_status(status: str | AssignmentStatus) -> str:
    """Human-readable label for an assignment status."""
    return ASSIGNMENT_STATUS_LABELS.get(AssignmentStatus(status), str(status))


def humanize_responsibility_scope(scope: str | ResponsibilityScope) -> str:
    """Human-readable label for a responsibility scope."""
    return RESPONSIBILITY_SCOPE_LABELS.get(ResponsibilityScope(scope), str(scope))


def humanize_organization_status(status: str) -> str:
    """Human-readable label for an organization status."""
    return ORGANIZATION_STATUS_LABELS.get(status, status)
