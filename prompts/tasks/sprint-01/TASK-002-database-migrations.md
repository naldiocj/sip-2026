# TASK-002 — Database Migrations

## Status

DONE

## Objective

Create Alembic migrations for all auth-related entities.

## Scope

- User table migration
- Profile table migration
- Permission table migration
- Association tables migration
- Seed data script

## Dependencies

- TASK-001 complete

## Implementation

### Migration Tables

1. `users` - User entity
2. `profiles` - Profile definitions
3. `permissions` - Permission definitions
4. `user_profiles` - User-Profile association
5. `profile_permissions` - Profile-Permission association

### Seed Data

Create development seed with:

- 1 Administrator (admin/admin123)
- 1 Director
- 1 Secretary General
- 1 Department Head
- 1 Section Head
- 1 Instructional Officer
- 1 Piquete Agent
- 1 Document Editor
- 1 PGR Agent

All with DEV ONLY credentials clearly marked.

## Acceptance Criteria

- [ ] Migrations versioned and reversible
- [ ] All tables created correctly
- [ ] Indexes on frequently queried columns
- [ ] Seed script works
- [ ] No manual schema changes

## Tests

- Migration up/down tests
- Seed data verification

## Definition of Done

- Migrations created and tested
- Seed script functional
- All tests passing
