# TASK-013 — delegation

## Objective

Criar suporte a delegações de responsabilidade.

## Context

Delegação: alguém transfere determinada responsabilidade a outro. Ex.: Director A delegou responsabilidade ao Director B. Delegação ≠ Substituição (conceitos separados).

## Dependencies

- TASK-012 (Responsibility)

## Skills

- spec-driven-development
- api-and-interface-design
- security-and-hardening
- test-driven-development

## Scope

- Entidade `Delegation`:
  - id, delegator_user_id, delegate_user_id, scope (responsibility type), organizational_unit_id, start_date, end_date, reason, status.
- DelegationService (create, revoke, list).
- Validação: delegator ≠ delegate; sobreposição inválida rejeitada; períodos válidos.
- Auditoria (DELEGATION_CREATED, DELEGATION_REVOKED).
- Testes.

## Out of Scope

- Substituição (TASK-014).
- UI (TASK-022).

## Implementation

1. Entidade em `organization/domain/delegation.py`.
2. Service com validações de sobreposição.
3. Migration.
4. Testes.

## Acceptance Criteria

- [ ] Delegação criada/consultada/revogada.
- [ ] Delegator ≠ delegate.
- [ ] Sobreposição inválida rejeitada.
- [ ] Período válido.
- [ ] Auditoria.

## Tests

- [ ] Criação.
- [ ] Auto-delegação rejeitada.
- [ ] Sobreposição rejeitada.
- [ ] Revogação preserva histórico.

## Definition of Done

- [ ] Implementado
- [ ] Migration
- [ ] Testes passam
- [ ] Commit: `feat(org): add delegation support`