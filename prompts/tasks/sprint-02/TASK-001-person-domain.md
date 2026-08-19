# TASK-001 — person-domain

## Objective

Criar a entidade `Person` — uma pessoa real conhecida pelo SIP, independente de `User`.

## Context

O SIP precisa representar pessoas reais (vítimas, arguidos, agentes, testemunhas, etc.) sem assumir que toda a pessoa possui conta SIP. A SPRINT-01 criou `User` (autenticação) — agora a fundação administrativa exige `Person`.

Regra arquitectural: PERSON ≠ USER. Person não contém password nem dados de autenticação.

## Dependencies

- SPRINT-01 (User, Profile, Permission)
- TASK-002 (dados funcionais — mesma migration)

## Skills

- spec-driven-development (especificação)
- incremental-implementation
- test-driven-development
- api-and-interface-design

## Scope

- Entidade `Person` em `backend/app/modules/person/domain/`.
- `person_number` interno (ex.: PES-000001) gerado por serviço/sequência.
- Status: ACTIVE, INACTIVE, RETIRED, DECEASED, UNKNOWN.
- `PersonStatus`, labels humanizadas em `domain/humanize.py`.
- Migration Alembic.
- PersonService (create, get, list, update, deactivate) sem APIs ainda.
- Testes de domínio.

## Out of Scope

- User ↔ Person (TASK-003).
- Dados funcionais (TASK-002).
- APIs (TASK-018).
- Frontend (TASK-021).

## Implementation

1. Criar módulo `backend/app/modules/person/` com estrutura domain/application.
2. Entidade `Person` com campos: id, person_number, full_name, preferred_name, birth_date, birth_place, nationality, gender, bi_number, phone, email, address, status, is_active, created_at, updated_at.
3. `PersonStatus` (StrEnum) + `PERSON_STATUS_LABELS`.
4. Serviço de geração de person_number: `PES-{N:06d}` com base numa sequência/consulta (evitar corridas: usar block com lock ou sequência DB).
5. PersonService com validações (email/phone opcionais, BI não é chave).
6. Migration `add_person_tables`.

## Acceptance Criteria

- [ ] Person existe com campos mínimos do prompt.
- [ ] person_number único, gerado automaticamente.
- [ ] BI nunca é chave primária nem único obrigatório.
- [ ] Person pode existir sem User.
- [ ] Sem campos de autenticação em Person.
- [ ] Humanização de status disponível.

## Tests

- [ ] Teste de criação com person_number gerado.
- [ ] Teste de unicidade do person_number.
- [ ] Teste de status humanizado.
- [ ] Teste de listagem/actualização/desactivação.

## Definition of Done

- [ ] Domain implementado
- [ ] Migration criada e aplicada
- [ ] Testes passam
- [ ] Lint/typecheck passam
- [ ] Commit: `feat(person): add person domain`