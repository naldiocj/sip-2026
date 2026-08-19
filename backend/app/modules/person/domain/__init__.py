"""Person domain layer."""

from app.modules.person.domain.humanize import (
    EMPLOYMENT_STATUS_LABELS,
    PERSON_STATUS_LABELS,
    PERSONAL_STATUS_LABELS,
    humanize_employment_status,
    humanize_person_status,
    humanize_personal_status,
)
from app.modules.person.domain.person import (
    EmploymentStatus,
    Person,
    PersonalStatus,
    PersonStatus,
)

__all__ = [
    "Person",
    "PersonStatus",
    "PersonalStatus",
    "EmploymentStatus",
    "PERSON_STATUS_LABELS",
    "PERSONAL_STATUS_LABELS",
    "EMPLOYMENT_STATUS_LABELS",
    "humanize_person_status",
    "humanize_personal_status",
    "humanize_employment_status",
]
