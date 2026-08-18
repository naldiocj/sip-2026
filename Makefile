.DEFAULT_GOAL := help

COMPOSE := docker compose -f infra/docker-compose.yml

# ──────────────────────────────────────────────
# Help
# ──────────────────────────────────────────────

.PHONY: help
help: ## Mostra todos os targets disponíveis
	@echo "SIP — Makefile"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ──────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────

.PHONY: setup
setup: ## Cria .env.local a partir de .env.example (se não existir)
	@test -f backend/.env.local || (cp backend/.env.example backend/.env.local && echo "✓ backend/.env.local criado")
	@test -f frontend/.env.local || (cp frontend/.env.example frontend/.env.local && echo "✓ frontend/.env.local criado")

# ──────────────────────────────────────────────
# Install
# ──────────────────────────────────────────────

.PHONY: install
install: install-backend install-frontend ## Instala dependências do backend e frontend

.PHONY: install-backend
install-backend: ## Instala dependências do backend (venv + pip)
	python3 -m venv backend/.venv
	backend/.venv/bin/pip install --upgrade pip
	backend/.venv/bin/pip install -e "backend[dev]"

.PHONY: install-frontend
install-frontend: ## Instala dependências do frontend (npm)
	cd frontend && npm install --legacy-peer-deps

# ──────────────────────────────────────────────
# Docker Compose — Infra
# ──────────────────────────────────────────────

.PHONY: infra-up
infra-up: ## Sobe infraestrutura dev (postgres, redis, backend, frontend, nginx)
	$(COMPOSE) --profile dev up -d

.PHONY: infra-up-all
infra-up-all: ## Sobe tudo: app + RabbitMQ + MinIO
	$(COMPOSE) --profile all up -d

.PHONY: infra-up-heavy
infra-up-heavy: ## Sobe tudo + OpenSearch (~2GB RAM extra)
	$(COMPOSE) --profile all --profile heavy up -d

.PHONY: infra-up-obs
infra-up-obs: ## Sobe tudo + Prometheus + Grafana
	$(COMPOSE) --profile all --profile obs up -d

.PHONY: infra-up-full
infra-up-full: ## Sobe tudo: app + heavy + obs (uso completo)
	$(COMPOSE) --profile all --profile heavy --profile obs up -d

.PHONY: infra-down
infra-down: ## Para e remove todos os containers
	$(COMPOSE) --profile dev --profile all --profile heavy --profile obs down

.PHONY: infra-stop
infra-stop: ## Para containers sem os remover
	$(COMPOSE) --profile dev --profile all --profile heavy --profile obs stop

.PHONY: infra-logs
infra-logs: ## Mostra logs de todos os containers
	$(COMPOSE) --profile dev --profile all --profile heavy --profile obs logs -f

.PHONY: infra-ps
infra-ps: ## Lista containers e estado
	$(COMPOSE) --profile dev --profile all --profile heavy --profile obs ps

.PHONY: infra-build
infra-build: ## Reconstrói imagens Docker
	$(COMPOSE) --profile dev --profile all --profile heavy --profile obs build --no-cache

.PHONY: infra-pull
infra-pull: ## Pull das imagens base
	$(COMPOSE) --profile dev --profile all --profile heavy --profile obs pull

.PHONY: infra-clean
infra-clean: ## Limpa imagens, volumes e build cache não utilizados
	docker system prune -f
	docker volume prune -f

# ──────────────────────────────────────────────
# Dev (local)
# ──────────────────────────────────────────────

.PHONY: dev-backend
dev-backend: ## Corre o backend localmente (uvicorn --reload)
	cd backend && .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: dev-frontend
dev-frontend: ## Corre o frontend localmente (next dev)
	cd frontend && npm run dev

# ──────────────────────────────────────────────
# Testes
# ──────────────────────────────────────────────

.PHONY: test
test: ## Corre todos os testes (backend + frontend)
	bash scripts/ci.sh

.PHONY: test-backend
test-backend: ## Corre testes do backend
	cd backend && pytest

.PHONY: test-frontend
test-frontend: ## Corre testes do frontend
	cd frontend && npx vitest run

# ──────────────────────────────────────────────
# Lint
# ──────────────────────────────────────────────

.PHONY: lint
lint: lint-backend lint-frontend ## Corre lint em backend e frontend

.PHONY: lint-backend
lint-backend: ## Ruff check + format no backend
	cd backend && ruff check app tests && ruff format --check app tests

.PHONY: lint-frontend
lint-frontend: ## ESLint no frontend
	cd frontend && npx eslint src/

# ──────────────────────────────────────────────
# Typecheck
# ──────────────────────────────────────────────

.PHONY: typecheck
typecheck: typecheck-backend typecheck-frontend ## Typecheck backend e frontend

.PHONY: typecheck-backend
typecheck-backend: ## mypy no backend
	cd backend && mypy app

.PHONY: typecheck-frontend
typecheck-frontend: ## tsc --noEmit no frontend
	cd frontend && npx tsc --noEmit

# ──────────────────────────────────────────────
# CI
# ──────────────────────────────────────────────

.PHONY: ci
ci: ## Corre CI completo (lint + typecheck + test)
	bash scripts/ci.sh

# ──────────────────────────────────────────────
# DB
# ──────────────────────────────────────────────

.PHONY: db-migrate
db-migrate: ## Corre alembic upgrade head
	cd backend && alembic upgrade head

.PHONY: db-revision
db-revision: ## Cria nova revisão (usage: make db-revision m="mensagem")
	cd backend && alembic revision --autogenerate -m "$(m)"
