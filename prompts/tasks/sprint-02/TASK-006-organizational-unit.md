# TASK-006 — organizational-unit

## Objective

Consolidar a entidade `OrganizationalUnit` com os campos e validações exigidos.

## Context

OrganizationalUnit já existe (organization_id, parent_id, type_id, code, name, short_name, description, status, is_active, sort_order). Verificar requisitos do prompt: código único no contexto apropriado, status, etc.

## Dependencies

- SPRINT-02 anterior (OrganizationalUnit existe)

## Skills

- test-driven-development
- api-and-interface-design

## Scope

- Verificação/ajuste de constraints (unique code por organização quando aplicável).
- Índices adequados (organization_id, parent_id, type_id, status).
- Garantia: unidade pode não ter pai (raiz).
- Testes de integridade.

## Out of Scope

- Hierarchy service (TASK-007).
- UI.

## Implementation

1. Rever model atual e constraints.
2. Adicionar UniqueConstraint(organization_id, code) se adequado (código opcional).
3. Testes de criação sem pai e com pai.

## Acceptance Criteria

- [ ] Unit criável como raiz.
- [ ] Código único no contexto da organização.
- [ ] Índices presentes.

## Tests

- [ ] Criação raiz.
- [ ] Duplicação de código na mesma org rejeitada.
- [ ] Mesmo código em orgs diferentes permitido.

## Definition of Done

- [ ] Implementado
- [ ] Migration se necessário
- [ ] Testes passam
- [ ] Commit: `feat(org): consolidate organizational unit model`