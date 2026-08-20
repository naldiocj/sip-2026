# TASK-013 — frontend-tests

## Objective

Testes de componentes (vitest) para a UI de utilizadores + cenários E2E do prompt (E2E-001..005) ao nível adequado ao projecto.

## Context

Vitest configurado (frontend/vitest.config.ts, __tests__/). Verificar se existe infraestrutura E2E (Playwright) — se não existir, os cenários E2E-001..005 são cobertos com testes de integração API (pytest) + testes de componente; documentar.

## Dependencies

- TASK-006..011 (UI)

## Skills

- test-driven-development

## Scope

- Componentes: user-data-table, user-form (validação, selects dependentes), user-detail, assignments section, acções.
- Cenários E2E-001..005:
  - E2E-001: criar utilizador com perfil + contexto completo + principal → sucesso (API + UI).
  - E2E-002: adicionar segunda atribuição secundária.
  - E2E-003: alterar atribuição principal → anterior deixa de ser principal.
  - E2E-004: não autorizado → 403.
  - E2E-005: GET /me/context → contexto correcto.

## Out of Scope

- Infra E2E browser (se não existir no projecto).

## Implementation

1. Testes vitest dos componentes.
2. Cobertura API dos cenários E2E em pytest (se não houver Playwright).
3. Documentar cobertura.

## Acceptance Criteria

- [ ] Componentes testados.
- [ ] Cenários E2E-001..005 cobertos e passando.
- [ ] vitest + pytest verdes.

## Tests

- [ ] vitest run
- [ ] pytest

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `test(users): add frontend and E2E coverage`