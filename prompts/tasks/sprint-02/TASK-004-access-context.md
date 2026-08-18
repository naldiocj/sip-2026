# TASK-004 — Access Context + Authorization Integration

## Skills
- security-and-hardening
- test-driven-development

## Objective

Create AccessContext service and integrate organization scope into authorization.

## Scope

- AccessContext service (user, profile, organization, primary_unit, units, responsibility_scope)
- Update AuthorizationService to consider organizational scope
- Update /auth/me endpoint to include organization context

## Acceptance Criteria

- [ ] AccessContext service
- [ ] AuthorizationService considers org scope
- [ ] /me endpoint includes organization context
- [ ] Security: no global access without explicit permission

## Dependencies

- TASK-001, TASK-002, TASK-003

## Files

- `backend/app/modules/organization/application/access_context.py`
- `backend/app/modules/auth/application/authorization.py` (update)
- `backend/app/modules/auth/api/router.py` (update /me)
