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

### Iniciar

```bash
# Infraestrutura completa
cd infra && docker compose up -d

# Backend (desenvolvimento local)
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload

# Frontend (desenvolvimento local)
cd frontend
npm install
npm run dev
```

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
# Backend
cd backend && pytest

# Frontend
cd frontend && npx vitest run

# CI completo
bash scripts/ci.sh
```

### Lint + Typecheck

```bash
# Backend
cd backend
ruff check app tests
ruff format --check app tests
mypy app

# Frontend
cd frontend
npx eslint src/
npx tsc --noEmit
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
