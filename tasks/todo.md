# Task List: SIP Frontend Reengineering

## SPRINT-03: Design System Foundation + App Shell Enterprise

### Phase 1: Foundation (Tasks 1-3)

- [ ] **TASK-001: Design Tokens + Typography + Identity SIP**
  - Expandir `globals.css` com tokens semânticos (success, warning, info, surface-elevated)
  - Criar hierarquia tipográfica (Display, PageTitle, SectionTitle, CardTitle, Body, Label, Description, Metadata, Caption)
  - Definir motion tokens (duration.fast/normal/slow, easing.standard/emphasized)
  - Definir density tokens (comfortable/compact/dense)
  - Preservar identidade SIP (cores atuais como base)
  - Adicionar CSS variables para semantic status colors
  - **Acceptance:** Todos os tokens centralizados, nenhum valor hardcoded restante
  - **Verify:** `npm run build` + visual inspection
  - **Files:** `frontend/src/app/globals.css`
  - **Scope:** Small (1 file)

- [ ] **TASK-002: Humanization Engine expandido**
  - Expandir `humanize.ts` com mapeamentos para: process statuses, document types, occurrence types, mandate states, notification types
  - Criar `humanizeStatus(status, domain)` genérico
  - Criar `humanizeEntity(type, code)` genérico
  - Adicionar `getInitials()` como utilitário partilhado (remover duplicatas de sidebar.tsx e header.tsx)
  - **Acceptance:** Dicionário completo, funções reutilizáveis, sem duplicações
  - **Verify:** Testes unitários para todas as funções
  - **Files:** `frontend/src/lib/humanize.ts`, `frontend/src/__tests__/humanize.test.ts`
  - **Scope:** Small (1-2 files)

- [ ] **TASK-003: Navigation Config data model**
  - Criar `frontend/src/lib/navigation-config.ts`
  - Definir tipo `NavigationItem { id, label, route, icon, description, roles, permissions, scope, children, badge, featureFlag }`
  - Criar config data-driven com todos os módulos SIP (processos, ocorrencias, documentos, etc.)
  - Cada item com: label português, rota portuguesa, permissão necessária, ícone Lucide
  - A mesma config deve alimentar Sidebar, Breadcrumb, CommandPalette
  - **Acceptance:** Config central, tipada, com todos os módulos do roadmap
  - **Verify:** Typecheck PASS, import funciona em sidebar
  - **Files:** `frontend/src/lib/navigation-config.ts`, `frontend/src/types/navigation.ts`
  - **Scope:** Small (2 files)

### Phase 2: Layout Enterprise (Tasks 4-7)

- [ ] **TASK-004: Sidebar Enterprise**
  - Refatorar `sidebar.tsx` para usar NavigationConfig
  - Suportar: expanded, collapsed, icon-only, tooltips, nested navigation, grupos, submenus
  - Badges com dados reais (não inventar números)
  - Active state, hover, focus, keyboard navigation
  - Responsive: mobile drawer via Sheet
  - Animations de transição collapsed/expanded
  - Persistência da preferência (cookie ou localStorage)
  - Rail para collapsed state
  - **NÃO adicionar Search na Sidebar** (regra absoluta)
  - **Acceptance:** Sidebar funciona em todos os estados, mobile drawer, permission-filtered
  - **Verify:** Manual test em desktop + mobile, lint, typecheck
  - **Files:** `frontend/src/components/layout/sidebar.tsx`
  - **Scope:** Medium (3-5 files)

- [ ] **TASK-005: Header Enterprise**
  - Refatorar `header.tsx` para usar NavigationConfig
  - Adicionar: notification bell com counter real, user menu completo
  - Adicionar: organization context (nome da organização/direção)
  - Adicionar: system status indicator (online/offline)
  - Manter Header limpo e funcional
  - **Acceptance:** Header com notificações, user menu, context info
  - **Verify:** Manual test, lint, typecheck
  - **Files:** `frontend/src/components/layout/header.tsx`
  - **Scope:** Medium (3 files)

