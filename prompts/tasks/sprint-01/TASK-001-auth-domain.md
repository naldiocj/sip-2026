# TASK-001 — Auth Domain Model

## Status

DONE

## Objective

Create the foundational auth module with domain models: User, Profile, Permission, and their relationships.

## Scope

- Create `backend/app/modules/auth/` module structure
- Define User entity with all required fields
- Define Profile enum/entity with official profiles
- Define Permission entity with RESOURCE+ACTION pattern
- Define association tables for RBAC
- Define OrganizationScope foundation

## Dependencies

- SPRINT-00 complete
- Database base (backend/app/db/base.py)
- Alembic configured

## Implementation

### Module Structure

```
backend/app/modules/auth/
  __init__.py
  domain/
    __init__.py
    user.py          # User model
    profile.py       # Profile enum + model
    permission.py    # Permission model
    associations.py  # profile_permissions, user_profiles
    scope.py         # OrganizationScope enum
  application/
    __init__.py
  infrastructure/
    __init__.py
  api/
    __init__.py
```

### User Entity Fields

- id: UUID (primary key)
- username: str (unique, indexed)
- email: str (unique, indexed)
- password_hash: str (never exposed)
- full_name: str
- employee_number: str | None
- status: UserStatus enum
- is_active: bool
- created_at: datetime
- updated_at: datetime
- last_login_at: datetime | None

### UserStatus Enum

- ACTIVE
- INACTIVE
- BLOCKED
- PENDING

### Profile Enum (Official Profiles)

- ADMINISTRADOR_SISTEMA
- DIRECTOR
- SECRETARIA_GERAL
- CHEFE_DEPARTAMENTO
- CHEFE_SECCAO
- INSTRUTOR_PROCESSUAL
- AGENTE_PIQUETE
- EDITOR_DOCUMENTAL
- AGENTE_PGR

### Permission Entity

- id: UUID
- code: str (e.g., "process.read")
- resource: str
- action: str
- description: str | None
- is_active: bool

### Association Tables

- user_profiles (user_id, profile_id)
- profile_permissions (profile_id, permission_id)

## Acceptance Criteria

- [ ] All models created with proper types
- [ ] Enums properly defined
- [ ] Relationships configured
- [ ] password_hash never exposed in schemas
- [ ] All models use UUID primary keys
- [ ] Timestamps on all entities

## Tests

- Model instantiation tests
- Enum value tests
- Relationship tests

## Definition of Done

- All models created
- All tests passing
- Lint passing
- Typecheck passing
