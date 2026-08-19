# TASK-010 — lotacao

## Objective

Modelar a lotação como histórico temporal de colocação organizacional da pessoa/utilizador.

## Context

A lotação não é perfil. Ex.: Pessoa João tem perfil Instrutor Processual e lotação Direcção X → Departamento Y → Secção Z. O histórico deve preservar onde a pessoa estava, quando, e quando saiu.

## Dependencies

- TASK-009 (Assignment)
- TASK-003 (User ↔ Person)

## Skills

- spec-driven-development
- test-driven-development

## Scope

- View de lotação derivada de UserAssignments (a lotação É o conjunto de atribuições com período).
- Serviço para consultar lotação actual e histórica por pessoa/utilizador.
- Timeline de lotação (com datas start/end).
- Testes.

## Out of Scope

- UI (TASK-022).
- Regras RH.

## Implementation

1. Serviço de lotação: `get_current_lotacao(user_id)`, `get_lotacao_history(user_id)`.
2. Consulta por Person via user associado.
3. Garantir que nada apaga histórico (end_assignment, nunca delete).

## Acceptance Criteria

- [ ] Lotação actual consultável.
- [ ] Histórico consultável com períodos.
- [ ] Nenhum apagamento de histórico.

## Tests

- [ ] Lotação actual.
- [ ] Histórico após end_assignment.
- [ ] Consulta por pessoa.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(org): add lotacao history view`