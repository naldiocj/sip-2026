"""ResponsibilityScope enum — âmbito de responsabilidade.

Define o tipo de responsabilidade que um utilizador pode exercer.
Scopes de direção/gestão exigem unidade organizacional.
"""

import enum


class ResponsibilityScope(enum.StrEnum):
    """Tipo de âmbito de responsabilidade."""

    DIRECTION = "DIRECTION"
    DEPARTMENT = "DEPARTMENT"
    SECTION = "SECTION"
    UNIT = "UNIT"
    PIQUETE = "PIQUETE"
    PROCESS_MANAGEMENT = "PROCESS_MANAGEMENT"
    DOCUMENT_MANAGEMENT = "DOCUMENT_MANAGEMENT"


RESPONSIBILITY_SCOPE_LABELS: dict[ResponsibilityScope, str] = {
    ResponsibilityScope.DIRECTION: "Direção",
    ResponsibilityScope.DEPARTMENT: "Departamento",
    ResponsibilityScope.SECTION: "Secção",
    ResponsibilityScope.UNIT: "Unidade",
    ResponsibilityScope.PIQUETE: "Piquete",
    ResponsibilityScope.PROCESS_MANAGEMENT: "Gestão de Processos",
    ResponsibilityScope.DOCUMENT_MANAGEMENT: "Gestão de Documentos",
}
