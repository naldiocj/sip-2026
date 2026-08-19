# Person Model — Architecture

## Overview

The Person model represents real people inside the SIP, **independent of authentication users**. It separates personal identity from system access:

- A **Person** is a real human (name, BI, contact data, employment status).
- A **User** is an authentication identity (username, password, profile, permissions).
- A Person **may** be linked to a User (1:1), but not every Person is a User.

This separation is a core decision — see [ADR-002](../adr/ADR-002-person-ne-user.md).

## Entities

### Person

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| person_number | String(9) | Internal sequential number `PES-000001` (unique, immutable) |
| full_name | String(200) | Full legal name |
| preferred_name | String(100) | Preferred/common name |
| birth_date | Date | Date of birth |
| gender | String(20) | Gender |
| document_type | String(30) | Document type (e.g. BI, Passport) |
| document_number | String(50) | Document number (never a primary key) |
| document_issuer | String(50) | Issuing authority |
| nif | String(20) | Tax number |
| nationality | String(50) | Nationality |
| email | String(200) | Personal email |
| phone | String(30) | Personal phone |
| work_email | String(200) | Institutional email |
| work_phone | String(30) | Institutional phone |
| job_title | String(100) | Current job title |
| department | String(100) | Functional department |
| employment_status | EmploymentStatus | e.g. ACTIVE, ON_LEAVE, INACTIVE |
| status | PersonStatus | Lifecycle: ACTIVE, INACTIVE |
| is_active | Boolean | Active flag (soft delete) |

### Relationships

- `Person.user` (1:1, optional) — via `users.person_id` FK (`fk_users_person_id`, `ON DELETE SET NULL`).
- A User can be associated to at most one Person; a Person to at most one User.

## Number Generation

`PersonNumberGenerator` produces sequential `PES-NNNNNN` numbers. The generator:

1. Reads the current maximum `person_number` in the table.
2. Increments the numeric suffix (padded to 6 digits).
3. Is resilient to pre-existing seed data (parses existing suffixes).

The number is generated inside the service transaction; no database sequence is used.

## Lifecycle

- **Create** → status ACTIVE, assigned `person_number`.
- **Update** → personal or functional data changes; `person_number` never changes.
- **Deactivate** → soft delete (`is_active=False`, status INACTIVE); history preserved.
- **Link/Unlink User** → `associate_user_to_person` / `unlink_user_from_person` manage the 1:1 binding with integrity checks.

## Validation Rules

- `person_number` must be unique.
- `document_number` is sensitive PII — stored but never exposed in list endpoints.
- A User cannot be linked to a second Person while it already has one.
- A Person cannot be deactivated while active assignments exist (enforced by callers).

## Service

`PersonService` (`app/modules/person/application/person_service.py`):

- `create`, `update`, `deactivate`
- `list` / `search` with pagination and filters
- `associate_user_to_person`, `unlink_user_from_person`
- `get_by_user_id` (used by access context)

## API

`GET/POST/PATCH /api/v1/persons` — CRUD; sensitive fields (document_number, nif) excluded from list responses.

## Implementation Notes

- Person lives in its own module (`app/modules/person/`) — domain/application split.
- The `person_id` column on `users` is registered in Alembic via the person domain import in `alembic/env.py`.
- Person data is *personal*; functional data (assignments, responsibilities) lives in the organization module and references `users.id`.