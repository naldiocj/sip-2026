"""Organization domain exceptions."""


class OrganizationError(Exception):
    """Base organization error."""


class UnitNotFoundError(OrganizationError):
    """Organizational unit not found."""


class OrganizationNotFoundError(OrganizationError):
    """Organization not found."""


class CircularHierarchyError(OrganizationError):
    """Circular reference in hierarchy detected."""


class SelfParentError(OrganizationError):
    """Unit cannot be its own parent."""


class CrossOrganizationError(OrganizationError):
    """Cannot assign parent from different organization."""


class InvalidParentError(OrganizationError):
    """Parent unit does not exist or is inactive."""


class DuplicateCodeError(OrganizationError):
    """Unit code already exists in this organization."""


class MultiplePrimaryAssignmentError(OrganizationError):
    """User already has a primary assignment. Deactivate existing first."""


class AssignmentNotFoundError(OrganizationError):
    """User assignment not found."""
