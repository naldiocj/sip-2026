# TASK-006 — CI (Continuous Integration)

## Objective

Configurar CI com GitHub Actions e script local para validação completa
do código (lint, typecheck, testes).

## Scope

- `.github/workflows/ci.yml` — GitHub Actions workflow
- `scripts/ci.sh` — script local de CI
- Jobs: backend (ruff, mypy, pytest) + frontend (eslint, tsc, vitest, build)

## Dependencies

- TASK-002, TASK-003

## Implementation

1. Criar `.github/workflows/ci.yml`
2. Job backend: checkout → setup Python → install deps → ruff check → ruff format → mypy → pytest
3. Job frontend: checkout → setup Node → install deps → eslint → tsc → vitest → next build
4. Criar `scripts/ci.sh` (replica do workflow para execução local)
5. Tornar `scripts/ci.sh` executável
6. Commit

## Verification

```bash
scripts/ci.sh
```

## Acceptance Criteria

- [x] GitHub Actions workflow válido
- [x] Script local `scripts/ci.sh` funcional
- [x] Lint (ruff + eslint) passa
- [x] Typecheck (mypy + tsc) passa
- [x] Testes (pytest + vitest) passam
- [x] Build (next build) passa

## Tests

CI é o próprio mecanismo de teste — executa todos os checks.
