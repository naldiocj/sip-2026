#!/usr/bin/env bash
# SIP — CI local
# Executa todas as verificações antes de commit.
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

echo "══════════════════════════════════════"
echo " SIP — CI Local"
echo "══════════════════════════════════════"
echo

# ── BACKEND ──
echo "▸ Backend"
cd backend

echo "  lint..."
ruff check app tests || fail "ruff check failed"
pass "lint"

echo "  format..."
ruff format --check app tests || fail "ruff format failed"
pass "format"

echo "  typecheck..."
mypy app || fail "mypy failed"
pass "typecheck"

echo "  test..."
pytest || fail "pytest failed"
pass "test"

cd ..

# ── FRONTEND (via Docker) ──
echo "▸ Frontend"
cd frontend

echo "  lint..."
npx eslint src/ || fail "eslint failed"
pass "lint"

echo "  typecheck..."
npx tsc --noEmit || fail "tsc failed"
pass "typecheck"

echo "  test..."
npx vitest run || fail "vitest failed"
pass "test"

cd ..

echo
echo "══════════════════════════════════════"
echo -e "${GREEN} All checks passed ${NC}"
echo "══════════════════════════════════════"
