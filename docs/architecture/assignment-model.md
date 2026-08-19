# Assignment Model — Architecture

## Overview

The assignment model links users to organizational units. An assignment
answers: **where does a user work?** It is distinct from a responsibility
(what the user can do) and from a functional role (the function exercised
in the institution).

## Entity

### UserAssignment

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| organizational_unit_id | UUID | FK to organizational_units |
| assignment_type | String(30) | AssignmentType |
| is_primary | Boolean | Primary unit flag |
| start_date | Date | Optional start date |
| end_date | Date | Optional end date |
| status | String(20) | ACTIVE / INACTIVE |

### AssignmentType (Enum)

| Code | Label |
|------|-------|
| PRIMARY | Principal |
| SECONDARY | Secundária |
| TEMPORARY | Temporária |
| ACTING | Interino |
| DELEGATED | Delegada |

### AssignmentStatus (Enum)

- `ACTIVE` — currently in force
- `INACTIVE` — ended (history preserved)

## Business Rules

- A user can have **at most one active primary assignment**; a second primary
  raises `MultiplePrimaryAssignmentError`.
- A valid period requires `end_date >= start_date` when both are present.
- Ending an assignment is a soft transition (`ACTIVE` → `INACTIVE`); rows are
  never deleted, preserving history.

## Service — AssignmentService

| Method | Purpose |
|--------|---------|
| `create(...)` | Create an assignment with type, period and primary flag |
| `update(...)` | Update type/period (never deletes) |
| `end(id)` | Soft-end the assignment |
| `get(id)` | Fetch by ID |
| `get_primary(user_id)` | Active primary assignment of a user |
| `list_for_user(user_id, include_inactive)` | Assignments of a user |

## API

- `POST /api/v1/users/{user_id}/assignments` — create
- `GET /api/v1/users/{user_id}/assignments` — list
- `PATCH /api/v1/users/{user_id}/assignments/{assignment_id}` — update
- `POST /api/v1/users/{user_id}/assignments/{assignment_id}/end` — soft end

## Design Decisions

1. **Placement vs. permission**: assignment describes where; scope describes
   what (see ADR-004).
2. **History is preserved**: no hard deletes on assignments.
3. **Primary uniqueness** is enforced at the service layer, not the schema,
   to keep active-flag logic explicit.