# TASK-007 — Audit + Integrity Validation

## Skills
- security-and-hardening
- test-driven-development

## Objective

Add audit events for organizational operations and integrity validations.

## Scope

- Audit events: ORGANIZATION_CREATED, ORGANIZATION_UPDATED, UNIT_CREATED, UNIT_UPDATED, UNIT_MOVED, UNIT_DEACTIVATED, USER_ASSIGNED, USER_UNASSIGNED, SCOPE_CHANGED
- Integrity validations: self-parent, cycles, invalid parent, cross-organization, multiple primary units
- Domain exceptions

## Acceptance Criteria

- [ ] All audit event types defined
- [ ] Integrity validations in domain layer
- [ ] AuditService integration
- [ ] Proper error messages

## Dependencies

- TASK-001, TASK-002, TASK-003

## Files

- `backend/app/modules/organization/domain/exceptions.py`
- `backend/app/modules/organization/application/audit.py`
- Update domain entities with validation
