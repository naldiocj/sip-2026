"""Rótulos humanizados para entidades de pessoa."""

from app.modules.person.domain.person import (
    EmploymentStatus,
    PersonalStatus,
    PersonStatus,
)

PERSON_STATUS_LABELS: dict[PersonStatus, str] = {
    PersonStatus.ACTIVE: "Activo",
    PersonStatus.INACTIVE: "Inactivo",
    PersonStatus.RETIRED: "Reformado",
    PersonStatus.DECEASED: "Falecido",
    PersonStatus.UNKNOWN: "Desconhecido",
}

PERSONAL_STATUS_LABELS: dict[PersonalStatus, str] = {
    PersonalStatus.CIVIL_SERVANT: "Funcionário Público",
    PersonalStatus.EXTERNAL: "Externo",
    PersonalStatus.OTHER: "Outro",
}

EMPLOYMENT_STATUS_LABELS: dict[EmploymentStatus, str] = {
    EmploymentStatus.EMPLOYED: "Empregado",
    EmploymentStatus.ON_LEAVE: "Licença",
    EmploymentStatus.SUSPENDED: "Suspenso",
    EmploymentStatus.TERMINATED: "Terminado",
    EmploymentStatus.NOT_APPLICABLE: "Não aplicável",
}


def humanize_person_status(status: str | PersonStatus) -> str:
    """Rótulo legível por humanos para um estado de pessoa."""
    return PERSON_STATUS_LABELS.get(PersonStatus(status), str(status))


def humanize_personal_status(status: str | PersonalStatus) -> str:
    """Rótulo legível por humanos para um estado pessoal."""
    return PERSONAL_STATUS_LABELS.get(PersonalStatus(status), str(status))


def humanize_employment_status(status: str | EmploymentStatus) -> str:
    """Rótulo legível por humanos para um estado de emprego."""
    return EMPLOYMENT_STATUS_LABELS.get(EmploymentStatus(status), str(status))
