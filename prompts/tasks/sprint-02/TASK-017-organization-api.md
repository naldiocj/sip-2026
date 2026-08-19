# TASK-017 — organization-api

## Objective

Completar a API de Organizations e Organizational Units (GET/POST/GET {id}/PATCH, deactivate quando apropriado).

## Context

APIs existem parcialmente. Completar: GET/POST organizations, GET/PATCH units, deactivate (soft) preservando histórico, validações RBAC (organization.read/create/update/manage).

## Dependencies

- TASK-005/006/007 (domain)

## Skills

- api-and-interface-design
- security-and-hardening
- test-driven-development

## Scope

- Organizações: list, create, get, patch (deactivate).
- Units: list, create, get, patch, deactivate, move.
- RBAC consistente.
- Swagger documentado.

## Out of Scope

- Person API (TASK-018).
- Assignment API (TASK-019).

## Implementation

1. Completar endpoints.
2. Schemas com respostas/erros consistentes.
3. Testes de autorização e fluxo.

## Acceptance Criteria

- [ ] CRUD organizações e unidades.
- [ ] Deactivate preserva histórico.
- [ ] RBAC correcto.

## Tests

- [ ] Fluxos completos.
- [ ] 403 sem permissão.
- [ ] 409 código duplicado.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(org): complete organization API`