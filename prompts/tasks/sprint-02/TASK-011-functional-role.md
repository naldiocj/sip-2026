# TASK-011 — functional-role

## Objective

Criar o conceito `FunctionalRole` — função exercida na estrutura institucional, distinta de Profile.

## Context

Profile define permissões dentro do SIP. FunctionalRole define função na organização (Director, Chefe de Departamento, Chefe de Secção, Instrutor, Editor, Agente de Piquete). Uma pessoa pode ter função diferente do perfil técnico.

## Dependencies

- TASK-009 (Assignment)

## Skills

- spec-driven-development
- api-and-interface-design
- test-driven-development

## Scope

- Enum `FunctionalRole` (Director, Chefe de Departamento, Chefe de Secção, Instrutor, Editor, Agente de Piquete, + outros) com labels humanizadas.
- Relação com UserAssignment (função exercida na atribuição) OU tabela própria conforme a arquitectura.
- Humanização.

## Out of Scope

- Lógica de autorização baseada em função (futuro).
- RH.

## Implementation

1. Definir enum FunctionalRole + labels.
2. Adicionar coluna `functional_role` a UserAssignment (função exercida naquela atribuição) se apropriado, ou tabela dedicada.
3. Schemas/API actualizados.
4. Testes.

## Acceptance Criteria

- [ ] FunctionalRole distinto de Profile.
- [ ] Uma pessoa pode ter função diferente do perfil.
- [ ] Humanização.

## Tests

- [ ] Atribuição com função.
- [ ] Labels.
- [ ] Função ≠ perfil possível.

## Definition of Done

- [ ] Implementado
- [ ] Migration se necessário
- [ ] Testes passam
- [ ] Commit: `feat(org): add functional role concept`