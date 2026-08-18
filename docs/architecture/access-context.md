# Access Context — Architecture

## Overview

AccessContext resolves what organizational data a user can access. It combines:

- User identity
- Organizational placement (units)
- Responsibility scope

## AccessContext Structure

```python
@dataclass
class AccessContext:
    user_id: UUID
    username: str
    organization: OrganizationContext | None
    responsibility_scopes: list[str]
```

### OrganizationContext

```python
@dataclass
class OrganizationContext:
    organization: Organization | None
    primary_unit: OrganizationalUnit | None
    units: list[OrganizationalUnit]
```

## Usage in Authorization

Future authorization will evaluate:

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

## API Endpoint

`GET /api/v1/me/organization-context`

Returns:

```json
{
  "organization": { "id": "...", "code": "SIC", "name": "..." },
  "primary_unit": { "id": "...", "name": "Direcção de Investigação" },
  "units": [...],
  "responsibility_scopes": []
}
```

## Implementation Notes

- AccessContext is resolved per-request via the AccessContextService
- The primary unit is used as default context
- Multiple units allow cross-unit access when authorized
- Responsibility scopes are prepared for future authorization rules
