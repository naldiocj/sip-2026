# Access Context — Architecture

## Overview

`AccessContext` resolves what organizational data a user can access. It combines:

- User identity and username
- The associated person (public data only)
- Profiles and derived permissions
- Organizational placement (organization, primary unit, units)
- Responsibility scopes
- Functional roles
- Delegation data (delegator/delegate scopes, active substitutions)

It is a **query object** — it contains no business logic.

## AccessContext Structure

```python
@dataclass
class AccessContext:
    user_id: UUID
    username: str
    organization: OrganizationContext | None
    person: dict | None            # public person data only
    profiles: list[str]
    permissions: list[str]
    responsibility_scopes: list[str]
    functional_roles: list[str]
    delegator_scopes: list[str]
    delegate_scopes: list[str]
    substitutions: list[UUID]
    assignments: list[UserAssignment]
    responsibilities: list[Responsibility]
    delegations: list[Delegation]
```

### OrganizationContext

```python
@dataclass
class OrganizationContext:
    organization: Organization | None
    primary_unit: OrganizationalUnit | None
    units: list[OrganizationalUnit]
```

### Derived properties

| Property | Description |
|----------|-------------|
| `primary_unit_id` | ID of the primary unit (or None) |
| `organization_id` | ID of the organization (or None) |
| `unit_ids` | IDs of all units the user belongs to |
| `effective_scopes` | Own scopes ∪ delegated (delegate) scopes |
| `humanized_scopes` | Human-readable labels of effective scopes |

## Scope Engine

`ScopeEngine` centralizes authorization scope resolution:

- `can_access_scope(context, scope)` — can the user act under a scope?
  Organization-wide scopes (DIRECTION) require the scope to be present in the
  effective scopes.
- `can_access_unit(context, unit_id)` — can the user access a unit? Granted
  directly when the unit is in `unit_ids`, or when the primary unit implies
  subtree access via the hierarchy.
- `resolve_effective_scope(context, requested_scope)` — convenience wrapper
  over `can_access_scope`.
- `get_effective_responsibilities(context)` — human-readable effective scopes.

Resolve order (most specific wins):

1. Organization-wide scopes (DIRECTION) grant full org access.
2. Unit-scoped scopes (DEPARTMENT/SECTION/UNIT/PIQUETE) grant access to the
   unit subtree.
3. Delegated scopes grant access as the delegator.
4. Substitutions grant access in place of the substituted user.

## Usage in Authorization

Authorization evaluates:

```
Permission + Profile + Organizational Scope + Ownership + Assignment
```

### Example: Instrutor Processual

- **Profile**: INSTRUTOR_PROCESSUAL
- **Permission**: process.read
- **Scope**: OWN/ASSIGNED
- **Result**: Can only see own/assigned processes

### Example: Chefe de Secção

- **Profile**: CHEFE_SECCAO
- **Permission**: process.read
- **Scope**: SECTION
- **Result**: Can see all processes in their section

## API Endpoints

### `GET /api/v1/me/organization-context`

Legacy minimal context (organization, primary unit, units, scopes).

### `GET /api/v1/me/context`

Full context: user, person, profiles, permissions, organization, assignments,
responsibilities, delegations, scopes and effective scopes. Never exposes
passwords or tokens.

## Implementation Notes

- `AccessContextService.get_context(user)` resolves the full context.
- The primary unit is used as default context.
- Multiple units allow cross-unit access when authorized.
- Effective scopes are the union of own and delegated scopes, used by the
  ScopeEngine for authorization decisions.