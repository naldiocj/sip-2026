"""Enum OrganizationalUnitType."""

import enum


class UnitType(enum.StrEnum):
    """Tipos de unidades organizacionais."""

    ORGANIZATION = "ORGANIZATION"
    DIRECTION = "DIRECTION"
    DEPARTMENT = "DEPARTMENT"
    SECTION = "SECTION"
    UNIT = "UNIT"
    PIQUETE = "PIQUETE"
    OTHER = "OTHER"


UNIT_TYPE_LABELS: dict[UnitType, str] = {
    UnitType.ORGANIZATION: "Organização",
    UnitType.DIRECTION: "Direcção",
    UnitType.DEPARTMENT: "Departamento",
    UnitType.SECTION: "Secção",
    UnitType.UNIT: "Unidade",
    UnitType.PIQUETE: "Piquete",
    UnitType.OTHER: "Outra Unidade",
}
