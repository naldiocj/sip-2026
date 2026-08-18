# TASK-001 — Organization Domain Entities

## Skills
- spec-driven-development
- test-driven-development

## Objective

Create the foundational domain entities for the organizational model: Organization, OrganizationalUnit, OrganizationalUnitType.

## Scope

- Organization entity (id, code, name, short_name, description, status)
- OrganizationalUnitType enum and entity
- OrganizationalUnit entity (id, organization_id, parent_id, type_id, code, name, short_name, description, status)
- Association tables if needed
- Humanized labels

## Acceptance Criteria

- [ ] Organization entity with all fields
- [ ] OrganizationalUnitType enum (ORGANIZATION, DIRECTION, DEPARTMENT, SECTION, UNIT, PIQUETE, OTHER)
- [ ] OrganizationalUnit entity with hierarchy support (parent_id)
- [ ] Status enums (ACTIVE, INACTIVE)
- [ ] Humanized labels in Portuguese
- [ ] Domain __init__.py exports

## Files

- `backend/app/modules/organization/__init__.py`
- `backend/app/modules/organization/domain/__init__.py`
- `backend/app/modules/organization/domain/organization.py`
- `backend/app/modules/organization/domain/unit.py`
- `backend/app/modules/organization/domain/unit_type.py`
- `backend/app/modules/organization/domain/humanize.py`
