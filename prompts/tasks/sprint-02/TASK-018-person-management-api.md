# TASK-018 — person-management-api

## Objective

Implementar a API de gestão de pessoas: GET/POST /api/v1/persons, GET/PATCH /api/v1/persons/{id}, deactivate.

## Context

Person domain (TASK-001/002) pronto. Agora expor via API com RBAC (person.read/create/update/deactivate).

## Dependencies

- TASK-001/002 (Person)
- TASK-004 (permissões)

## Skills

- api-and-interface-design
- security-and-hardening
- test-driven-development

## Scope

- Persons router: list (com pesquisa/filtros/paginação), create, get, patch, deactivate.
- Resposta inclui person_number, dados pessoais/funcionais, status humanizado.
- Auditoria: PERSON_CREATED, PERSON_UPDATED, PERSON_DEACTIVATED.

## Out of Scope

- Frontend (TASK-021).
- User association via API (futuro/endpoint específico).

## Implementation

1. Router persons.py com schemas.
2. Paginação/filtros (pesquisa por nome/número).
3. Auditoria.
4. Testes.

## Acceptance Criteria

- [ ] CRUD pessoas.
- [ ] Pesquisa/filtros.
- [ ] RBAC.
- [ ] Auditoria.

## Tests

- [ ] Fluxos.
- [ ] 403.
- [ ] 404.
- [ ] 409 person_number.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(person): add person management API`