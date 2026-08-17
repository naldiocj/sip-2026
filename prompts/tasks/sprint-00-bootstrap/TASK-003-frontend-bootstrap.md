# TASK-003 — Frontend Bootstrap

## Objective

Criar o frontend Next.js com App Router, shadcn/ui (Base UI), TanStack
Query, layout AppLayout, health status dashboard, e placeholder pages.

## Scope

- Next.js 16 + React 19 + TypeScript + Tailwind v4
- shadcn/ui Base UI (Nova preset) — componentes essenciais
- AppLayout (Sidebar, Header, Breadcrumb, PageContainer)
- Health status dashboard com TanStack Query
- Placeholder pages (search, documents, security, settings)
- API proxy rewrites (/api → BACKEND_URL)
- Vitest + React Testing Library
- ESLint + TypeScript strict
- Multi-stage Dockerfile (standalone)

## Dependencies

- TASK-002

## Implementation

1. Criar Next.js app via create-next-app (inside Docker — host Node blocked)
2. Instalar shadcn/ui com Base UI Nova (`npx shadcn@latest init -y -d`)
3. Adicionar componentes: button, card, dialog, table, badge, sidebar,
   dropdown-menu, separator, avatar, alert, calendar, breadcrumb,
   tooltip, sheet, tabs, select, input, label, form, skeleton, command,
   popover, collapsible, resizable, table-pagination
4. Criar `src/components/layout/` — app-layout, sidebar, header,
   breadcrumb-nav, page-container
5. Criar `src/components/health/health-status.tsx`
6. Criar `src/components/providers.tsx`
7. Criar `src/lib/api.ts` — fetchHealth
8. Criar `src/types/health.ts`
9. Criar placeholder pages
10. Configurar next.config.ts (standalone output, API rewrites)
11. Criar vitest.config.ts + testes
12. Criar Dockerfile multi-stage
13. Executar: eslint, tsc --noEmit, vitest, next build
14. Commit

## Verification

```bash
cd frontend
npx eslint .
npx tsc --noEmit
npx vitest run
npx next build
docker compose up frontend
curl http://localhost:3000
```

## Acceptance Criteria

- [x] Frontend arranca com `npm run dev`
- [x] Home page mostra Dashboard + Health Status
- [x] Sidebar navega para pages placeholder
- [x] ESLint passa sem erros
- [x] TypeScript compila sem erros
- [x] Vitest passa (4 testes)
- [x] `next build` passa
- [x] Dockerfile multi-stage funcional
- [x] shadcn/ui Base UI (não Radix)

## Tests

4 testes unitários: health.test.tsx (render HealthStatus),
page.test.tsx (render Home page), setup.ts (mocks).
