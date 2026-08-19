# TASK-016 — scope-engine

## Objective

Criar a fundação de um ScopeEngine: can_access_scope(), resolve_effective_scope(), get_effective_responsibilities().

## Context

Futuramente processos/documentos/piquete usarão âmbitos. Agora criar apenas infraestrutura — NÃO implementar regras específicas desses módulos. Também: proibido espalhar `if user.profile == "DIRECTOR"` — usar serviços/policies centralizados.

## Dependencies

- TASK-015 (AccessContext)

## Skills

- api-and-interface-design
- test-driven-development
- security-and-hardening

## Scope

- `ScopeEngine` em application/.
- API de fundação: can_access_scope(user, scope, unit_id), resolve_effective_scope(user), get_effective_responsibilities(user).
- Implementação base: responsabilidades activas + delegações activas.
- Testes.

## Out of Scope

- Regras de Processos, Documentos, Piquete, Mandados, BRP.

## Implementation

1. Criar scope_engine.py.
2. Métodos de fundação com lógica mínima baseada em responsibilities/delegations.
3. Testes.

## Acceptance Criteria

- [ ] Métodos existem e são utilizáveis.
- [ ] Lógica baseada em dados (não em profile strings).
- [ ] Sem regras de módulos futuros.

## Tests

- [ ] can_access_scope para responsabilidade própria.
- [ ] effective scope com delegação.
- [ ] Sem responsabilidade → scope mínimo (OWN).

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(org): add scope engine foundation`