- [ ] **TASK-006: Breadcrumbs inteligentes**
  - Refatorar `breadcrumb-nav.tsx` para usar NavigationConfig
  - Labels em português (não IDs internos)
  - Suportar: Início > Processos > Processo 2026/00125 > Documentos
  - Gerar automaticamente a partir da URL + config
  - **Acceptance:** Breadcrumbs correctos, labels portugueses, sem IDs
  - **Verify:** Navegar por todas as rotas, verificar breadcrumbs
  - **Files:** `frontend/src/components/layout/breadcrumb-nav.tsx`
  - **Scope:** Small (1-2 files)

- [ ] **TASK-007: PageContainer + PageHeader + PageToolbar enterprise**
  - Expandir `page-container.tsx` com: SectionHeader, ContentSection, ContentCard
  - PageHeader: breadcrumb, title, description, status, primary actions, more actions
  - PageToolbar: filtros, pesquisa, density toggle, view options
  - **Acceptance:** Componentes padronizados, usados por todas as páginas
  - **Verify:** Todas as páginas usam PageContainer, lint, typecheck
  - **Files:** `frontend/src/components/layout/page-container.tsx`
  - **Scope:** Small (1-2 files)

### Phase 3: Core Components (Tasks 8-12)

- [ ] **TASK-008: Button System**
  - Criar variantes: primary, secondary, outline, ghost, destructive, link
  - Criar tamanhos: xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg
  - Criar: AsyncButton (com loading state), IconButton, ConfirmButton (com dialog), DestructiveButton
  - Suportar: loading, icon, tooltip, shortcut
  - **Acceptance:** Todas as variantes funcionam, AsyncButton com loading visual
  - **Verify:** Testes visuais, lint, typecheck
  - **Files:** `frontend/src/components/ui/button.tsx` (está shadcn, expandir)
  - **Scope:** Small (1-2 files)

- [ ] **TASK-009: Status System central**
  - Criar `frontend/src/components/ui/status-badge.tsx`
  - Mapear estados do SIP: Recebido, Em análise, Em instrução, Aguardando despacho, Despachado, Concluído, Arquivado, Suspenso
  - Cada estado: semantic variant (info/warning/success/destructive), label, icon opcional, tooltip
  - Usar em sidebar badges, tabelas, cards, timeline
  - **Acceptance:** Status badges funcionais, semanticamente correctos
  - **Verify:** Visual inspection, lint, typecheck
  - **Files:** `frontend/src/components/ui/status-badge.tsx`
  - **Scope:** Small (1 file)

- [ ] **TASK-010: Loading System**
  - Criar skeletons especializados: TableSkeleton, FormSkeleton, CardSkeleton, DashboardSkeleton, DetailsSkeleton, TimelineSkeleton
  - Usar existente `skeleton.tsx` como base
  - Cada skeleton deve simular o layout real do conteúdo
  - **Acceptance:** Skeletons para cada tipo de conteúdo, animation suave
  - **Verify:** Visual inspection com network throttle, lint, typecheck
  - **Files:** `frontend/src/components/ui/skeleton.tsx` (expandir) + novos skeletons
  - **Scope:** Medium (3-5 files)

- [ ] **TASK-011: Empty States sistema**
  - Criar `frontend/src/components/ui/empty-state.tsx`
  - Variantes: no-data, no-results, no-results-filter, no-permission, error
  - Cada uma com: ícone, título, descrição, action opcional
  - **Acceptance:** Empty states para todos os cenários
  - **Verify:** Visual inspection, lint, typecheck
  - **Files:** `frontend/src/components/ui/empty-state.tsx`
  - **Scope:** Small (1 file)

- [ ] **TASK-012: Error System**
  - Criar `frontend/src/components/ui/error-state.tsx` (componente visual)
  - Criar `frontend/src/components/error-boundary.tsx` (React Error Boundary)
  - Criar `frontend/src/components/ui/retry-action.tsx`
  - Error correlation: "Não foi possível concluir a operação. Referência: SIP-8F42A"
  - Nunca expor stack traces
  - **Acceptance:** ErrorBoundary global, ErrorState em cada página, RetryAction funcional
  - **Verify:** Forçar erro, verificar UI, lint, typecheck
  - **Files:** `frontend/src/components/ui/error-state.tsx`, `frontend/src/components/error-boundary.tsx`
  - **Scope:** Small (2 files)

### Phase 4: Navigation + URL State (Tasks 13-14)

