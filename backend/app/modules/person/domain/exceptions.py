"""Person domain exceptions."""


class PersonError(Exception):
    """Base person error."""


class PersonNotFoundError(PersonError):
    """Person not found."""


class DuplicatePersonNumberError(PersonError):
    """Person number already exists."""


class DuplicateEmployeeNumberError(PersonError):
    """Employee number already exists."""


class PersonAlreadyLinkedError(PersonError):
    """Person is already linked to a user."""


class PersonDeactivatedError(PersonError):
    """Operation not allowed on a deactivated person."""
