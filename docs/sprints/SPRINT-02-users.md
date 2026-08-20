# SPRINT-02.1 — Gestão de Utilizadores

## Status

**IN_PROGRESS**

## Origem

Prompt: `prompts/SPRINT-02-1-users.md` — Gestão de Utilizadores, Perfis, Permissões e Contexto Organizacional.

Esta sprint complementa a SPRINT-02 já executada (Administração, Pessoas, Organização, Lotação, Atribuições). Reutiliza as fundações existentes:

- `User` / `UserStatus` / `Profile` / `Permission` (SPRINT-01).
- `UserAssignment` + `AssignmentService` (PRIMARY única activa, períodos, histórico preservado).
- `OrganizationalUnit` + hierarquia (Direcção → Departamento → Secção → Unidade).
- `AccessContextService` + `GET /me/context`.
- `AuditService` + `AuthorizationService`.

**NÃO** se cria uma nova entidade `UserOrganizationalAssignment`: o modelo `UserAssignment` existente cobre o contexto organizacional do utilizador (prompt §5–7: "Avaliar a arquitetura existente antes de implementar. Não duplicar campos se OrganizationalUnit já existir.").

## Decisões Arquitecturais

1. **Reutilizar `UserAssignment`** como contexto organizacional do utilizador (não duplicar).
2. **`UserService` novo** no módulo `auth` (ciclo de vida: create/update/activate/deactivate/block/unblock + perfis).
3. **Estado `SUSPENDED`** adicionado a `UserStatus` (prompt §33). Coluna é `String(20)` — sem migration necessária para o valor do enum; manter `PENDING` para contas recém-criadas.
4. **Eventos de auditoria novos**: `USER_CREATED`, `USER_UPDATED`, `USER_ACTIVATED`, `USER_DEACTIVATED`, `USER_BLOCKED`, `USER_UNBLOCKED`, `USER_PROFILE_ASSIGNED`, `USER_PROFILE_REMOVED`, `USER_PRIMARY_ASSIGNMENT_CHANGED`. Manter `ASSIGNMENT_*` existentes para atribuições.
5. **Desactivação/bloqueio revogam sessões** do utilizador (Session revoke, padrão existente).
6. **Selects dependentes**: endpoint de unidades filtrável por `parent_id` (e tipo) para carregar apenas o nível necessário.
7. **Perfil principal**: o formulário de criação permite seleccionar o perfil; o modelo M2M `user_profiles` é mantido (sem `is_primary` — decisão documentada, evita mudança de schema desnecessária; a regra "PRIMARY" aplica-se à atribuição organizacional).
8. **Auditoria consultável**: novo endpoint `GET /api/v1/audit` (permissão `system.audit`) com filtro `user_id` para o histórico do utilizador.

## Tasks

| ID | Task | Estado |
|---|---|---|
| TASK-001 | user-domain-service | DONE |
| TASK-002 | user-crud-api | DONE |
| TASK-003 | user-status-api | DONE |
| TASK-004 | user-profiles-api | DONE |
| TASK-005 | org-context-api | DONE |
| TASK-006 | user-frontend-data | DONE |
| TASK-007 | user-list-ui | DONE |
| TASK-008 | user-form-ui | DONE |
| TASK-009 | user-detail-ui | DONE |
| TASK-010 | user-assignments-ui | DONE |
| TASK-011 | user-security-ui | DONE |
| TASK-012 | backend-tests | DONE |
| TASK-013 | frontend-tests | DONE |
| TASK-014 | documentation | PLANNED |
| TASK-015 | final-review | PLANNED |

## Cobertura E2E (TASK-013)

O projecto **não tem infraestrutura Playwright**. Os cenários E2E-001..005 do
prompt são cobertos ao nível adequado ao projecto:

- **E2E-001..005** → `backend/tests/modules/auth/test_e2e_scenarios.py`
  (integração pytest contra a API real: criar utilizador com perfil +
  contexto completo + principal; segunda atribuição secundária; mudança de
  principal despromove a anterior; não autorizado → 403; `GET /me/context`
  com contexto correcto).
- **UI** → testes de componente vitest: `user-data-table`, `user-form`,
  `user-detail`, `user-assignments`, `user-security`, `user-profiles`
  (`frontend/src/__tests__/`).
- **Autorização 9 perfis + integridade** → `test_user_authorization.py`
  (matriz completa, prevenção de escalada, PRIMARY única → 409, períodos
  inválidos → 422).

### Gap registado (decisão)

A **validação hierárquica de atribuições** (ex.: Direcção A + Departamento
da Direcção C → REJECT; unidade incompatível) **não está implementada** no
`AssignmentService` nem documentada nos ADRs (ADR-003/004 definem apenas:
PRIMARY única activa, períodos válidos, histórico preservado). Decisão:
testar apenas as regras documentadas; a validação hierárquica fica como gap
para decisão do dono do produto (regra exacta de compatibilidade ainda por
definir).

## Dependências

- SPRINT-01 (Identity, Auth, Authorization) — DONE.
- SPRINT-02 (Person, Organization, UserAssignment, AccessContext) — DONE (excepto frontend-tests/E2E/final-review).

## API alvo

```
GET    /api/v1/users                      (listagem paginada + filtros + pesquisa)
POST   /api/v1/users
GET    /api/v1/users/{id}
PATCH  /api/v1/users/{id}
POST   /api/v1/users/{id}/activate
POST   /api/v1/users/{id}/deactivate
POST   /api/v1/users/{id}/block
POST   /api/v1/users/{id}/unblock
POST   /api/v1/users/{id}/profiles        (atribuir perfil)
DELETE /api/v1/users/{id}/profiles/{profile_id}
GET    /api/v1/profiles                   (listagem para pickers)
GET    /api/v1/users/{id}/assignments     (EXISTE)
POST   /api/v1/users/{id}/assignments     (EXISTE)
PATCH  /api/v1/users/{id}/assignments/{assignment_id}   (EXISTE)
POST   /api/v1/users/{id}/assignments/{assignment_id}/end (EXISTE)
GET    /api/v1/me/context                 (EXISTE)
GET    /api/v1/audit?user_id=             (NOVO — histórico de auditoria)
GET    /api/v1/units?parent_id=&type_id=  (EXISTE — adicionar filtros para selects dependentes)
```

## Definition of Done

- [ ] User CRUD + pesquisa + filtros + paginação
- [ ] Estado da conta: activate/deactivate/block/unblock (+ SUSPENDED)
- [ ] Gestão de perfis do utilizador
- [ ] Contexto organizacional (selects dependentes, caminho hierárquico)
- [ ] Atribuições (lista, criar, editar, terminar, principal)
- [ ] Auditoria (eventos USER_*, consulta por utilizador)
- [ ] Frontend: lista, formulário, detalhe, atribuições, acções
- [ ] Humanização de enums
- [ ] Testes unitários + autorização + integridade
- [ ] Lint PASS / Typecheck PASS / Build PASS / Tests PASS
- [ ] Documentação (user-management, user-organizational-context)
- [ ] Commits Conventional
- [ ] Todas as Tasks DONE

## Regra de Transição

NÃO implementar domínios da SPRINT-03 (pessoas/organização completas já existem e NÃO são duplicadas). NÃO iniciar sprints seguintes automaticamente.