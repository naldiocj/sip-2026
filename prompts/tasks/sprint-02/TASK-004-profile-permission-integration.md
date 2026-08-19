# TASK-004 — profile-permission-integration

## Objective

Integrar Person/User com Profiles e Permissions existentes da SPRINT-01 e adicionar as permissões administrativas necessárias.

## Context

Perfis (ADMINISTRADOR_SISTEMA, DIRECTOR, SECRETARIA_GERAL, CHEFE_DEPARTAMENTO, CHEFE_SECCAO, INSTRUTOR_PROCESSUAL, AGENTE_PIQUETE, EDITOR_DOCUMENTAL, AGENTE_PGR) já existem. Não duplicar. Adicionar apenas permissões administrativas: person.*, assignment.*, responsibility.*, delegation.*.

## Dependencies

- SPRINT-01 (Profile, Permission, AuthorizationService)
- TASK-003 (User ↔ Person)

## Skills

- security-and-hardening
- api-and-interface-design
- test-driven-development

## Scope

- Novas permissões em `PermissionConstants`:
  - person.read, person.create, person.update, person.deactivate
  - assignment.read, assignment.create, assignment.update, assignment.end
  - responsibility.read, responsibility.manage
  - delegation.read, delegation.manage
  - organization.create, organization.update (complemento)
- Mapa perfil → permissões no seed (seed_dev.py) e em constante partilhada.
- AuthorizationService reutilizado (sem duplicação).
- Testes de autorização por perfil.

## Out of Scope

- Novos perfis.
- Regras de negócio de processos/documentos.

## Implementation

1. Adicionar constantes em `permissions.py`.
2. Actualizar PROFILE_PERMISSIONS no seed e qualquer constante central.
3. Garantir que ADMINISTRADOR_SISTEMA recebe as novas permissões via all_permissions().
4. Atribuir permissões de leitura organizacional aos perfis que já as tinham.
5. Testes: cada perfil tem apenas as permissões necessárias.

## Acceptance Criteria

- [ ] Novas permissões registadas e no seed.
- [ ] Nenhum perfil recebe permissões desnecessárias.
- [ ] AuthorizationService cobre person/assignment/responsibility/delegation.

## Tests

- [ ] ADMINISTRADOR_SISTEMA tem permissões administrativas.
- [ ] INSTRUTOR_PROCESSUAL NÃO tem person.create.
- [ ] AGENTE_PGR NÃO tem organization.manage.
- [ ] Seed idempotente.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(auth): add administration permissions`