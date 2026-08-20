# TASK-001 — user-domain-service

## Objective

Criar `UserService` no módulo `auth`: ciclo de vida do utilizador (create, update, activate, deactivate, block, unblock) com auditoria e revogação de sessões.

## Context

`User`/`UserStatus` existem (ACTIVE/INACTIVE/BLOCKED/PENDING). Falta serviço de gestão do ciclo de vida. `AuthService.login` já bloqueia contas não-ACTIVE. `PasswordService` e `AuditService` existem.

## Dependencies

- SPRINT-01 (User, PasswordService, AuditService)

## Skills

- test-driven-development
- security-and-hardening

## Scope

- Adicionar `SUSPENDED` a `UserStatus` (prompt §33).
- `UserService`: `create` (com hash de password), `update`, `activate`, `deactivate`, `block`, `unblock`.
- Revogar sessões activas do utilizador ao desactivar/bloquear.
- Eventos de auditoria novos: USER_CREATED, USER_UPDATED, USER_ACTIVATED, USER_DEACTIVATED, USER_BLOCKED, USER_UNBLOCKED.
- Nunca expor password_hash; nunca guardar passwords em auditoria.

## Out of Scope

- APIs (TASK-002/003).
- Perfis (TASK-004).
- Atribuições (já existentes).

## Implementation

1. Adicionar eventos USER_* ao AuditEventType.
2. Adicionar SUSPENDED a UserStatus + humanização.
3. Criar UserService em auth/application/user_service.py.
4. Método de revogação de sessões (reutilizar UserSession.revoke).
5. Testes unitários TDD.

## Acceptance Criteria

- [ ] create gera hash de password e estado inicial correcto.
- [ ] update altera apenas campos permitidos.
- [ ] deactivate/block revogam sessões activas.
- [ ] Eventos USER_* registados com resultado e detalhes sanitizados.
- [ ] SUSPENDED humanizado.

## Tests

- [ ] create user
- [ ] update user
- [ ] activate/deactivate/block/unblock
- [ ] sessões revogadas ao desactivar/bloquear
- [ ] auditoria sem passwords

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Lint + typecheck passam
- [ ] Commit: `feat(users): add user lifecycle service`