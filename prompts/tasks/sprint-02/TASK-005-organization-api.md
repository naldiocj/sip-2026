# TASK-005 — Organization API Endpoints

## Skills
- api-and-interface-design
- test-driven-development

## Objective

Create admin API endpoints for organizations, units, and user assignments.

## Scope

- GET/POST /api/v1/organizations
- GET/POST /api/v1/organizational-units
- GET/PATCH /api/v1/organizational-units/{id}
- GET/POST /api/v1/users/{id}/assignments
- GET /api/v1/me/organization-context
- Pydantic schemas for request/response
- RBAC protection

## Acceptance Criteria

- [ ] All endpoints functional
- [ ] Proper RBAC (organization.manage, organization.read)
- [ ] Pydantic schemas
- [ ] Error handling
- [ ] Audit logging

## Dependencies

- TASK-001, TASK-002, TASK-003, TASK-004

## Files

- `backend/app/modules/organization/api/__init__.py`
- `backend/app/modules/organization/api/router.py`
- `backend/app/modules/organization/api/schemas.py`
- `backend/app/modules/organization/api/dependencies.py`
- Update `backend/app/api/v1/router.py`
