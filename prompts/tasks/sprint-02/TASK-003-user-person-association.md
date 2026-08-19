# TASK-003 — user-person-association

## Objective

Criar o mecanismo de associação User ↔ Person com integridade.

## Context

Um User pode estar associado a uma Person; uma Person pode existir sem User. Uma conta SIP não deve estar associada a duas pessoas simultaneamente sem regra explícita. User NÃO contém os dados da Person.

## Dependencies

- TASK-001 (Person)
- SPRINT-01 (User)

## Skills

- api-and-interface-design
- test-driven-development
- security-and-hardening

## Scope

- `person_id` (nullable, FK → persons.id, unique) em `users`.
- UserService: `associate_user_to_person()`, `unlink_user_from_person()`.
- Validação de integridade (1 User → 1 Person; 1 Person → 1 User no sentido técnico).
- Evento de auditoria: USER_PERSON_LINKED / USER_PERSON_UNLINKED (integração com TASK-024).
- Testes de integridade.

## Out of Scope

- APIs (TASK-018/019).
- Frontend.
- Regra de múltiplas pessoas por conta (explícita quando necessária).

## Implementation

1. Migration: `person_id` em users (unique, nullable).
2. Relação `Person.user` / `User.person` (uselist=False).
3. Métodos no UserService (auth) ou PersonService com validação:
   - associação falha se a Person já tiver User (regra default: 1:1).
   - unlink preserva histórico (apenas remove ligação).
4. Auditoria registada no AuditService.

## Acceptance Criteria

- [ ] user.person resolvível.
- [ ] Person sem User é válida.
- [ ] Associação 1:1 garantida.
- [ ] Unlink não apaga dados.

## Tests

- [ ] Associar User a Person.
- [ ] Rejeitar segunda associação da mesma Person.
- [ ] Unlink funciona e preserva Person.
- [ ] Migração aplicável/rollback.

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(person): add user-person association`