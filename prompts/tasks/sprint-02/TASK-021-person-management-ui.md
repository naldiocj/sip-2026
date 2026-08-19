# TASK-021 — person-management-ui

## Objective

Criar a interface profissional de Gestão de Pessoas: tabela (TanStack Table), pesquisa, filtros, ordenação, paginação, perfil da pessoa com tabs.

## Context

API de pessoas pronta (TASK-018). UI profissional com shadcn/ui, TanStack Table, TanStack Query. Filtros humanizados. Nunca mostrar ACTIVE/INACTIVE sem tradução.

## Dependencies

- TASK-018 (API)
- TASK-020 (área admin)

## Skills

- frontend-ui-engineering
- test-driven-development
- api-and-interface-design

## Scope

- Listagem com tabela completa (pesquisa, filtros, ordenação, paginação, colunas configuráveis, estados, acções).
- Formulários (React Hook Form + Zod se na arquitectura), combobox para selects grandes.
- Página de perfil com tabs: Dados pessoais, Dados funcionais, Conta SIP, Perfis, Lotação, Atribuições, Responsabilidades, Delegações, Histórico, Auditoria.
- Estados UX completos.

## Out of Scope

- Atribuições (TASK-022).

## Implementation

1. API client + hooks (TanStack Query).
2. PersonDataTable com filtros.
3. PersonForm (create/edit) com combobox.
4. PersonDetail com tabs.
5. Humanização de status.

## Acceptance Criteria

- [ ] Tabela profissional completa.
- [ ] Filtros humanizados.
- [ ] Perfil com tabs.
- [ ] Formulários com validação/loading/erro.

## Tests

- [ ] Listagem.
- [ ] Criação/edição.
- [ ] Filtros/pesquisa.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(admin): add people management UI`