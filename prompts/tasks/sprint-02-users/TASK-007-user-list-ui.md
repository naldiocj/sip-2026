# TASK-007 — user-list-ui

## Objective

Página `/administracao/utilizadores`: tabela profissional com TanStack Table, pesquisa com debounce, filtros (perfil, estado), paginação server-side, acções por menu, estados loading/error/empty e layout responsivo.

## Context

Página actual é placeholder. Padrões existentes: `person-data-table.tsx` (TanStack), `use-people`, shadcn/ui.

## Dependencies

- TASK-006 (data layer)

## Skills

- frontend-ui-engineering
- test-driven-development

## Scope

- Substituir placeholder por página completa.
- Colunas: Utilizador, Nome, Email, Perfil, Direcção, Departamento, Secção, Unidade, Estado, Último acesso, Acções.
- Filtros: pesquisa (debounce), perfil (combobox), estado (select).
- Paginação server-side.
- Menu de acções: Editar, Activar/Desactivar, Bloquear/Desbloquear, Gerir perfil, Ver detalhe (apenas autorizadas).
- Mobile: cards adaptados (colunas reduzidas).

## Out of Scope

- Formulários (TASK-008).
- Detalhe (TASK-009).

## Implementation

1. Componente `user-data-table.tsx` em components/user/.
2. Página com estado de filtros e paginação.
3. Testes de componentes (vitest).

## Acceptance Criteria

- [ ] Tabela com paginação server-side e total.
- [ ] Pesquisa com debounce.
- [ ] Filtros por perfil e estado.
- [ ] Estados loading/error/empty.
- [ ] A11y: aria labels, keyboard navigation.
- [ ] Responsivo (desktop/tablet/mobile).

## Tests

- [ ] render com dados
- [ ] empty state
- [ ] acções visíveis conforme permissões

## Definition of Done

- [ ] Implementado
- [ ] Lint + typecheck passam
- [ ] Commit: `feat(users): add user list UI`