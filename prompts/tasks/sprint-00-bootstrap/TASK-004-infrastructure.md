# TASK-004 — Infrastructure (Docker Compose)

## Objective

Criar Docker Compose com 10 serviços: backend, frontend, nginx, postgres,
redis, rabbitmq, minio, opensearch, prometheus, grafana.

## Scope

- `infra/docker-compose.yml` — todos os serviços
- `infra/docker/nginx/default.conf` — reverse proxy
- `backend/.env.docker` — variáveis de ambiente para Docker
- Named volumes para dados persistentes
- Health checks para postgres e redis

## Dependencies

- TASK-002, TASK-003

## Implementation

1. Criar `infra/docker-compose.yml` com 10 serviços
2. Configurar Nginx: `/api` → backend:8000, `/` → frontend:3000
3. Configurar named volumes
4. Configurar health checks (postgres, redis)
5. Configurar network `sip`
6. Criar `infra/docker/nginx/default.conf`
7. Validar: `docker compose config`
8. Commit

## Verification

```bash
cd infra
docker compose config --quiet
docker compose up -d
curl http://localhost/health
curl http://localhost:3000
```

## Acceptance Criteria

- [x] docker compose config válido
- [x] 10 serviços definidos
- [x] Nginx reverse proxy funcional (/api → backend, / → frontend)
- [x] Named volumes para dados persistentes
- [x] Health checks para postgres e redis
- [x] Network `sip` configurada

## Tests

Não aplicável — validação via `docker compose config`.
