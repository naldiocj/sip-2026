# TASK-006 — user-frontend-data

## Objective

Camada de dados do frontend: client API de utilizadores, hooks TanStack Query, tipos e humanização.

## Context

`users-api.ts` só tem list (picker) e get. É preciso client completo (CRUD, status, perfis, atribuições, auditoria) seguindo o padrão `person-api.ts`/`use-people.ts`. `humanize.ts` precisa de labels de estado e perfil.

## Dependencies

- TASK-002/003/004/005 (contratos API)

## Skills

- api-and-interface-design

## Scope

- `users-api.ts`: tipos UserListItem/UserResponse/UserCreate/UserUpdate + métodos (list com params, get, create, update, activate, deactivate, block, unblock, assignProfile, removeProfile, listAssignments, createAssignment, updateAssignment, endAssignment, listAudit).
- `hooks/use-users.ts`: query keys + hooks por operação (padrão use-people).
- `humanize.ts`: estados (ACTIVE→Activo, BLOCKED→Bloqueado, SUSPENDED→Suspenso, INACTIVE→Inactivo) e labels de perfis.

## Out of Scope

- UI (TASK-007+).

## Implementation

1. Estender users-api.ts e humanize.ts.
2. Criar hooks use-users.ts.
3. Testes unitários dos formatadores (humanize).

## Acceptance Criteria

- [ ] Todos os endpoints consumidos com tipos.
- [ ] Hooks com invalidação de cache correcta.
- [ ] Enums humanizados (nunca mostrar código técnico).

## Tests

- [ ] humanize de estados/perfis

## Definition of Done

- [ ] Implementado
- [ ] Typecheck passa
- [ ] Commit: `feat(users): add frontend data layer`