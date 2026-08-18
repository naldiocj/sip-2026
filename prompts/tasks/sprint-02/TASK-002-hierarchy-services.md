# TASK-002 — Organizational Hierarchy + Services

## Skills
- test-driven-development
- incremental-implementation

## Objective

Implement hierarchy operations and the OrganizationService + HierarchyService.

## Scope

- HierarchyService with tree operations (get_parent, get_children, get_ancestors, get_descendants, get_root, get_unit_path)
- OrganizationService (get_unit, get_hierarchy, validate_relation, get_context, get_user_units)
- Integrity validations (self-parent, cycles, invalid parent, cross-organization)

## Acceptance Criteria

- [ ] HierarchyService with all tree operations
- [ ] OrganizationService with core operations
- [ ] Cycle detection
- [ ] Self-parent prevention
- [ ] Cross-organization validation
- [ ] Unit path generation

## Dependencies

- TASK-001

## Files

- `backend/app/modules/organization/application/__init__.py`
- `backend/app/modules/organization/application/hierarchy_service.py`
- `backend/app/modules/organization/application/organization_service.py`
- `backend/app/modules/organization/domain/exceptions.py`
