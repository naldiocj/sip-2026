# TASK-002 — Backend Bootstrap

## Objective

Criar o backend FastAPI com toda a estrutura arquitectural definida no
PROMPT 00 §29: core, shared, api/v1, db, main.py, testes, lint,
typecheck, Dockerfile.

## Scope

- `backend/app/core/` — config, logging, middleware, context, observability
- `backend/app/api/` — v1 routes (health, metrics), global error handling
- `backend/app/db/` — SQLAlchemy base, session, Alembic baseline
- `backend/app/shared/` — cache (Redis), events (RabbitMQ), storage (MinIO), search (OpenSearch)
- `backend/app/modules/` — vazio (preparado para Sprint 01+)
- `backend/tests/` — conftest + testes unitários
- `backend/pyproject.toml` — deps, ruff, mypy, pytest
- `backend/Dockerfile` — multi-stage build
- `backend/.env.docker` — variáveis para Docker Compose
- Alembic baseline migration (vazia)

## Dependencies

- TASK-001

## Implementation

1. Criar `pyproject.toml` com dependências (fastapi, uvicorn, sqlalchemy,
   alembic, pydantic-settings, structlog, prometheus-client, etc.)
2. Criar `app/core/config.py` — Settings via pydantic-settings
3. Criar `app/core/logging.py` — structlog configurado
4. Criar `app/core/context.py` — ContextVars (request_id, correlation_id)
5. Criar `app/core/middleware.py` — Correlation ID middleware
6. Criar `app/core/observability.py` — Prometheus metrics + OTLP condicional
7. Criar `app/api/errors.py` — Global exception handlers (ApiErrorResponse)
8. Criar `app/api/v1/routes/health.py` — /api/v1/health, /health/live, /health/ready
9. Criar `app/api/v1/routes/metrics.py` — /api/v1/metrics (Prometheus)
10. Criar `app/api/v1/router.py` — APIRouter v1
11. Criar `app/db/base.py` — Base, TimestampMixin, UUIDPrimaryKeyMixin
12. Criar `app/db/session.py` — Engine + sessionmaker
13. Criar `app/shared/` — cache.py, events.py, storage.py, search.py (abstrações)
14. Criar `app/main.py` — FastAPI app factory
15. Criar `alembic.ini` + `alembic/env.py` + baseline migration
16. Criar `tests/conftest.py` + testes
17. Criar `Dockerfile` multi-stage
18. Criar `.env.docker`
19. Executar: ruff check, ruff format, mypy, pytest
20. Commit

## Verification

```bash
cd backend
ruff check app tests
ruff format --check app tests
mypy app
pytest -v
docker compose up backend
curl http://localhost:8000/api/v1/health
```

## Acceptance Criteria

- [x] Backend arranca sem erros com uvicorn
- [x] /api/v1/health retorna 200
- [x] /health/live retorna 200
- [x] /health/ready retorna 503 (sem DB)
- [x] ruff check passa sem erros
- [x] ruff format passa sem erros
- [x] mypy passa sem erros
- [x] pytest passa (10 testes)
- [x] Dockerfile multi-stage funcional

## Tests

10 testes unitários: conftest (fixtures), test_health (health endpoints),
test_errors (exception handlers), test_correlation (middleware).
