# Delegation Model — Architecture

## Overview

The delegation model answers: **who temporarily carries a responsibility on
behalf of whom?** A delegation transfers a specific responsibility (scope,
optionally unit-scoped) from a delegator to a delegate for a defined period.

Delegation is deliberately distinct from substitution: delegation transfers
a **responsibility**, substitution transfers a **function** (see ADR-005).

## Entity

### Delegation

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| delegator_user_id | UUID | FK to users (who delegates) |
| delegate_user_id | UUID | FK to users (who receives) |
| scope | String(30) | ResponsibilityScope |
| organizational_unit_id | UUID | Optional FK to organizational_units |
| start_date | Date | Optional |
| end_date | Date | Optional |
| reason | Text | Optional justification |
| status | String(20) | DelegationStatus |
| is_active | Boolean | Active flag |

### DelegationStatus (Enum)

- `ACTIVE` — in force
- `REVOKED` — revoked by an administrator
- `EXPIRED` — past its end date

## Business Rules

- A user **cannot delegate to themselves** (`InvalidDelegationError`).
- **Overlapping delegations** of the same scope+unit to the same delegate are
  rejected (`OverlappingDelegationError`).
- Revocation is a soft transition (`ACTIVE` → `REVOKED`); history is preserved.

## Service — DelegationService

| Method | Purpose |
|--------|---------|
| `create(...)` | Create a delegation (scope + unit + period + reason) |
| `revoke(id)` | Soft-revoke the delegation |
| `get(id)` | Fetch by ID |
| `list_for_user(user_id, as_delegator)` | Delegations as delegator or delegate |
| `list_active()` | Active delegations |

## API

- `GET /api/v1/delegations` — list (optionally `?user_id=&as_delegator=`)
- `GET /api/v1/delegations/{id}` — fetch
- `POST /api/v1/delegations` — create (permission `delegation.manage`)
- `POST /api/v1/delegations/{id}/revoke` — soft revoke

## Design Decisions

1. **Transfer of responsibility**: the delegate acts within the delegated
   scope; the delegator's own scope is untouched.
2. **Overlap prevention**: duplicate grants for the same scope/unit are
   rejected to avoid ambiguous authority.
3. **History preserved**: revoked delegations remain visible for audit.