# TASK-009 — user-detail-ui

## Objective

Página `/administracao/utilizadores/[id]`: resumo da conta com tabs (Resumo, Perfil, Atribuições, Segurança, Actividade, Auditoria).

## Context

Padrão de detalhe: `person-detail.tsx` + rota `pessoas/[id]`. Dados: GET /users/{id} (perfis), GET /users/{id}/assignments, GET /audit?user_id=.

## Dependencies

- TASK-002/003/004/005 (APIs)
- TASK-006 (data layer)

## Skills

- frontend-ui-engineering

## Scope

- Rota `utilizadores/[id]/page.tsx` + `user-detail.tsx`.
- Tabs:
  - Resumo: dados da conta, badges de estado, último acesso.
  - Perfil: perfis atribuídos + gerir (TASK-011).
  - Atribuições: tabela + acções (TASK-010).
  - Segurança: estado, acções activate/deactivate/block/unblock (TASK-011).
  - Actividade: último login, sessões.
  - Auditoria: eventos do utilizador (GET /audit?user_id=).
- Estados loading/error/empty; breadcrumb; a11y.

## Out of Scope

- Lógica de atribuições (TASK-010) e acções de segurança (TASK-011) — apenas integração das tabs.

## Implementation

1. user-detail.tsx com tabs.
2. Seccões actividade e auditoria.
3. Testes de componente.

## Acceptance Criteria

- [ ] Tabs funcionais com dados reais.
- [ ] "Sem atribuição organizacional" quando não existir atribuição.
- [ ] Auditoria por utilizador listada.
- [ ] Loading/error/empty correctos.

## Tests

- [ ] render tabs
- [ ] sem atribuição → indicador claro

## Definition of Done

- [ ] Implementado
- [ ] Lint + typecheck passam
- [ ] Commit: `feat(users): add user detail page`