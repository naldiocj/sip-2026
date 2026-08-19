# TASK-014 — substitution

## Objective

Preparar suporte para substituição temporária de funções.

## Context

Substituição: alguém passa temporariamente a exercer determinada função (ex.: Chefe de Secção A substituído por Chefe de Secção B). NÃO é lógica de RH — apenas capacidade de contexto SIP. Delegação ≠ Substituição.

## Dependencies

- TASK-013 (Delegation — conceitos separados)

## Skills

- spec-driven-development
- test-driven-development

## Scope

- Entidade `Substitution`:
  - id, substituted_user_id, substitute_user_id, organizational_unit_id, functional_role, start_date, end_date, reason, status.
- SubstitutionService (create, end, list).
- Validações: substituído ≠ substituto; períodos válidos.
- Auditoria (SUBSTITUTION_CREATED, SUBSTITUTION_ENDED).
- Testes.

## Out of Scope

- Lógica RH.
- UI completa (histórico básico permitido).

## Implementation

1. Entidade em `organization/domain/substitution.py`.
2. Service.
3. Migration.
4. Testes.

## Acceptance Criteria

- [ ] Substituição criada/terminada.
- [ ] Período válido.
- [ ] Auditoria.
- [ ] Separada de delegação.

## Tests

- [ ] Criação.
- [ ] Auto-substituição rejeitada.
- [ ] Terminação preserva histórico.

## Definition of Done

- [ ] Implementado
- [ ] Migration
- [ ] Testes passam
- [ ] Commit: `feat(org): add substitution foundation`