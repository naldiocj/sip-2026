# SPRINT-01 — Identidade, Autenticação e Autorização

## Objetivo

Implementar a fundação completa de identidade, autenticação, autorização, perfis, permissões e controlo de acesso do SIP.

## Estado

**DONE**

## Tasks

| ID | Task | Estado |
|---|---|---|
| TASK-001 | Auth domain model | DONE |
| TASK-002 | Database migrations | DONE |
| TASK-003 | JWT authentication | DONE |
| TASK-004 | Authorization engine | DONE |
| TASK-005 | Frontend auth | DONE |
| TASK-006 | Sidebar authorization | DONE |
| TASK-007 | Security audit foundation | DONE |
| TASK-008 | Tests | DONE |
| TASK-009 | Documentation | DONE |

## Critérios de Conclusão

- [x] User model
- [x] Profile model
- [x] Permission model
- [x] RBAC
- [x] JWT
- [x] Login
- [x] Logout
- [x] Current user
- [x] Session foundation
- [x] Authorization engine
- [x] Permission checks
- [x] Profile checks
- [x] Frontend authentication
- [x] Protected routes
- [x] Dynamic Sidebar foundation
- [x] Humanized labels
- [x] Security audit foundation
- [x] Rate limiting foundation
- [x] Database migrations
- [x] Development seed
- [x] Backend tests
- [x] Frontend tests
- [x] E2E tests
- [x] Documentation
- [x] Security review completed
- [x] Security fixes applied
- [x] Frontend Engineering Standards created
- [x] All Tasks DONE
- [x] All tests passing
- [x] Lint passing
- [x] Typecheck passing
- [x] Build passing
- [x] Commits created

## Riscos

- Sincronização entre backend e frontend durante desenvolvimento
- Complexidade do modelo de permissões
- Rate limiter fail-open quando Redis indisponível (documentado)

## Decisões

- JWT claims mínimos (sem permissões no token)
- Cookie httpOnly para access token (nunca no body)
- Status codes uniformes (401 para todos os erros de login)
- JWT secret validation em produção (model_validator)
- Atomic rate limiting via Lua script
- Timing-safe login (dummy hash para users inexistentes)
- Frontend Engineering Standards criado como referência
- Security Model documentado
