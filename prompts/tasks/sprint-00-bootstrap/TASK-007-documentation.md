# TASK-007 — Documentation

## Objective

Criar toda a documentação necessária: README, AGENTS.md, documentação
de arquitectura, ADR, documentação de componentes documentais, sprint
tracking, e sistema de tasks.

## Scope

- `README.md` — overview do projecto
- `AGENTS.md` — regras para agentes IA
- `docs/architecture/system-architecture.md` — diagrama de arquitectura
- `docs/architecture/document-architecture.md` — fluxo do document engine
- `docs/architecture/document-component-library.md` — especificação de 22 componentes
- `docs/adr/ADR-001-modular-monolith.md` — decisão de arquitectura
- `docs/sprints/SPRINT-00.md` — tracking da sprint
- `prompts/tasks/README.md` — índice do sistema de tasks
- `prompts/tasks/sprint-00-bootstrap/` — ficheiros TASK-001 a TASK-007

## Dependencies

- TASK-001 a TASK-006 (todas as tasks anteriores)

## Implementation

1. Criar `README.md`
2. Criar `AGENTS.md`
3. Criar `docs/architecture/system-architecture.md`
4. Criar `docs/architecture/document-architecture.md`
5. Criar `docs/architecture/document-component-library.md`
6. Criar `docs/adr/ADR-001-modular-monolith.md`
7. Criar `docs/sprints/SPRINT-00.md`
8. Criar `prompts/tasks/README.md`
9. Criar `prompts/tasks/sprint-00-bootstrap/TASK-002` a `TASK-007`
10. Marcar todas as tasks como DONE no SPRINT-00.md
11. Commit

## Verification

```bash
cat README.md
cat AGENTS.md
cat docs/architecture/system-architecture.md
cat docs/architecture/document-component-library.md
cat docs/adr/ADR-001-modular-monolith.md
cat docs/sprints/SPRINT-00.md
ls prompts/tasks/sprint-00-bootstrap/
```

## Acceptance Criteria

- [x] README.md com overview do projecto
- [x] AGENTS.md com regras para agentes IA
- [x] Documentação de arquitectura completa
- [x] ADR-001 registado
- [x] Sprint 00 marcada como DONE
- [x] Sistema de tasks criado (TASK-001 a TASK-007)
- [x] Documentação de componentes documentais (22 componentes)

## Tests

Não aplicável — validação é a existência dos ficheiros.
