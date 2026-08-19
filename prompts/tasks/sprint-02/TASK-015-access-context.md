# TASK-015 — access-context

## Objective

Expandir o `AccessContext` para incluir user, person, profiles, permissions, organization, primary_assignment, assignments, responsibilities, delegations, effective_scopes.

## Context

AccessContextService existe com user_id/username/organization. Falta person, profiles, permissions, assignments, responsibilities, delegations e effective_scopes. NÃO colocar lógica de negócio dentro deste objecto.

## Dependencies

- TASK-003 (User ↔ Person)
- TASK-009 (Assignment)
- TASK-012 (Responsibility)
- TASK-013 (Delegation)
- TASK-014 (Substitution)

## Skills

- api-and-interface-design
- test-driven-development

## Scope

- Dataclass AccessContext expandida.
- AccessContextService resolve todos os componentes sem lógica de negócio.
- `GET /api/v1/me/context` (endpoint).
- Testes.

## Out of Scope

- Scope engine (TASK-016).
- Dados sensíveis (não retornar passwords/tokens).

## Implementation

1. Expandir AccessContext dataclass.
2. Resolver person via user.person, profiles, permissions (via AuthorizationService), assignments, responsibilities, delegations.
3. effective_scopes: lista derivada (vazia por agora; TASK-016).
4. Endpoint `/me/context`.
5. Testes.

## Acceptance Criteria

- [ ] Contexto completo e seguro.
- [ ] Sem dados sensíveis.
- [ ] Objecto sem lógica de negócio.

## Tests

- [ ] Contexto com tudo associado.
- [ ] Contexto sem person (user sem person).
- [ ] Não expõe segredos.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(org): add access context with person and scopes`