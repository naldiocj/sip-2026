# TASK-002 — user-crud-api

## Objective

API de CRUD de utilizadores: listagem server-side (paginação, pesquisa, filtros, sort), criação, detalhe, actualização.

## Context

`GET /users` existente é apenas picker (activos, limit 200). É preciso listagem administrativa completa com filtros (search, status, perfil, unidade organizacional) e paginação (page/page_size/sort). Schemas UserCreate/UserUpdate/UserResponse já existem em auth/api/schemas/user.py.

## Dependencies

- TASK-001 (UserService)
- SPRINT-01 (schemas, permissions user.*)

## Skills

- api-and-interface-design
- test-driven-development

## Scope

- `GET /api/v1/users`: page, page_size, search (username/full_name/email/employee_number), status, profile_id, unit_id (atribuição na sub-árvore), sort.
- `POST /api/v1/users`: criar com password; devolver 201.
- `GET /api/v1/users/{id}`: detalhe com perfis e atribuições (sem credenciais).
- `PATCH /api/v1/users/{id}`: actualizar campos.
- Sempre via require_permission("user.read"|"user.create"|"user.update").

## Out of Scope

- Estado (activate/deactivate/block) — TASK-003.
- Perfis (assign/remove) — TASK-004.
- Atribuições — já existentes.

## Implementation

1. Reestruturar users.py com schemas de resposta enriquecidos (UserListItem/UserResponse com profiles/assignments).
2. Filtro por unidade: sub-árvore via CTE recursiva sobre units.parent_id.
3. Testes da API.

## Acceptance Criteria

- [ ] Paginação server-side com total.
- [ ] Pesquisa com debounce suportada (parâmetro search).
- [ ] Filtros status/profile/unit funcionam.
- [ ] Nunca expõe password_hash.
- [ ] 403 sem permissão.

## Tests

- [ ] list com paginação e filtros
- [ ] create user
- [ ] update user
- [ ] pesquisa por username/nome/email

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(users): add user CRUD API`