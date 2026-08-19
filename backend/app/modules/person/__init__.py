"""Person module."""

from app.modules.person.domain.humanize import (
    PERSON_STATUS_LABELS,
    PERSONAL_STATUS_LABELS,
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
    "humanize_person_status",
    "humanize_personal_status",
]
