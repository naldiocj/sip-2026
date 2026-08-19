# TASK-020 — organization-ui

## Objective

Criar a área `/administracao` com organização, pessoas, utilizadores, atribuições e responsabilidades.

## Context

Frontend existente tem `/organizacao`. Reorganizar sob `/administracao` com rotas humanizadas. Sidebar actualizada (NÃO é segurança — backend valida).

## Dependencies

- TASK-017/018/019 (APIs)
- SPRINT-01 (sidebar, auth)

## Skills

- frontend-ui-engineering
- api-and-interface-design
- test-driven-development

## Scope

- Rotas: /administracao/pessoas, /administracao/utilizadores, /administracao/organizacao, /administracao/atribuicoes, /administracao/responsabilidades.
- Sidebar: secção ADMINISTRAÇÃO.
- Estados loading/empty/error/success/disabled/unauthorized.
- Responsivo.

## Out of Scope

- Detalhe de pessoa (TASK-021).
- Árvore (TASK-023).

## Implementation

1. Reestruturar app router com grupo /administracao.
2. Actualizar navigation-config + sidebar.
3. Páginas base com estados.

## Acceptance Criteria

- [ ] Rotas humanizadas funcionam.
- [ ] Sidebar actualizada.
- [ ] Estados UX presentes.

## Tests

- [ ] Navegação.
- [ ] Protecção de rotas.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(admin): add administration area`