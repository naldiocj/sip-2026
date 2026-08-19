# TASK-026 — backend-tests

## Objective

Testes de domínio, integridade e autorização completos para o backend.

## Context

Testes parciais existem. Completar: Person, User-Person, Organization, Unit, Hierarchy, Assignment, Responsibility, Delegation, Substitution, AccessContext + integridade (self-parent, cycle, invalid parent, duplicate primary, invalid period, invalid delegation, overlapping delegation, inactive unit, invalid scope) + autorização (9 perfis).

## Dependencies

- Todos os tasks de implementação

## Skills

- test-driven-development
- code-review-and-quality

## Scope

- Testes de domínio.
- Testes de integridade.
- Testes de autorização (cenários 1-12).
- Cobertura adequada.

## Out of Scope

- Frontend/E2E (TASK-027/028).

## Implementation

1. Criar testes por módulo.
2. Executar suite completa.
3. Garantir cobertura dos cenários do prompt.

## Acceptance Criteria

- [ ] Todos os testes do prompt cobertos.
- [ ] Suite verde.

## Tests

- [ ] pytest verde.

## Definition of Done

- [ ] Suite completa
- [ ] Commit: `test(org): cover domain, integrity and authorization`