# SIP — Sistema de Instrução Processual

Plataforma de gestão processual e documental para o Serviço de Investigação Criminal.

## Arquitectura

Modular Monolith — backend FastAPI, frontend Next.js, PostgreSQL, Redis, RabbitMQ, MinIO, OpenSearch.

## Stack

| Camada | Tecnologias |
|---|---|
| Backend | Python 3.12, FastAPI, Pydantic, SQLAlchemy, Alembic |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Async | RabbitMQ 3 |
| Storage | MinIO |
| Search | OpenSearch 2.17 |
| Observability | OpenTelemetry, Prometheus, Grafana |
| Infra | Docker Compose, Nginx |

## Desenvolvimento

### Pré-requisitos

- Docker + Docker Compose
- Python 3.12+
- Node.js 22+

### Quick Start

```bash
make setup          # cria .env.local (se não existir)
make install        # instala deps backend + frontend
make infra-up       # sobe containers base (postgres, redis, rabbitmq, minio)
make dev-backend    # uvicorn --reload (porta 8000)
make dev-frontend   # next dev (porta 3000)
```

Ver todos os targets: `make help`

### Docker Compose Profiles

A infraestrutura usa **profiles** para evitar subir serviços pesados desnecessariamente.

| Comando | O que sobe |
|---|---|
| `make infra-up` | postgres, redis, backend, frontend, nginx, rabbitmq, minio |
| `make infra-up-heavy` | acima + OpenSearch (~2GB RAM) |
| `make infra-up-obs` | acima + Prometheus + Grafana |
| `make infra-up-all` | tudo |

**Profile `all`** (default): postgres, redis, backend, frontend, nginx, rabbitmq, minio
**Profile `heavy`**: opensearch
**Profile `obs`**: prometheus, grafana

### Endpoints

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/v1/health |
| Swagger | http://localhost:8000/api/docs |
| Nginx | http://localhost |
| RabbitMQ | http://localhost:15672 |
| MinIO | http://localhost:9001 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

### Testes

```bash
make test           # CI completo (backend + frontend)
make test-backend   # pytest
make test-frontend  # vitest run
```

### Lint + Typecheck

```bash
make lint           # backend + frontend
make typecheck      # backend + frontend
make ci             # lint + typecheck + test
```

## Estrutura

```
sip/
├── backend/          # FastAPI (Modular Monolith)
├── frontend/         # Next.js (App Router)
├── infra/            # Docker Compose + Nginx + Prometheus
├── docs/             # Documentação arquitectural
├── prompts/          # Prompts e tasks por sprint
├── scripts/          # Scripts utilitários
├── Makefile          # Comandos de dev, infra, lint, test
├── AGENTS.md         # Regras para agentes IA
└── README.md
```

## Fases

| Fase | Estado |
|---|---|
| Fase 00 — Bootstrap / Arquitectura | Em curso |
| Fase 01 — Identidade + Auth | Pendente |
| Fase 02 — Organização + Utilizadores | Pendente |
| ... | ... |
| Fase 16 — QA + Release | Pendente |

## Licença

Uso interno — SIC.
