# TASK-003 — user-status-api

## Objective

Endpoints de estado da conta: activate, deactivate, block, unblock — com auditoria e revogação de sessões.

## Context

`UserService` (TASK-001) implementa o ciclo de vida. Falta expor via API. Login já rejeita contas BLOCKED/não-ACTIVE. Desactivação/bloqueio devem revogar sessões (arquitectura existente: UserSession.revoke + evento SESSION_REVOKED).

## Dependencies

- TASK-001 (UserService)
- TASK-002 (users router)

## Skills

- api-and-interface-design
- security-and-hardening

## Scope

- `POST /api/v1/users/{id}/activate`
- `POST /api/v1/users/{id}/deactivate`
- `POST /api/v1/users/{id}/block`
- `POST /api/v1/users/{id}/unblock`
- Auditoria USER_ACTIVATED/USER_DEACTIVATED/USER_BLOCKED/USER_UNBLOCKED.
- Revogar sessões em deactivate/block.
- Permissões: user.update (ou system.admin).

## Out of Scope

- UI (TASK-011).

## Implementation

1. Endpoints no users.py (ou router dedicado).
2. Reutilizar UserService; erros mapeados para HTTP.
3. Testes de autorização e comportamento.

## Acceptance Criteria

- [ ] deactivate impede login e revoga sessões.
- [ ] block distinto de deactivate (BLOCKED vs INACTIVE).
- [ ] Auditoria registada em cada acção.
- [ ] 403 sem permissão.

## Tests

- [ ] activate/deactivate/block/unblock happy path
- [ ] login após deactivate/block → 401
- [ ] sessões revogadas

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(users): add account status endpoints`