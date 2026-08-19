# TASK-005 — organization-domain

## Objective

Expandir o domínio Organization com `organization_type` (INTERNAL/EXTERNAL).

## Context

A SPRINT-02 anterior criou Organization/OrganizationalUnit/UnitType/UserAssignment. Falta `organization_type` para representar SIC (INTERNAL) e entidades externas (PGR, outras).

## Dependencies

- SPRINT-02 anterior (Organization já existe)

## Skills

- spec-driven-development
- test-driven-development
- incremental-implementation

## Scope

- `OrganizationType` (INTERNAL, EXTERNAL) + labels.
- Coluna `organization_type` em organizations (default INTERNAL).
- Actualização do OrganizationService (create) e schemas.
- Testes.

## Out of Scope

- Interoperabilidade PGR (NÃO implementar agora).

## Implementation

1. Enum OrganizationType + labels em `domain/organization.py` ou humanize.
2. Migration adicionando coluna com default.
3. Service/schema actualizados.
4. Seed define SIC como INTERNAL.

## Acceptance Criteria

- [ ] organization_type persistido.
- [ ] Humanização disponível.
- [ ] Seed actualizado.

## Tests

- [ ] Criação com tipo.
- [ ] Default INTERNAL.
- [ ] Humanização.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(org): add organization types`