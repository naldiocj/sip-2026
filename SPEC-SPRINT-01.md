# SPEC — SPRINT-01: Identidade, Autenticação e Autorização

## Capability Map

| Module id | Responsibility | Depends on | Status |
|---|---|---|---|
| backend-auth | Domain models, JWT, RBAC, authorization engine, API endpoints | — | **DONE** |
| frontend-auth | AuthProvider, login page, route protection, API client integration | backend-auth | **TODO** |
| sidebar-auth | Dynamic sidebar with permission-based navigation | frontend-auth | **TODO** |
| tests | Backend auth tests, frontend auth tests, E2E tests | backend-auth, frontend-auth | **PARTIAL** |
| docs | Auth, authorization, RBAC architecture docs | all above | **TODO** |

**Build order:** backend-auth → frontend-auth → sidebar-auth → tests → docs

## Objective

Complete the SPRINT-01 identity, authentication, and authorization foundation for SIP. The backend module is fully implemented (88 tests, 82% coverage). The remaining work is the frontend authentication layer, dynamic sidebar, comprehensive tests, and documentation.

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, PyJWT, argon2-cffi |
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind v4, shadcn/ui, Vitest, Playwright |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |

## Commands

```bash
# Backend
cd backend && python -m pytest tests/ --tb=short
cd backend && python -m ruff check .
cd backend && python -m mypy .

# Frontend
cd frontend && npx vitest run
cd frontend && npx next lint
cd frontend && npx tsc --noEmit

# Full CI
make ci
```

## What's Already Done (Backend)

- User, Profile, Permission, Session, Audit domain models
- JWT token service (PyJWT, HS256, httpOnly cookies)
- Password hashing (argon2id)
- Login/Logout/Me endpoints with rate limiting
- Authorization engine (RBAC, permission checks, profile checks)
- Security audit foundation
- Alembic migrations (auth tables)
- Development seed (9 profiles, 33 permissions, 9 users)
- 88 backend tests passing

## What Needs Implementation (Frontend)

### 1. AuthProvider + Auth Context

- `AuthContext` with user state, login/logout functions
- `AuthProvider` wrapping the app
- `useAuth()` hook for consuming components
- Session validation on mount (call `/api/v1/auth/me`)
- Token storage via httpOnly cookie (set by backend)

### 2. Login Page

- `/login` route with username/password form
- Error handling (invalid credentials, account status)
- Redirect to `/` after successful login
- Loading states

### 3. Route Protection

- Next.js middleware or component-based protection
- Redirect unauthenticated users to `/login`
- Loading states during session validation

### 4. API Client Integration

- Wire `api-client.ts` to send credentials
- Handle 401 responses (redirect to login)
- Session expiry handling

### 5. Dynamic Sidebar

- Permission-based navigation filtering
- User info display (name, profile)
- Logout button
- Humanized labels (use existing `humanize.ts`)

### 6. Tests

- Frontend auth component tests (Vitest)
- E2E login flow (Playwright)

### 7. Documentation

- `docs/architecture/authentication.md`
- `docs/architecture/authorization.md`
- `docs/architecture/rbac.md`

## Code Style

```typescript
// Frontend: React 19 + TypeScript
"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

## Testing Strategy

- **Unit**: Vitest for React components and hooks
- **Integration**: Vitest with mocked API for auth flows
- **E2E**: Playwright for login → dashboard → logout flow
- **Backend**: Already covered (88 tests, pytest)

## Boundaries

- **Always**: Run tests before commits, follow existing code style, validate inputs
- **Ask first**: Database schema changes, adding new dependencies, changing CI config
- **Never**: Commit secrets, trust frontend-only security, store passwords in plaintext

## Success Criteria

- [ ] AuthProvider wraps the app and manages session state
- [ ] Login page at `/login` with form and error handling
- [ ] Unauthenticated users redirected to `/login`
- [ ] Sidebar shows items based on user permissions
- [ ] User info displayed in header/sidebar
- [ ] Logout clears session and redirects to `/login`
- [ ] All existing backend tests still pass
- [ ] Frontend auth tests created and passing
- [ ] E2E login flow test created and passing
- [ ] Lint passing (backend + frontend)
- [ ] Typecheck passing (backend + frontend)
- [ ] Documentation created

## Open Questions

None — PROMPT-01 provides clear requirements for all areas.
