# TASK-011 — user-security-ui

## Objective

Acções de segurança no detalhe/listagem do utilizador: activar/desactivar/bloquear/desbloquear e gestão de perfis — sempre condicionadas às permissões do operador.

## Context

APIs: POST /users/{id}/activate|deactivate|block|unblock; POST/DELETE profiles. Permissões: user.update, profile.manage. Regra: nunca confiar no frontend para segurança — o backend valida sempre.

## Dependencies

- TASK-003/004 (APIs)
- TASK-007/009 (listagem/detalhe)

## Skills

- frontend-ui-engineering
- security-and-hardening

## Scope

- Menu de acções com botões condicionais por permissão (sidebar NÃO é segurança; aqui é UX).
- Diálogos de confirmação para desactivar/bloquear/alterar perfil.
- Gestão de perfis: listar perfis do utilizador, atribuir/remover com combobox de perfis (labels humanizados, nunca enums técnicos).
- Feedback via toast e invalidação de cache.

## Out of Scope

- Regras RBAC no backend (existem).

## Implementation

1. `user-actions-menu.tsx` e `user-profiles-section.tsx`.
2. Confirmações com dialog (padrão confirm-dialog).
3. Testes de componente.

## Acceptance Criteria

- [ ] Acções apenas visíveis com permissão.
- [ ] Confirmação em acções destrutivas.
- [ ] Perfis humanizados na UI.
- [ ] Feedback de sucesso/erro.

## Tests

- [ ] botões condicionais por permissão
- [ ] confirmação de bloqueio

## Definition of Done

- [ ] Implementado
- [ ] Lint + typecheck passam
- [ ] Commit: `feat(users): add user security actions UI`