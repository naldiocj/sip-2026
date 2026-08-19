# SPRINT-02 — Administração, Gestão de Pessoas, Estrutura Organizacional, Lotação e Atribuições

## Status

**IN_PROGRESS**

## Objetivo

Implementar a fundação administrativa, organizacional e funcional do SIP:

- pessoas;
- utilizadores;
- perfis;
- permissões;
- organização;
- direções;
- departamentos;
- secções;
- unidades;
- piquetes;
- lotações;
- funções;
- atribuições;
- responsabilidades;
- delegações;
- substituições;
- contexto organizacional;
- contexto de acesso;
- histórico;
- auditoria.

Regra arquitectural fundamental: NÃO misturar PERSON, USER, PROFILE, PERMISSION,
ORGANIZATION, ORGANIZATIONAL UNIT, ASSIGNMENT, RESPONSIBILITY, SCOPE, OWNERSHIP.
Cada conceito possui responsabilidade própria.

## Tasks

| ID | Task | Estado |
|---|---|---|
| TASK-001 | person-domain | DONE |
| TASK-002 | person-functional-data | DONE |
| TASK-003 | user-person-association | DONE |
| TASK-004 | profile-permission-integration | PARTIAL |
| TASK-005 | organization-domain | DONE |
| TASK-006 | organizational-unit | DONE |
| TASK-007 | organizational-hierarchy | PLANNED |
| TASK-008 | organizational-unit-types | PLANNED |
| TASK-009 | user-assignment | DONE |
| TASK-010 | lotacao | DONE |
| TASK-011 | functional-role | PARTIAL |
| TASK-012 | responsibility | DONE |
| TASK-013 | delegation | DONE |
| TASK-014 | substitution | DONE |
| TASK-015 | access-context | PARTIAL |
| TASK-016 | scope-engine | DONE |
| TASK-017 | organization-api | PARTIAL |
| TASK-018 | person-management-api | PLANNED |
| TASK-019 | assignment-api | PARTIAL |
| TASK-020 | organization-ui | PARTIAL |
| TASK-021 | person-management-ui | PLANNED |
| TASK-022 | assignment-ui | PLANNED |
| TASK-023 | organization-tree | PARTIAL |
| TASK-024 | audit-integration | PARTIAL |
| TASK-025 | security-review | PLANNED |
| TASK-026 | backend-tests | PARTIAL |
| TASK-027 | frontend-tests | PLANNED |
| TASK-028 | e2e-tests | PLANNED |
| TASK-029 | documentation | PARTIAL |
| TASK-030 | final-review | PLANNED |

## Dependencies

- SPRINT-01 (Identity, Auth, Authorization) — DONE.
- SPRINT-00 (Bootstrap, Infra, Observability) — DONE.

## Architecture

- Modular Monolith (manter).
- Separação: domain / application / infrastructure / presentation.
- Módulo `organization` existente será expandido.
- Novo módulo `person` para o domínio de pessoas.
- AuthorizationService da SPRINT-01 como base de autorização.
- AccessContext como objecto de consulta, nunca de negócio.
- Scope Engine: fundação apenas (sem regras de processos/documentos/piquete).

## Acceptance Criteria

- Representar pessoas reais (Person) independentes de User.
- person_number interno (ex.: PES-000001); BI nunca é chave primária.
- Dados pessoais ≠ dados funcionais ≠ dados de autenticação.
- Um User pode associar-se a uma Person; Person pode existir sem User.
- Organization (INTERNAL/EXTERNAL), OrganizationalUnit, UnitTypes.
- Hierarquia por parent_id com serviço central e validação de integridade.
- UserAssignment com tipos (PRIMARY, SECONDARY, TEMPORARY, ACTING, DELEGATED).
- Regra: uma atribuição PRIMARY activa por utilizador.
- Histórico de lotação preservado (start_date/end_date, sem apagar).
- FunctionalRole distinto de Profile.
- Responsibility com tipos de âmbito (GLOBAL..PGR).
- Delegation ≠ Substitution (conceitos separados).
- AccessContext completo: user, person, profiles, permissions, organization,
  primary_assignment, assignments, responsibilities, delegations, effective_scopes.
- GET /api/v1/me/context.
- APIs: persons, organizations, units, assignments, responsibilities, delegations.
- Frontend /administracao com rotas humanizadas.
- Auditoria de todas as operações administrativas (sem passwords/tokens).
- Backend valida sempre (sidebar NÃO é segurança).
- Humanização de todos os enums exibidos.
- Migrations Alembic para toda alteração de schema.
- Seeds de desenvolvimento (organização, direções, departamentos, secções,
  piquete, pessoas, utilizadores, atribuições, responsabilidades).

## Definition of Done

- [ ] Person, dados funcionais, User ↔ Person
- [ ] Profiles/permissions integrados
- [ ] Organization, Unit, UnitTypes, Hierarchy + HierarchyService
- [ ] UserAssignment, lotação, histórico
- [ ] FunctionalRole, Responsibility, Delegation, Substitution
- [ ] AccessContext, ScopeEngine foundation
- [ ] Backend APIs
- [ ] Frontend Administração (pessoas, organização, atribuições, responsabilidades)
- [ ] Organization Tree
- [ ] Sidebar actualizado
- [ ] Humanização
- [ ] Auditoria
- [ ] Security review
- [ ] Migrations
- [ ] Seeds
- [ ] Backend tests
- [ ] Frontend tests
- [ ] E2E tests
- [ ] Swagger/OpenAPI
- [ ] Documentação + ADRs
- [ ] Lint PASS
- [ ] Typecheck PASS
- [ ] Tests PASS
- [ ] Build PASS
- [ ] Todas as Tasks DONE
- [ ] Commits realizados

## Checkpoints

- CHECKPOINT A: Person + User
- CHECKPOINT B: Organization + Units
- CHECKPOINT C: Hierarchy
- CHECKPOINT D: Assignments
- CHECKPOINT E: Responsibilities
- CHECKPOINT F: Delegations
- CHECKPOINT G: Frontend
- CHECKPOINT H: Security + Tests

## Regra

NÃO iniciar SPRINT-03 automaticamente.