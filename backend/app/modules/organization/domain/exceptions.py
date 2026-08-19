"""Excepções do domínio de organização."""


class OrganizationError(Exception):
    """Erro base de organização."""


class UnitNotFoundError(OrganizationError):
    """Unidade organizacional não encontrada."""


class OrganizationNotFoundError(OrganizationError):
    """Organização não encontrada."""


class CircularHierarchyError(OrganizationError):
    """Detectada referência circular na hierarquia."""


class SelfParentError(OrganizationError):
    """Uma unidade não pode ser pai de si própria."""


class CrossOrganizationError(OrganizationError):
    """Não é possível atribuir pai de outra organização."""


class InvalidParentError(OrganizationError):
    """A unidade pai não existe ou está inactiva."""


class DuplicateCodeError(OrganizationError):
    """O código da unidade já existe nesta organização."""


class MultiplePrimaryAssignmentError(OrganizationError):
    """O utilizador já possui uma atribuição principal. Desactivar a existente primeiro."""


class AssignmentNotFoundError(OrganizationError):
    """Atribuição de utilizador não encontrada."""


class InvalidAssignmentPeriodError(OrganizationError):
    """Período da atribuição inválido (fim antes do início)."""


class InactiveUnitAssignmentError(OrganizationError):
    """Não é possível atribuir um utilizador a uma unidade inactiva."""


class ResponsibilityNotFoundError(OrganizationError):
    """Responsabilidade não encontrada."""


class InvalidResponsibilityError(OrganizationError):
    """Responsabilidade inválida (âmbito exige unidade, período inválido)."""


class DelegationNotFoundError(OrganizationError):
    """Delegação não encontrada."""


class InvalidDelegationError(OrganizationError):
    """Delegação inválida (auto-delegação, período inválido, sobreposição)."""


class OverlappingDelegationError(InvalidDelegationError):
    """Já existe uma delegação activa sobreposta."""


class SubstitutionNotFoundError(OrganizationError):
    """Substituição não encontrada."""


class InvalidSubstitutionError(OrganizationError):
    """Substituição inválida (auto-substituição, período inválido)."""
