# TASK-014 — documentation

## Objective

Documentar a gestão de utilizadores e o contexto organizacional do utilizador; actualizar docs existentes e o sprint doc.

## Context

Prompt §60: docs/sprints/SPRINT-02.md, docs/architecture/user-management.md, docs/architecture/user-organizational-context.md. A sprint é SPRINT-02.1 (SPRINT-02.md já documenta a sprint executada — não sobrescrever).

## Dependencies

- TASK-001..013

## Skills

- documentation-and-adrs

## Scope

- `docs/sprints/SPRINT-02-users.md`: status DONE quando concluída.
- `docs/architecture/user-management.md`: ciclo de vida, estado da conta, perfis, auditoria, API.
- `docs/architecture/user-organizational-context.md`: UserAssignment como contexto organizacional do utilizador, selects dependentes, regra de PRIMARY, histórico, integração com AccessContext.
- Actualizar ADR existentes se necessário (sem criar ADR novo salvo decisão relevante).

## Out of Scope

- Documentação de módulos não tocados.

## Implementation

1. Escrever docs de arquitectura.
2. Actualizar sprint doc + roadmap se aplicável.

## Acceptance Criteria

- [ ] Docs criadas e consistentes com o código.
- [ ] Humanização documentada (enums → labels).

## Tests

- [ ] Revisão manual da documentação

## Definition of Done

- [ ] Documentado
- [ ] Commit: `docs(users): document user management`