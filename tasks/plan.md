# Implementation Plan: SIP Frontend Reengineering

## Overview

Reengenharia completa do frontend do SIP — Sistema de Instrução Processual.
Transformar o frontend num produto enterprise de missão crítica com Design System próprio,
componentes avançados, UX profissional e arquitetura preparada para evolução contínua.

## Tech Stack (Confirmado)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.3.1 |
| React | React | 19.2.8 |
| Language | TypeScript (strict) | ^5 |
| Styling | Tailwind CSS v4 | v4 |
| UI Library | shadcn/ui (base-nova, `@base-ui/react`) | v4 |
| Icons | lucide-react | ^1.31.0 |
| Forms | react-hook-form + zod | ^7.85.0 + ^3.25.76 |
| Data Fetching | TanStack React Query | ^5.101.4 |
| Tables | TanStack React Table | ^9.1.2 |
| Animation | tw-animate-css | ^1.4.0 |
| Themes | next-themes | ^0.4.6 |
| Date | date-fns | ^4.4.0 |
| Calendar | react-day-picker | ^10.0.1 |
| Toasts | sonner | ^2.0.8 |
| Command | cmdk | ^1.1.1 |
| Utilities | clsx, tailwind-merge, class-variance-authority | latest |

**NOTA:** shadcn/ui usa `@base-ui/react` (NÃO Radix UI). O padrão é `render` prop (não `asChild`).

## Capability Map

```
Module id               | Responsibility                              | Depends on
------------------------|---------------------------------------------|------------------
ds-foundation           | Tokens, typography, colors, identity        | —
app-shell               | AppShell, Sidebar, Header, Breadcrumbs     | ds-foundation
core-components         | Button system, Status, Loading/Empty/Error  | ds-foundation
navigation-system       | Permission-based nav, Portuguese routes     | app-shell
modal-engine            | Enterprise dialogs, drawers, responsive     | core-components
form-engine             | Smart inputs, AdvancedSelect, EntityPickers | core-components
data-layer              | TanStack Query patterns, caching            | —
data-table-engine       | TanStack Table, filters, pagination         | data-layer, core-components
command-palette         | Global search, navigation, actions          | navigation-system
notification-center     | Notifications, badges, indicators           | data-layer
dashboard-engine        | KPIs, charts, drill-down                    | data-table-engine
domain-modules          | Processos, Documentos, etc.                 | all above
accessibility           | WCAG, keyboard, screen reader               | core-components
responsive              | Mobile, tablet, desktop                     | app-shell
performance             | Virtualization, lazy loading                | data-table-engine
testing                 | Unit, integration, E2E, visual regression   | all above
```

## Sprint Breakdown

### SPRINT-03: Design System Foundation + App Shell Enterprise
**Capabilities:** ds-foundation, app-shell, core-components, navigation-system
**Estimate:** 14 tasks
**Status:** PLANNED

### SPRINT-04: Advanced Components
**Capabilities:** modal-engine, form-engine
**Depends on:** SPRINT-03
**Estimate:** ~12 tasks
**Status:** NOT STARTED

### SPRINT-05: Data Layer + Tables
**Capabilities:** data-layer, data-table-engine
**Depends on:** SPRINT-03
**Estimate:** ~10 tasks
**Status:** NOT STARTED

### SPRINT-06: Search + Notifications + Command Palette
**Capabilities:** command-palette, notification-center
**Depends on:** SPRINT-03, SPRINT-05
**Estimate:** ~8 tasks
**Status:** NOT STARTED

### SPRINT-07: Dashboard Engine
**Capabilities:** dashboard-engine
**Depends on:** SPRINT-05
**Estimate:** ~6 tasks
**Status:** NOT STARTED

### SPRINT-08: Domain Modules Foundation
**Capabilities:** domain-modules (Processos, Documentos base)
**Depends on:** SPRINT-04, SPRINT-05
**Estimate:** ~10 tasks
**Status:** NOT STARTED

### SPRINT-09: Quality Hardening
**Capabilities:** accessibility, responsive, performance, testing
**Depends on:** SPRINT-03 through SPRINT-08
**Estimate:** ~8 tasks
**Status:** NOT STARTED

## Architecture Decisions

1. **Base UI over Radix** — O projeto já usa `@base-ui/react` via shadcn base-nova. Manter.
2. **Tailwind v4 CSS-first** — Sem `tailwind.config.ts`. Tudo em `globals.css`.
3. **Composition over configuration** — Componentes composable, não mega-componentes.
4. **Data-driven navigation** — Uma única fonte de verdade para Sidebar, Breadcrumb, CommandPalette.
5. **Humanization Engine** — Dicionário central para traduzir código → label português.
6. **URL State** — Persistir filtros/paginação na URL para deep linking.
7. **TanStack Query como padrão** — Eliminar `useEffect + fetch`.
8. **TanStack Table como padrão** — Nenhuma tabela improvisada.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| shadcn base-nova tem API diferente de Radix | High | Estudar padrões `render` prop antes de implementar |
| Tailwind v4 sem config file | Medium | Usar CSS custom properties + `@theme inline` |
| Muitos componentes para criar | High | Priorizar impacto transversal, iterar |
| Breaking changes Next.js 16 | Medium | Verificar docs em `node_modules/next/dist/docs/` |
| React 19 patterns | Low | Usar APIs estáveis, evitar experimentais |

## Open Questions

1. Prioridade de módulos de domínio para SPRINT-08?
2. Preferred chart library (Recharts, Nivo, Visx)?
3. Necessidade de Storybook ou apenas testes visuais?
