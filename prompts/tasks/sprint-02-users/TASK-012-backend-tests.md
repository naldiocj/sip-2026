# TASK-012 — backend-tests

## Objective

Testes de autorização (todos os perfis), integridade (hierarquia inválida, PRIMARY duplicada) e ciclo de vida — completando a cobertura da sprint.

## Context

Base de testes existente: tests/modules/auth, tests/modules/organization (test_management_api.py com _auth_headers). Padrão de perfis no seed (ProfileEnum + PermissionConstants).

## Dependencies

- TASK-001..005 (implementação)

## Skills

- test-driven-development
- security-and-hardening

## Scope

- Autorização por perfil: quem pode listar/criar/editar/administrar/atribuir contexto (todos os 9 perfis).
- Integridade: Direcção A + Departamento da Direcção C → REJECT; Secção incompatível → REJECT; Unidade incompatível → REJECT; duas PRIMARY activas → REJECT.
- Ciclo de vida: create/update/activate/deactivate/block/unblock, sessões, auditoria.
- Prevenção de escalada: sem permissão → 403 (perfil/user_id/org enviados pelo cliente não confiáveis).

## Out of Scope

- Frontend (TASK-013).

## Implementation

1. tests/modules/auth/test_user_service.py, test_user_api.py, test_user_authorization.py.
2. Extender testes de atribuição se necessário.

## Acceptance Criteria

- [ ] Todos os perfis cobertos.
- [ ] Casos de integridade REJECT.
- [ ] 403 para não autorizados.

## Tests

- [ ] suite backend passa (pytest)

## Definition of Done

- [ ] Implementado
- [ ] pytest passa
- [ ] Commit: `test(users): add authorization and integrity tests`