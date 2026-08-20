# AGENTS.md — Backend SIP

## Regras do Projeto (herdadas de /AGENTS.md)
- Uso obrigatório de skills (api-and-interface-design, security-and-hardening, etc.)
- graphify como fonte primária de contexto
- Ciclo: DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP
- Segurança: backend é fonte de verdade para RBAC, auth, validação
- NUNCA confiar em frontend para segurança

## Stack Backend
- Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, PostgreSQL
- Redis, RabbitMQ, MinIO, OpenSearch

## Arquitetura
- Modular Monolith (ADR-001)
- Camadas: api/ → modules/ → core/ → shared/
- Domain-oriented modularization
- Dependency Inversion

## Regras Específicas Backend
- Validação Pydantic em TODOS os endpoints
- Alembic para migrations — NUNCA alterar schema manualmente
- Logging estruturado + correlation ID
- Health checks em /health
- Testes: pytest + httpx (integration), unitários por módulo
- Typecheck: mypy strict
- Lint: ruff

## RBAC & Organizational Scope
- Backend define perfis, permissões, scopes — frontend apenas consome
- Organizational hierarchy: Unidade → Direção → Departamento → Secção
- Assignment/Delegation models (ADR-004, ADR-005)