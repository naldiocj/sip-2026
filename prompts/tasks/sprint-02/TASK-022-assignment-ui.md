# TASK-022 — assignment-ui

## Objective

Criar as interfaces de Atribuições, Responsabilidades, Delegação e Histórico.

## Context

APIs prontas (TASK-019). Interfaces: gestão de atribuições (pessoa → unidade → tipo → função → período → principal), responsabilidades (consultar/atribuir/alterar/terminar/delegar/substituir com confirmação), delegação (delegante/delegado/responsabilidade/unidade/início/fim/motivo/estado), histórico (timeline).

## Dependencies

- TASK-019 (API)
- TASK-021 (pessoa)

## Skills

- frontend-ui-engineering
- test-driven-development

## Scope

- Página de atribuições.
- Página de responsabilidades (com confirmações críticas).
- Delegação UI (sem sobreposições inválidas).
- Histórico em timeline.
- Humanização.

## Out of Scope

- Árvore (TASK-023).

## Implementation

1. Hooks + componentes.
2. Modais responsivos/adaptáveis.
3. Timeline de histórico.
4. Testes.

## Acceptance Criteria

- [ ] Atribuições geríveis.
- [ ] Responsabilidades com confirmação.
- [ ] Delegação sem sobreposição.
- [ ] Histórico timeline.

## Tests

- [ ] Fluxos principais.
- [ ] Estados.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(admin): add assignments and responsibilities UI`