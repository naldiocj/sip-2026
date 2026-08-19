# TASK-028 — e2e-tests

## Objective

E2E: E2E-001 (admin cria pessoa/unidade/atribuição/consulta contexto), E2E-002 (director consulta estrutura mas não altera global), E2E-003 (instrutor não acede a administração), E2E-004 (agente PGR consulta contexto autorizado).

## Context

Testes E2E existentes (SPRINT-01, frontend/__tests__/authentication-flow). Adicionar fluxos administrativos.

## Dependencies

- TASK-026/027 (testes)

## Skills

- test-driven-development
- browser-testing-with-devtools
- debugging-and-error-recovery

## Scope

- 4 cenários E2E.

## Out of Scope

- E2E de processos/documentos (sprints futuras).

## Implementation

1. Cenários E2E com login por perfil.
2. Verificar contexto e permissões.

## Acceptance Criteria

- [ ] E2E-001..004 passam.

## Tests

- [ ] Suite E2E verde.

## Definition of Done

- [ ] Implementado
- [ ] Commit: `test(e2e): add administration E2E scenarios`