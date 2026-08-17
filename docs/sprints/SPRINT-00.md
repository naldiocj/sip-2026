# SPRINT-00 — Bootstrap / Architecture

## Objetivo

Criar a fundação técnica completa do SIP: backend, frontend, infraestrutura,
testes, lint, CI e documentação arquitectural.

## Estado

**DONE**

## Tasks

| ID | Task | Estado |
|---|---|---|
| TASK-001 | Análise do repositório | DONE |
| TASK-002 | Backend FastAPI | DONE |
| TASK-003 | Frontend Next.js | DONE |
| TASK-004 | Infraestrutura Docker | DONE |
| TASK-005 | Observabilidade | DONE |
| TASK-006 | Testes + CI | DONE |
| TASK-007 | Documentação | DONE |

## Critérios de Conclusão

- [x] Repositório analisado
- [x] Arquitectura definida
- [x] Backend FastAPI funcional
- [x] Frontend Next.js funcional
- [x] PostgreSQL configurado
- [x] Alembic funcional
- [x] Redis configurado
- [x] RabbitMQ configurado
- [x] MinIO configurado
- [x] OpenSearch configurado
- [x] Prometheus configurado
- [x] Grafana configurado
- [x] Docker Compose funcional
- [x] Health checks funcionais
- [x] Logging estruturado
- [x] Correlation ID
- [x] Testes configurados
- [x] Lint configurado
- [x] Typecheck configurado
- [x] CI configurado
- [x] AGENTS.md criado
- [x] Documentação criada
- [x] ADR inicial criado
- [x] Document Engine documentado
- [x] Document Component Library criada
- [x] Sistema de Tasks criado
- [x] Sistema de Sprints criado
- [x] Todos os testes passam
- [x] Build passa

## Riscos

- Node.js com problemas de rede no host (resolved via Docker).
- Base UI (shadcn) usa `render` prop em vez de `asChild`.

## Decisões

- ADR-001: Modular Monolith adoptado.
- Backend e frontend correm em Docker.
- Hot reload via volumes montados.
