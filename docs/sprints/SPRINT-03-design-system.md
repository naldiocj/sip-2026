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

| ID | Task | Estado |
|----|------|--------|
| TASK-001 | Design Tokens + Typography + Identity SIP | TODO |
| TASK-002 | Humanization Engine expandido | TODO |
| TASK-003 | Navigation Config data model | TODO |
| TASK-004 | Sidebar Enterprise (contextual, badges, responsive, mobile) | TODO |
| TASK-005 | Header Enterprise (notifications, user, status) | TODO |
| TASK-006 | Breadcrumbs inteligentes | TODO |
| TASK-007 | PageContainer + PageHeader + PageToolbar enterprise | TODO |
| TASK-008 | Button System (AsyncButton, ConfirmButton, etc.) | TODO |
| TASK-009 | Status System central | TODO |
| TASK-010 | Loading System (Skeletons especializados) | TODO |
| TASK-011 | Empty States sistema | TODO |
| TASK-012 | Error System (ErrorBoundary, ErrorState, RetryAction) | TODO |
| TASK-013 | Rotas portuguesas + URL state hooks | TODO |
| TASK-014 | Tests + Lint + Typecheck | TODO |

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
