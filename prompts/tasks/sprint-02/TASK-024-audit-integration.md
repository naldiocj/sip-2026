# TASK-024 — audit-integration

## Objective

Auditar todas as operações administrativas: PERSON_*, USER_PERSON_*, ORGANIZATION_*, UNIT_*, ASSIGNMENT_*, RESPONSIBILITY_*, DELEGATION_*, SUBSTITUTION_*.

## Context

AuditService existe (SPRINT-01). Integrar eventos em todos os serviços/endpoints. NUNCA registar passwords/tokens/segredos.

## Dependencies

- TASK-001..014 (todos os serviços)
- SPRINT-01 (AuditService)

## Skills

- observability-and-instrumentation
- security-and-hardening
- test-driven-development

## Scope

- Novos AuditEventType (person, user-person, organization, unit, assignment, responsibility, delegation, substitution).
- Chamadas de auditoria em todos os serviços.
- Verificação: nada sensível registado.
- Testes.

## Out of Scope

- Dashboards de auditoria.

## Implementation

1. Expandir audit.py com novos event types.
2. Integrar nos serviços.
3. Testes de não-registo de segredos.

## Acceptance Criteria

- [ ] Todos os eventos listados no prompt auditados.
- [ ] Sem dados sensíveis nos detalhes.

## Tests

- [ ] Evento registado por operação.
- [ ] Detalhes sem password/token.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(org): add audit events for admin operations`