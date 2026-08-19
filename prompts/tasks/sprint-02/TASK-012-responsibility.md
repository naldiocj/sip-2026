# TASK-012 — responsibility

## Objective

Criar a entidade `Responsibility` — responsabilidade funcional com âmbito e período.

## Context

O SIP precisa representar responsabilidades funcionais: user + tipo + unidade + período + status. `ResponsibilityScope` enum já existe (GLOBAL..PGR). Agora criar a entidade.

## Dependencies

- TASK-009 (Assignment)
- TASK-006 (Unit)

## Skills

- spec-driven-development
- api-and-interface-design
- test-driven-development

## Scope

- Entidade `Responsibility`:
  - id, user_id, type (scope), organizational_unit_id, resource_type (opcional), start_date, end_date, status.
- ResponsibilityService (create, list, end).
- Validação: responsabilidade com âmbito de unidade exige unidade; períodos válidos.
- Humanização de types.
- Testes.

## Out of Scope

- Regras específicas de processos (futuro).
- UI (TASK-022).

## Implementation

1. Criar entidade em `organization/domain/responsibility.py`.
2. Service com validações.
3. Migration.
4. Testes.

## Acceptance Criteria

- [ ] Responsibility persistida com âmbito.
- [ ] Âmbito com unidade exige unidade válida.
- [ ] Período válido.
- [ ] end_responsibility preserva histórico.
- [ ] Humanização.

## Tests

- [ ] Criação.
- [ ] Âmbito inválido rejeitado.
- [ ] Período inválido rejeitado.
- [ ] End preserva histórico.

## Definition of Done

- [ ] Implementado
- [ ] Migration
- [ ] Testes passam
- [ ] Commit: `feat(org): add responsibility model`