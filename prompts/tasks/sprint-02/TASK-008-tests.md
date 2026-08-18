# TASK-008 — Tests (Backend + Frontend + E2E)

## Skills
- test-driven-development

## Objective

Comprehensive tests for the organizational module.

## Scope

- Backend: Organization CRUD, hierarchy, user assignment, integrity, authorization
- Frontend: OrganizationTree, unit forms, assignment UI
- E2E: Admin login → create direction → create department → create section → assign user → view context

## Acceptance Criteria

- [ ] Backend unit tests for all domain logic
- [ ] Backend integration tests for API
- [ ] Frontend component tests
- [ ] E2E flow tests
- [ ] Negative tests (403 for unauthorized)
- [ ] All tests passing

## Dependencies

- TASK-001 through TASK-007

## Files

- `backend/tests/modules/organization/`
- `frontend/src/__tests__/organization/`
- `frontend/e2e/organization.spec.ts`
