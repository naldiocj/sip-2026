# Arquitectura do Sistema SIP

## Visão Geral

O SIP é um **Modular Monolith** com fronteiras claras entre módulos.

```
┌──────────────────────────────────────────────┐
│                   NGINX                       │
│            (Reverse Proxy)                    │
├──────────────────┬───────────────────────────┤
│   Frontend       │        Backend            │
│   Next.js 16     │        FastAPI            │
│   React 19       │        Python 3.12        │
│   App Router     │        Modular Monolith   │
│   Port: 3000     │        Port: 8000         │
└──────────────────┴───────────────────────────┘
                       │
          ┌────────────┼───────────────┐
          │            │               │
    ┌─────┴─────┐ ┌────┴────┐ ┌───────┴───────┐
    │ PostgreSQL │ │  Redis  │ │   RabbitMQ    │
    │  (fonte    │ │ (cache) │ │  (eventos)   │
    │  de dados) │ └─────────┘ └───────────────┘
    └───────────┘
          │
    ┌─────┴──────┐ ┌──────────┐ ┌──────────────┐
    │   MinIO    │ │OpenSearch│ │  Prometheus  │
    │ (storage)  │ │ (search) │ │  + Grafana   │
    └────────────┘ └──────────┘ └──────────────┘
```

## Princípios

1. **Modular Monolith** — módulos com fronteiras claras, sem microserviços.
2. **SOLID + Clean Architecture** — onde fizer sentido.
3. **DDD pragmático** — domínio, aplicação, infraestrutura por módulo.
4. **Simplicidade** — padrões apenas quando necessários.
5. **Segurança** — autorização sempre no backend.

## Módulos

Cada módulo (futuro) seguirá:

```
module/
├── domain/        # Entidades, value objects, regras
├── application/   # Use cases, services
├── infrastructure/ # Repositories, external adapters
├── api/           # Routers, schemas
└── tests/
```

## Comunicação

- **Síncrona**: HTTP/REST entre frontend e backend.
- **Assíncrona**: RabbitMQ (eventos de domínio).
- **Cache**: Redis (rate limiting, sessões, cache de leitura).

## Observabilidade

- Logs estruturados (structlog + correlation ID).
- Métricas HTTP (Prometheus).
- Traces (OpenTelemetry, condicional).

## Segurança

- JWT (a implementar na Fase 01).
- RBAC com perfis e permissões.
- Backend valida tudo — frontend nunca é fonte de autorização.
