# TASK-015 — final-review

## Objective

Revisão final da sprint: lint, typecheck, build, testes, revisão de segurança, migrações, documentação e relatório final.

## Context

Checkpoints do prompt §64 e Definition of Done §65. Relatório final obrigatório §69.

## Dependencies

- TASK-001..014

## Skills

- code-review-and-quality
- security-and-hardening

## Scope

- Executar: lint (ruff + eslint), typecheck (mypy + tsc), build, pytest, vitest.
- Revisão de segurança: object-level authorization, prevenção de escalada, auditoria sem secrets.
- Revisar migrations (nenhuma nova esperada — validar).
- Actualizar docs/sprints/SPRINT-02-users.md → DONE.
- Commit final: `chore(sprint-02): complete user management`.
- Relatório final obrigatório (§69): resumo, tasks, entidades, endpoints, componentes, RBAC, segurança, testes, E2E, docs, commits, problemas, débitos, dependências.
- NÃO iniciar próxima sprint.

## Acceptance Criteria

- [ ] Lint PASS
- [ ] Typecheck PASS
- [ ] Build PASS
- [ ] Tests PASS
- [ ] Security review feito
- [ ] Relatório final entregue
- [ ] PARAR após concluir

## Definition of Done

- [ ] Todos os checkpoints verdes
- [ ] Commit final realizado