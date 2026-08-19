"""Enum de âmbito de organização para autorização futura a nível de recurso."""

import enum


class OrganizationScope(enum.StrEnum):
    """Níveis de âmbito para controlo de acesso a recursos.

    Este enum define os diferentes níveis de acesso organizacional.
    A implementação completa será feita na SPRINT-02.
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
