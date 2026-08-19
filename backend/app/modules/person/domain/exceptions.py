"""Excepções do domínio de pessoa."""


class PersonError(Exception):
    """Erro base de pessoa."""


class PersonNotFoundError(PersonError):
    """Pessoa não encontrada."""


class DuplicatePersonNumberError(PersonError):
    """O número de pessoa já existe."""


class DuplicateEmployeeNumberError(PersonError):
    """O número de funcionário já existe."""


class PersonAlreadyLinkedError(PersonError):
    """A pessoa já está associada a um utilizador."""


class PersonDeactivatedError(PersonError):
    """Operação não permitida numa pessoa desactivada."""
