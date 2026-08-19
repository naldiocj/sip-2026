# TASK-025 — security-review

## Objective

Revisão de segurança completa: autorização, ownership, escopo, permissões, integridade hierárquica, tenant/organization.

## Context

Não confiar no frontend. Validar todos os endpoints. Testar cenário 12: operação fora do escopo → 403.

## Dependencies

- TASK-015..019 (APIs)

## Skills

- security-and-hardening
- code-review-and-quality
- debugging-and-error-recovery

## Scope

- Revisão de todos os endpoints novos.
- Testes de autorização por perfil (9 perfis).
- Ownership (utilizador não altera a própria responsabilidade).
- Integridade hierárquica.

## Out of Scope

- Auth core (já revisto na SPRINT-01).

## Implementation

1. Revisar endpoints linha a linha.
2. Corrigir falhas.
3. Testes de autorização.

## Acceptance Criteria

- [ ] Nenhum endpoint sem verificação de permissão.
- [ ] 403 para operações fora do escopo.
- [ ] Sem exposição de dados sensíveis.

## Tests

- [ ] Matriz de perfis × permissões.

## Definition of Done

- [ ] Revisão completa
- [ ] Correcções aplicadas
- [ ] Testes passam
- [ ] Commit: `fix(org): apply security review findings`