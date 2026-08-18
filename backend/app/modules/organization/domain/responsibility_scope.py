"""Responsibility scope enum."""

import enum


class ResponsibilityScope(enum.StrEnum):
    """Scope levels for user responsibility.

    Defines the breadth of data a user can access.
    """

    GLOBAL = "GLOBAL"
    ORGANIZATION = "ORGANIZATION"
    DIRECTION = "DIRECTION"
    DEPARTMENT = "DEPARTMENT"
    SECTION = "SECTION"
    OWN = "OWN"
    ASSIGNED = "ASSIGNED"
    PIQUETE = "PIQUETE"
    PGR = "PGR"


RESPONSIBILITY_SCOPE_LABELS: dict[ResponsibilityScope, str] = {
    ResponsibilityScope.GLOBAL: "Global",
    ResponsibilityScope.ORGANIZATION: "Organização",
    ResponsibilityScope.DIRECTION: "Direcção",
    ResponsibilityScope.DEPARTMENT: "Departamento",
    ResponsibilityScope.SECTION: "Secção",
    ResponsibilityScope.OWN: "Próprio",
    ResponsibilityScope.ASSIGNED: "Atribuído",
    ResponsibilityScope.PIQUETE: "Piquete",
    ResponsibilityScope.PGR: "PGR",
}
