# TASK-009 — Documentation + Seeds + Migrations

## Skills
- documentation-and-adrs

## Objective

Create documentation, database migration, and seed data for organizations.

## Scope

- Alembic migration for organization tables
- Seed data (SIC organization, sample units)
- Architecture docs: organization-model.md, access-context.md, responsibility-scopes.md
- ADR for organizational model decisions

## Acceptance Criteria

- [ ] Migration created and applied
- [ ] Seed data with sample organization
- [ ] Architecture documentation
- [ ] ADR for organizational model
- [ ] Lint PASS
- [ ] Typecheck PASS
- [ ] Build PASS

## Dependencies

- TASK-001 through TASK-008

## Files

- `backend/alembic/versions/` (new migration)
- `backend/scripts/seed_dev.py` (update)
- `docs/architecture/organization-model.md`
- `docs/architecture/access-context.md`
- `docs/architecture/responsibility-scopes.md`
- `docs/adr/ADR-002-organizational-model.md`
