"""Organization scope enum for future resource-level authorization."""

import enum


class OrganizationScope(enum.StrEnum):
    """Scope levels for resource access control.

    This enum defines the different levels of organizational access.
    Full implementation will be in SPRINT-02.
    """

    GLOBAL = "GLOBAL"
    ORGANIZATION = "ORGANIZATION"
    DIRECTION = "DIRECTION"
    DEPARTMENT = "DEPARTMENT"
    SECTION = "SECTION"
    OWN = "OWN"
    ASSIGNED = "ASSIGNED"
    PGR = "PGR"
    PIQUETE = "PIQUETE"
