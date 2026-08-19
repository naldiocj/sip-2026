# TASK-023 — organization-tree

## Objective

Expandir a OrganizationTree existente: expandir/recolher/seleccionar/criar/editar/mover, visualizar filhos e responsáveis, carregamento eficiente.

## Context

OrganizationTree existe no frontend (frontend/src/components/organization/organization-tree.tsx). Expandir funcionalidades e detalhe de unidade (nome, código, tipo, unidade superior, subunidades, responsáveis, utilizadores, estado).

## Dependencies

- TASK-020 (área admin)

## Skills

- frontend-ui-engineering
- performance-optimization
- test-driven-development

## Scope

- Tree completa com acções.
- Detail da unidade.
- Não carregar toda a organização em cada request (carregamento eficiente).

## Out of Scope

- Backend tree (já existe).

## Implementation

1. Expandir component.
2. Integrar move quando autorizado.
3. Detail melhorado.

## Acceptance Criteria

- [ ] Tree funcional e eficiente.
- [ ] Detail completo.
- [ ] Operações não autorizadas ocultas/bloqueadas.

## Tests

- [ ] Interacções da árvore.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(admin): enhance organization tree`