- [ ] **TASK-013: Rotas portuguesas + URL state hooks**
  - Verificar/criar rotas em português: /processos, /ocorrencias, /documentos, /piquete, /mandados, /detidos, /despachos, /relatorios, /notificacoes
  - URLs lowercase, sem acentos, sem `_`
  - Criar `useUrlState` hook para persistir filtros/paginação na URL
  - Criar `usePreservedContext` para preservar contexto ao voltar
  - Separar: route, label, component name, service name
  - **Acceptance:** Rotas portuguesas, URL state funcional, contexto preservado
  - **Verify:** Navegar, refresh, back/forward, deep link
  - **Files:** `frontend/src/hooks/use-url-state.ts`, `frontend/src/hooks/use-preserved-context.ts`
  - **Scope:** Medium (3-5 files)

- [ ] **TASK-014: Tests + Lint + Typecheck para SPRINT-03**
  - Testes unitários para: HumanizationEngine, NavigationConfig, StatusBadge, EmptyState, ErrorState, Button variants
  - Testes de integração para: Sidebar permission filtering, Breadcrumb generation
  - Atualizar testes existentes para novos componentes
  - Executar lint e typecheck
  - **Acceptance:** Todos os testes passam, lint clean, typecheck clean
  - **Verify:** `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build`
  - **Files:** `frontend/src/__tests__/*.test.tsx`
  - **Scope:** Medium (5-8 files)

## Checkpoint: After SPRINT-03
- [ ] Todos os tokens centralizados
- [ ] Sidebar enterprise funcional (expanded/collapsed/mobile)
- [ ] Header enterprise funcional
- [ ] Breadcrumbs inteligentes
- [ ] Button System completo
- [ ] Status System funcional
- [ ] Loading/Empty/Error states
- [ ] Rotas em português
- [ ] URL state hooks
- [ ] Todos os testes passam
- [ ] Lint PASS
- [ ] Typecheck PASS
- [ ] Build PASS
- [ ] Review com humano antes de avançar

---

## SPRINT-04: Advanced Components (PLANNED - not started)

### Phase 1: Modal Engine
- [ ] TASK-015: Enterprise Dialog Engine (size, responsive, animation, sticky header/footer)
- [ ] TASK-016: ConfirmDialog, FormDialog, DetailsDialog, FullScreenDialog
- [ ] TASK-017: Drawer Engine (right, bottom, responsive)

### Phase 2: Form Engine
- [ ] TASK-018: AdvancedSelect (autocomplete, keyboard, grouping, async, fuzzy search)
- [ ] TASK-019: AdvancedMultiSelect (chips, virtualization, remote search)
- [ ] TASK-020: EntityPickers (UserPicker, ProcessPicker, etc.)
- [ ] TASK-021: SmartInput system (SmartSearch, SmartNumberInput, etc.)
- [ ] TASK-022: Form Engine (FormSection, FormField, FormActions, validation)

### Phase 3: Integration
- [ ] TASK-023: Command Palette (Ctrl+K, navegar, pesquisar, criar, executar)
- [ ] TASK-024: Notification Center
- [ ] TASK-025: Context Menu system
- [ ] TASK-026: Tests + Lint + Typecheck

---

## SPRINT-05: Data Layer + Tables (PLANNED - not started)

### Phase 1: Data Layer
- [ ] TASK-027: TanStack Query patterns (queryKeys, mutations, invalidation)
- [ ] TASK-028: useUrlState + URL persistence para tabelas

### Phase 2: DataTable Engine
- [ ] TASK-029: AdvancedDataTable (sorting, filtering, pagination, row selection)
- [ ] TASK-030: DataTableToolbar + DataTableFilters
- [ ] TASK-031: DataTableBulkActions + Partial Success
- [ ] TASK-032: DataTableDensity + Saved Views
- [ ] TASK-033: DataTable responsive (priority columns, expansion)

### Phase 3: Filter Builder
- [ ] TASK-034: AdvancedFilterBuilder (operators, AND/OR, chips, presets)

### Phase 4: Integration
- [ ] TASK-035: Migrar Organization page para novo padrão
- [ ] TASK-036: Tests + Lint + Typecheck

---

## SPRINT-06-09: (Detailed tasks created when sprint starts)
