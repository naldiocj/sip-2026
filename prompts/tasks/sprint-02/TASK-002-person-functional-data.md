# TASK-002 — person-functional-data

## Objective

Adicionar dados funcionais à Person, separados conceptualmente de dados pessoais e de autenticação.

## Context

O SIP precisa de dados funcionais mínimos (sem assumir RH completo): employee_number, functional_category, job_title, admission_date, employment_status, professional_registration, notes.

## Dependencies

- TASK-001 (Person)

## Skills

- test-driven-development
- incremental-implementation
- spec-driven-development

## Scope

- Colunas funcionais na tabela `persons` (ou extensão no mesmo modelo).
- `FunctionalStatus` se necessário (EMPLOYED/OTHER — apenas o necessário).
- Validações: employee_number único quando preenchido.
- Testes.

## Out of Scope

- Módulo RH completo.
- Lotação (TASK-010).
- FunctionalRole (TASK-011).

## Implementation

1. Adicionar campos funcionais em `Person` (nullable, sem valores obrigatórios).
2. Índice único parcial em employee_number (não nulo).
3. Validação no PersonService para unicidade de employee_number.
4. Migration.

## Acceptance Criteria

- [ ] Dados funcionais em Person (ou entidade separada se a arquitectura o exigir).
- [ ] employee_number único quando presente.
- [ ] Nenhum campo de autenticação misturado.

## Tests

- [ ] Criação de Person com dados funcionais.
- [ ] Duplicação de employee_number rejeitada.
- [ ] Person sem dados funcionais é válida.

## Definition of Done

- [ ] Implementado
- [ ] Migration criada
- [ ] Testes passam
- [ ] Commit: `feat(person): add functional data fields`