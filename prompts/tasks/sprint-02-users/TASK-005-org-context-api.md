# TASK-005 — org-context-api

## Objective

Completar o suporte de API para o contexto organizacional do utilizador: selects dependentes por nível, auditoria de mudança de atribuição principal, e consulta de auditoria por utilizador.

## Context

- `GET /units?organization_id=` lista unidades (sem filtro por parent).
- `GET /users/{id}/assignments` + POST/PATCH/end existem (AssignmentService com validações).
- Não existe endpoint de auditoria consultável.
- Evento USER_PRIMARY_ASSIGNMENT_CHANGED não existe.

## Dependencies

- SPRINT-02 (OrganizationService, AssignmentService, AuditService)
- TASK-001 (audit events)

## Skills

- api-and-interface-design
- performance-optimization

## Scope

- `GET /api/v1/units`: adicionar filtros opcionais `parent_id` e `type_id` (carregar apenas o nível necessário — prompt §15–16, §56).
- `POST /api/v1/users/{id}/assignments/{assignment_id}/end` e PATCH já existem — garantir auditoria `USER_PRIMARY_ASSIGNMENT_CHANGED` quando `is_primary` muda.
- `GET /api/v1/audit?user_id=&event_type=&page=&page_size=` (permission system.audit): histórico de auditoria do utilizador.
- NÃO duplicar estrutura organizacional.

## Out of Scope

- Gestão de unidades (já existe).
- Regras de scopes de processos (SPRINT posteriores).

## Implementation

1. Estender list_units com parent_id/type_id opcionais.
2. Emitir USER_PRIMARY_ASSIGNMENT_CHANGED no PATCH de atribuição quando primary muda.
3. Novo router de auditoria (listagem com filtros).
4. Testes.

## Acceptance Criteria

- [ ] /units?parent_id= devolve apenas filhos.
- [ ] /units?type_id= devolve apenas unidades do tipo.
- [ ] Mudança de PRIMARY auditada com USER_PRIMARY_ASSIGNMENT_CHANGED.
- [ ] GET /audit filtra por utilizador e não expõe detalhes sensíveis.

## Tests

- [ ] children por parent
- [ ] primary change auditado
- [ ] audit list com filtro user

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(users): add org context API support`