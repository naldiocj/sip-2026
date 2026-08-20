# SPRINT-03 — Design System Foundation + App Shell Enterprise

## Objetivo

Estabelecer a fundação do Design System Enterprise do SIP e transformar o App Shell num layout enterprise de nível mundial.

## Estado

**PLANNED**

## Capabilities

| Module id | Responsibility | Depends on |
|-----------|---------------|------------|
| ds-foundation | Tokens, typography, colors, spacing, identity SIP | — |
| app-shell | AppShell, Sidebar enterprise, Header enterprise, Breadcrumbs, PageContainer | ds-foundation |
| core-components | Button system, Status system, Loading/Empty/Error states | ds-foundation |
| navigation-system | Permission-based nav data, Portuguese routes, Humanization Engine | app-shell |

## Tasks

| ID | Task | Ficheiro | Estado |
|----|------|----------|--------|
| TASK-001 | Design Tokens + Typography + Identity SIP | `tasks/TASK-001-design-tokens.md` | IMPLEMENTED |
| TASK-002 | Humanization Engine expandido | `tasks/TASK-002-humanization-engine.md` | DONE |
| TASK-003 | Navigation Config data model | `tasks/TASK-003-navigation-config.md` | PENDING |
| TASK-004 | Sidebar Enterprise | `tasks/TASK-004-sidebar-enterprise.md` | PENDING |
| TASK-005 | Header Enterprise | `tasks/TASK-005-header-enterprise.md` | PENDING |
| TASK-006 | Breadcrumbs inteligentes | `tasks/TASK-006-breadcrumbs.md` | PENDING |
| TASK-007 | PageContainer + PageHeader + PageToolbar enterprise | `tasks/TASK-007-page-container.md` | PENDING |
| TASK-008 | Button System | `tasks/TASK-008-button-system.md` | PENDING |
| TASK-009 | Status System central | `tasks/TASK-009-status-system.md` | PENDING |
| TASK-010 | Loading System | `tasks/TASK-010-loading-system.md` | PENDING |
| TASK-011 | Empty States sistema | `tasks/TASK-011-empty-states.md` | PENDING |
| TASK-012 | Error System | `tasks/TASK-012-error-system.md` | PENDING |
| TASK-013 | Rotas portuguesas + URL state hooks | `tasks/TASK-013-routes-url-state.md` | PENDING |
| TASK-014 | Tests + Lint + Typecheck | `tasks/TASK-014-sprint03-quality.md` | PENDING |

## Critérios de Conclusão

- [ ] Design tokens centralizados em CSS custom properties
- [ ] Tipografia com hierarquia (Display → Caption)
- [ ] Identidade SIP preservada (cores, sidebar active, primary)
- [ ] HumanizationEngine com todos os mapeamentos
- [ ] NavigationConfig data-driven (uma fonte para Sidebar, Breadcrumb, CommandPalette)
- [ ] Sidebar enterprise: expanded/collapsed, mobile drawer, badges, permission-filtered
- [ ] Header enterprise: notifications bell, user menu, breadcrumbs
- [ ] Breadcrumbs inteligentes (labels, sem IDs internos)
- [ ] PageContainer/PageHeader/PageToolbar padronizados
- [ ] Button System com variants (primary, destructive, ghost, etc.)
- [ ] Status System com badges semânticos
- [ ] Loading skeletons para cada tipo de conteúdo
- [ ] Empty states com copy e ação
- [ ] ErrorBoundary global + ErrorState componentes
- [ ] Rotas em português, URLs lowercase sem acentos
- [ ] URL state hooks (useUrlState)
- [ ] Todos os componentes existentes migrados para novo Design System
- [ ] Nenhum estilo hardcoded restante
- [ ] Testes unitários para todos os componentes novos
- [ ] Lint PASS
- [ ] Typecheck PASS
- [ ] Build PASS

## Referências

- `prompts/PROMPT-MESTRE-FRONTEND-REENGENHARIA.md` — Secções 5-20
- `frontend/src/app/globals.css` — CSS atual
- `frontend/src/components/layout/` — Layout atual
- `frontend/src/lib/humanize.ts` — Humanização atual
