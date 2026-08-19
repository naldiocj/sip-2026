# Responsibility Model — Architecture

## Overview

The responsibility model answers: **what scope of responsibility does a
user exercise?** A responsibility is a functional capability with a scope,
optionally bound to an organizational unit.

Responsibilities are distinct from assignments (placement), profiles
(permissions within the SIP) and functional roles (institutional function).

## Entity

### Responsibility

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| scope | String(30) | ResponsibilityScope |
| organizational_unit_id | UUID | Optional FK to organizational_units |
| resource_type | String(50) | Optional resource qualifier |
| start_date | Date | Optional |
| end_date | Date | Optional |
| status | String(20) | ACTIVE / ENDED |
| is_active | Boolean | Active flag |

### ResponsibilityScope (Enum)

| Code | Label | Unit required? |
|------|-------|----------------|
| DIRECTION | Direção | Yes |
| DEPARTMENT | Departamento | Yes |
| SECTION | Secção | Yes |
| UNIT | Unidade | Yes |
| PIQUETE | Piquete | Yes |
| PROCESS_MANAGEMENT | Gestão de Processos | No |
| DOCUMENT_MANAGEMENT | Gestão de Documentos | No |

Direction/management scopes require an organizational unit; creation without
one raises `InvalidResponsibilityError`.

### ResponsibilityStatus (Enum)

- `ACTIVE` — in force
- `ENDED` — ended (history preserved)

## Service — ResponsibilityService

| Method | Purpose |
|--------|---------|
| `create(...)` | Grant a responsibility (scope + optional unit/period) |
| `end(id)` | Soft-end the responsibility |
| `get(id)` | Fetch by ID |
| `list_for_user(user_id, include_inactive)` | Responsibilities of a user |

## API

- `GET /api/v1/responsibilities` — list (optionally `?user_id=`)
- `GET /api/v1/responsibilities/{id}` — fetch
- `POST /api/v1/responsibilities` — create (permission `responsibility.manage`)
- `POST /api/v1/responsibilities/{id}/end` — soft end

## Design Decisions

1. **Scope-bound grants**: a responsibility always carries a scope; unit
   scopes carry a unit (see ADR-004).
2. **History preserved**: ending a responsibility is a status transition,
   never a delete.
3. **Foundation only**: scope evaluation rules for processes/documents/piquete
   are deferred to the ScopeEngine; this model only stores grants.