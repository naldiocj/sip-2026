# TASK-008 — organizational-unit-types

## Objective

Garantir os UnitTypes com humanização (ORGANIZATION, DIRECTION, DEPARTMENT, SECTION, UNIT, PIQUETE, OTHER).

## Context

UnitType já existe com labels. Verificar cobertura e uso consistente.

## Dependencies

- SPRINT-02 anterior (UnitType existe)

## Skills

- test-driven-development

## Scope

- Revisão do enum + labels.
- Testes de humanização.
- Uso consistente nos services/API.

## Out of Scope

- Novos tipos.

## Implementation

1. Revisar unit_type.py.
2. Testes de labels e valores.
3. Verificar que PIQUETE é utilizável como tipo.

## Acceptance Criteria

- [ ] Todos os tipos presentes e humanizados.
- [ ] PIQUETE disponível.

## Tests

- [ ] Labels correctas.
- [ ] Enum coerente.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `test(org): cover unit types humanization`