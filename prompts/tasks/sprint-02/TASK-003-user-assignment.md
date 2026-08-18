# TASK-003 — User Assignment + Responsibility Scope

## Skills
- test-driven-development
- incremental-implementation

## Objective

Create UserAssignment and ResponsibilityScope entities.

## Scope

- UserAssignment entity (user_id, organizational_unit_id, assignment_type, is_primary, start_date, end_date, status)
- AssignmentType enum (PRIMARY, SECONDARY, TEMPORARY, ACTING, DELEGATED)
- ResponsibilityScope entity or enum integration
- Association table: user_assignments

## Acceptance Criteria

- [ ] UserAssignment entity
- [ ] AssignmentType enum
- [ ] ResponsibilityScope values (GLOBAL, ORGANIZATION, DIRECTION, DEPARTMENT, SECTION, OWN, ASSIGNED, PIQUETE, PGR)
- [ ] Primary unit constraint (max 1 primary per user)
- [ ] Status fields (ACTIVE, INACTIVE)

## Dependencies

- TASK-001

## Files

- `backend/app/modules/organization/domain/user_assignment.py`
- `backend/app/modules/organization/domain/responsibility_scope.py`
- Update `backend/app/modules/organization/domain/__init__.py`
