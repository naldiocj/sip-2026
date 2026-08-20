# TASK-004 — profile-management-api

## Objective

API de perfis: listagem para pickers e atribuição/remoção de perfis a utilizadores, com auditoria.

## Context

`Profile`/`ProfileEnum`/`PROFILE_LABELS` existem com os 9 perfis oficiais. `user_profiles` (M2M) existe. Não existe endpoint de listagem de perfis nem de atribuição.

## Dependencies

- SPRINT-01 (Profile, permissions profile.*)
- TASK-001 (UserService)

## Skills

- api-and-interface-design

## Scope

- `GET /api/v1/profiles` (permission profile.read): lista perfis activos com code/name/label.
- `POST /api/v1/users/{id}/profiles` (permission profile.manage ou user.update): atribuir perfil.
- `DELETE /api/v1/users/{id}/profiles/{profile_id}`: remover perfil.
- Auditoria: USER_PROFILE_ASSIGNED, USER_PROFILE_REMOVED.
- Nunca apresentar enums técnicos na UI (labels via PROFILE_LABELS/humanize).

## Out of Scope

- Gestão de permissões dentro de perfis (SPRINT-01 já cobre RBAC).
- UI (TASK-011).

## Implementation

1. Router de profiles (listagem).
2. Endpoints de atribuição no users.py.
3. Validação: perfil activo, utilizador existente, sem duplicados.
4. Testes.

## Acceptance Criteria

- [ ] GET /profiles devolve labels humanizados.
- [ ] Atribuição/remoção com auditoria.
- [ ] Duplicados rejeitados.
- [ ] 403 sem permissão.

## Tests

- [ ] list profiles
- [ ] assign profile
- [ ] remove profile
- [ ] duplicate assign → erro

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(users): add profile management API`