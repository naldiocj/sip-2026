# Organization Model — Architecture

## Overview

The organizational model represents the institutional hierarchy of the SIP. It enables:

- Placing users within organizational units
- Determining responsibility scope
- Future authorization based on organizational context

## Entities

### Organization

Represents the main institutional organization (e.g., SIC).

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| code | String(50) | Unique code |
| name | String(255) | Full name |
| short_name | String(100) | Short name |
| description | Text | Optional description |
| organization_type | String(20) | OrganizationType (INTERNAL/EXTERNAL/OTHER) |
| status | String(20) | ACTIVE/INACTIVE |
| is_active | Boolean | Active flag |

### OrganizationalUnit

Represents a unit within the organization hierarchy.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| parent_id | UUID | FK to self (hierarchy) |
| type_id | String(30) | Unit type code |
| code | String(50) | Optional unique code |
| name | String(255) | Unit name |
| short_name | String(100) | Short name |
| description | Text | Optional description |
| status | String(20) | ACTIVE/INACTIVE |
| is_active | Boolean | Active flag |
| sort_order | Integer | Optional sort order |

### UnitType (Enum)

| Code | Label |
|------|-------|
| ORGANIZATION | Organização |
| DIRECTION | Direcção |
| DEPARTMENT | Departamento |
| SECTION | Secção |
| UNIT | Unidade |
| PIQUETE | Piquete |
| OTHER | Outra Unidade |

### UserAssignment

Links users to organizational units.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| organizational_unit_id | UUID | FK to organizational_units |
| assignment_type | String(30) | Assignment type |
| is_primary | Boolean | Primary unit flag |
| start_date | Date | Optional start date |
| end_date | Date | Optional end date |
| status | String(20) | ACTIVE/INACTIVE |

### AssignmentType (Enum)

| Code | Label |
|------|-------|
| PRIMARY | Principal |
| SECONDARY | Secundária |
| TEMPORARY | Temporária |
| ACTING | Interino |
| DELEGATED | Delegada |

## Hierarchy

The hierarchy uses `parent_id` (adjacency list) for flexible tree structures:

```
Organization (SIC)
├── Direction (DIR-INV)
│   ├── Department (DEP-IC)
│   │   └── Section (SEC-INV)
│   └── Department (DEP-OUTRO)
└── Unit (SEC-GERAL)
```

### Key Properties

- **Flexible**: Not all directions must have departments
- **Extensible**: New unit types can be added without schema changes
- **Validated**: Cycle detection, self-parent prevention, cross-organization checks

### OrganizationType (Enum)

| Code | Label |
|------|-------|
| INTERNAL | Interna |
| EXTERNAL | Externa |
| OTHER | Outra |

The organization type distinguishes internal institutional structures from
external ones.

## Services

### HierarchyService

- `get_parent(unit_id)` — Direct parent
- `get_children(unit_id)` — Direct children
- `get_ancestors(unit_id)` — All ancestors to root
- `get_descendants(unit_id)` — All descendants recursively
- `get_root(unit_id)` — Root unit
- `get_unit_path(unit_id)` — Full path from root
- `validate_parent(unit_id, parent_id, org_id)` — Validate parent assignment

### OrganizationService

- CRUD for organizations and units
- `get_user_context(user_id)` — Full organizational context
- `get_user_assignments(user_id)` — User's assignments
- `get_user_primary_assignment(user_id)` — Primary assignment
- `get_user_responsibility_scopes(user_id)` — User's responsibility scopes
- `get_user_functional_roles(user_id)` — User's functional role codes
- `get_user_delegation_data(user_id)` — Delegator scopes, delegate scopes and
  active substitutions

## Related Models

- **FunctionalRoleAssignment** — institutional function in a unit with a
  validity period (distinct from Profile, see functional_role.py).
- **UserAssignment** — placement of a user in a unit (see assignment-model.md).
- **Responsibility** — scope of responsibility granted (see responsibility-model.md).
- **Delegation / Substitution** — temporary transfers (see delegation-model.md
  and ADR-005).

## Design Decisions

1. **Profile ≠ Organization**: Profiles define capabilities, organizations define context
2. **Permission ≠ Scope**: Permissions control access, scope limits data visibility
3. **Scope ≠ Ownership**: Scope is organizational, ownership is resource-level
4. **Flexible hierarchy**: Adjacency list pattern allows different structures per direction
5. **Soft delete**: Units are deactivated, not deleted, preserving history
6. **Function ≠ Profile**: FunctionalRoleAssignment describes the institutional
   function; Profile describes SIP permissions
