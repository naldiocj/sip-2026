# TASK-019 — assignment-api

## Objective

Implementar API de atribuições, responsabilidades e delegações.

## Context

Serviços prontos (TASK-009..014). Expor:
- GET/POST /api/v1/users/{id}/assignments, PATCH /api/v1/users/{id}/assignments/{assignment_id}, DELETE apenas quando não destrói histórico (preferir end).
- Responsibility API administrativa (RBAC).
- Delegation API (create/read/revoke, expiração automática quando aplicável).
- Toda operação auditável.

## Dependencies

- TASK-009/012/013 (services)

## Skills

- api-and-interface-design
- security-and-hardening
- test-driven-development

## Scope

- Assignment endpoints com end_assignment.
- Responsibility endpoints.
- Delegation endpoints.
- RBAC + auditoria.
- Testes.

## Out of Scope

- Frontend (TASK-022).

## Implementation

1. Routers assignments/responsibilities/delegations.
2. PATCH para terminar (end_date).
3. Testes.

## Acceptance Criteria

- [ ] Atribuições geridas sem destruir histórico.
- [ ] Responsabilidades com RBAC.
- [ ] Delegações auditáveis.
- [ ] Utilizador não altera a própria responsabilidade sem permissão administrativa.

## Tests

- [ ] Fluxos completos.
- [ ] 403/404/409.
- [ ] Auditoria registada.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(org): add assignment and delegation APIs`