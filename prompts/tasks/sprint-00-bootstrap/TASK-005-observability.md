# TASK-005 — Observability

## Objective

Configurar observabilidade: Prometheus auto-scrape, Grafana provisioning,
backend metrics endpoint, OpenTelemetry condicional.

## Scope

- `infra/docker/prometheus/prometheus.yml` — scrape config
- `infra/docker/grafana/provisioning/` — datasource provisioning
- Backend `/api/v1/metrics` endpoint (Prometheus)
- OpenTelemetry condicional (OTLP endpoint)

## Dependencies

- TASK-002, TASK-004

## Implementation

1. Criar `infra/docker/prometheus/prometheus.yml`
2. Criar `infra/docker/grafana/provisioning/datasources/prometheus.yml`
3. Configurar backend metrics endpoint (`/api/v1/metrics`)
4. Configurar OpenTelemetry condicional (OTLP)
5. Validar Prometheus scrape config
6. Commit

## Verification

```bash
cd infra
docker compose up -d prometheus grafana
curl http://localhost:9090/api/v1/targets
curl http://localhost:3001/api/datasources
docker compose up backend
curl http://localhost:8000/api/v1/metrics
```

## Acceptance Criteria

- [x] Prometheus auto-scrape config válido
- [x] Grafana provisiona Prometheus como datasource
- [x] Backend `/api/v1/metrics` retorna métricas
- [x] OpenTelemetry condicional (só se OTLP configurado)

## Tests

Não aplicável — validação via Prometheus/Grafana UI.
