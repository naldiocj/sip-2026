# TASK-009 — user-assignment

## Objective

Consolidar `UserAssignment` com validações de período e regra de PRIMARY única.

## Context

UserAssignment já existe (user_id, organizational_unit_id, assignment_type, is_primary, start_date, end_date, status). Falta validação robusta: uma PRIMARY activa por utilizador, períodos válidos, atribuição a unidade inactiva rejeitada.

## Dependencies

- TASK-006 (Unit)
- SPRINT-01 (User)

## Skills

- test-driven-development
- api-and-interface-design

## Scope

- Regra de PRIMARY única activa (validação no serviço + teste).
- Validação de período (end >= start).
- Rejeitar atribuição a unidade inactiva.
- AssignmentService central (create, list, end, update).

## Out of Scope

- Lotação/histórico (TASK-010).
- APIs (TASK-019).

## Implementation

1. Criar AssignmentService em application/.
2. Validações de integridade.
3. `end_assignment()` para terminar sem destruir histórico.
4. Testes.

## Acceptance Criteria

- [ ] PRIMARY única activa por utilizador.
- [ ] Períodos inválidos rejeitados.
- [ ] Atribuição a unidade inactiva rejeitada.
- [ ] end_assignment preserva histórico.

## Tests

- [ ] Duplicar PRIMARY → erro
- [ ] end < start → erro
- [ ] unidade inactiva → erro
- [ ] end_assignment muda status sem apagar

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(org): add assignment service with validations`