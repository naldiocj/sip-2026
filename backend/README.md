# SIP Backend

Backend do SIP — Sistema de Instrução Processual.

**Stack:** FastAPI · Pydantic · SQLAlchemy · Alembic · PostgreSQL

## Arquitectura

Modular Monolith com fronteiras claras:

```
app/
├── core/      # configuração, logging, middleware, observabilidade
├── shared/    # abstrações partilhadas (cache, eventos, storage, search)
├── modules/   # módulos de negócio (a criar nas Sprints seguintes)
├── api/
│   └── v1/    # routers, schemas, routes
└── main.py    # factory da aplicação
```

## Desenvolvimento

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

uvicorn app.main:app --reload
```

## Verificação

```bash
ruff check app tests
ruff format --check app tests
mypy app
pytest
```

## Endpoints base

| Endpoint | Descrição |
|---|---|
| `GET /api/v1/health` | Estado geral |
| `GET /api/v1/health/live` | Liveness |
| `GET /api/v1/health/ready` | Readiness (PostgreSQL) |
| `GET /api/v1/metrics` | Métricas Prometheus |
| `GET /api/docs` | Swagger UI |

## Migrations

```bash
alembic revision --autogenerate -m "descricao"
alembic upgrade head
```

A URL da base de dados vem sempre de `DATABASE_URL` (ver `.env.example`).

## Variáveis de ambiente

Copiar `.env.example` para `.env` local. Nunca commitar secrets.