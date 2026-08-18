# FASE 0 — Auditoria Completa do Frontend do SIP

> **Estado:** AGUARDANDO APROVAÇÃO DO AUTOR DO PRODUTO
> **Data:** 2026-08-18
> **Referência:** `prompts/PROMPT-MESTRE-FRONTEND-REENGENHARIA.md` §4

---

## 1. Estado Actual do Frontend

| Dimensão | Estado |
|----------|--------|
| Framework | Next.js 16.3.1 + React 19 (App Router, CSR) |
| UI Library | shadcn/ui v4 (base-nova, @base-ui/react) — 27 componentes |
| Data Fetching | TanStack React Query v5 (usado minimamente) |
| Forms | React Hook Form + Zod (usado apenas no LoginForm) |
| Auth | Cookie httpOnly JWT (`sip_access_token`), 37 permissões, 9 perfis |
| Design Tokens | CSS custom properties em `globals.css` (oklch, typography, motion, z-index) |
| Humanização | `humanize.ts` com labels portugueses para todos os domínios |
| Páginas funcionais | Dashboard (health), Login, Organização |
| Placeholder pages | `/documents`, `/search`, `/security`, `/settings` |
| Rotas definidas (sem implementação) | Processos, Ocorrências, Mandados, Despachos, Detidos, Piquete, PGR, Relatórios, Notificações, Utilizadores, Auditoria, Templates, Definições |

**Componentes UI instalados:** alert, avatar, badge, breadcrumb, button, calendar, card, command, dialog, drawer, dropdown-menu, field, input, input-group, label, popover, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, table, tabs, textarea, tooltip.

---

## 2. Matriz de Auditoria de Componentes

Formato: `Componente actual → Problema → Componente-alvo → Estratégia de migração → Impacto → Páginas afectadas`

### 2.1 Layout & Shell

| # | Componente Actual | Problema | Componente-Alvo | Estratégia | Impacto | Páginas |
|---|---|---|---|---|---|---|
| L1 | `app-layout.tsx` | Importa `Toaster` do `sonner` directamente em vez do wrapper custom `@/components/ui/sonner` que tem icons temáticos e mapping de tokens | `AppLayout` usando wrapper custom | Substituir import; verificar que tema escuro funciona | Baixo | Todas |
| L2 | `app-layout.tsx` | Sem `<Suspense>` nem `<ErrorBoundary>` em torno de `children` | `AppLayout` com ErrorBoundary + Suspense | Adicionar ErrorBoundary global e Suspense fallback no main content | Médio | Todas |
| L3 | `app-layout.tsx` | Detecção de auth routes via `AUTH_ROUTES.includes(pathname)` é frágil — adicionar nova rota exige modificar este ficheiro | Layout separado para auth (`app/(auth)/layout.tsx`) | Mover login para group route `(auth)` com layout próprio, eliminar check condicional | Médio | Login |
| L4 | `page-container.tsx` | `PageContainer` e `PageContent` usam concatenação de strings (`\`...\${className ?? ""}\``) em vez de `cn()` — classes custom não fazem merge/dedup | `PageContainer`/`PageContent` usando `cn()` | Substituir concatenação por `cn()` de `lib/utils` | Baixo | Todas |
| L5 | `page-container.tsx` | `PageHeader` renderiza `<h1>` com `text-2xl font-bold tracking-tight` hardcoded — não usa tokens `sip-page-title` | `PageHeader` com classes `sip-page-title` | Adoptar classe utilitária `sip-page-title` definida em `globals.css` | Baixo | Todas |
| L6 | `header.tsx` | Altura `h-14` e separator `h-4` hardcoded — não usa design tokens | `Header` com tokens de spacing/height | Definir token `--header-height` e referenciar | Baixo | Todas |
| L7 | `header.tsx` | Botão Notificações (`Bell`) sem `onClick` — botão morto | `NotificationCenter` integrado (Fase 6) | Por agora: desactivar visualmente ou adicionar tooltip "Em breve" | Baixo | Todas |
| L8 | `header.tsx` | Sem skip-to-content link para utilizadores de teclado | `Header` com SkipLink | Adicionar `<a href="#main-content" className="sr-only focus:not-sr-only">` no layout root | Médio | Todas |
| L9 | `breadcrumb-nav.tsx` | Separadores `<BreadcrumbSeparator>` ausentes — itens visuais colam uns nos outros | `BreadcrumbNav` com separadores | Adicionar `<BreadcrumbSeparator>` entre itens da lista | Baixo | Todas |
| L10 | `breadcrumb-nav.tsx` | Segmentos dinâmicos (IDs) mostram texto crú (`/organization/abc-123` → "abc-123") | `BreadcrumbNav` com labels dinâmicos | Estender `getBreadcrumbsForRoute` para resolver labels a partir do contexto ou dados | Médio | Todas |
| L11 | `sidebar.tsx` (layout) | Typo: "Instrucao" em vez de "Instrução"; "sessao" em vez de "sessão" (cedilha ausente) | Corrigir strings | Substituir caracteres corretos (UTF-8) | Baixo | Todas |
| L12 | `sidebar.tsx` (layout) | Items-pai com children são apenas toggle — click não navega para a rota do pai | `SidebarNavItem` com navegação no pai | Adicionar `<Link>` no `SidebarMenuButton` do item-pai, manter toggle no ícone | Médio | Todas |

### 2.2 Design Tokens & Tipografia

| # | Componente Actual | Problema | Componente-Alvo | Estratégia | Impacto | Páginas |
|---|---|---|---|---|---|---|
| T1 | `globals.css` | Classes `sip-display` até `sip-caption` definidas mas **nunca usadas** por nenhum componente — dead code | Adoptar em todos os componentes tipográficos | Substituir `text-2xl font-bold` etc. por classes `sip-*` onde apropriado | Alto | Todas |
| T2 | `globals.css` | Motion tokens (`--duration-fast/normal/slow`, `--easing-standard/emphasized`) definidos mas não adoptados — componentes usam `duration-100/200/300` hardcoded | Adoptar motion tokens via `transition-motion-*` | Substituir durações hardcoded por classes utilitárias baseadas nos tokens | Médio | Todas |
| T3 | `globals.css` | Z-index tokens (`--z-base` até `--z-tooltip`) definidos mas não referenciados — componentes usam `z-50`, `z-10`, `z-20` hardcoded | Adoptar z-index tokens | Mapear classes Tailwind para tokens (`z-modal` → `var(--z-modal)`) | Médio | Todas |
| T4 | `globals.css` | Tokens de status (`--success`, `--warning`, `--info`) definidos mas sem variantes em componentes (Badge, Alert não têm variant `success`/`warning`/`info`) | Criar variantes de status em Badge, Alert, Button | Adicionar variantes `success`, `warning`, `info` nos componentes que suportam variants | Alto | Todas |
| T5 | `globals.css` | Font variable `--font-heading` definida mas usada inconsistente — apenas dialog, drawer, sheet, card a usam | Adoptar `font-heading` em todos os títulos | Aplicar `font-heading` em PageHeader, SectionHeader, SidebarGroupLabel, etc. | Médio | Todas |

### 2.3 Componentes UI (shadcn/ui)

Os 27 componentes UI são de **qualidade boa** — todos usam tokens de cor, têm acessibilidade aceitável, e são responsivos. Problemas menores:

| # | Componente | Problema | Correcção |
|---|---|---|---|
| U1 | `command.tsx` | `CommandItem` renderiza `CheckIcon` condicionalmente em todos os items (escondido via CSS `opacity-0`) — poluição no DOM | Usar `display: none` ou renderizar condicionalmente |
| U2 | `field.tsx` | `FieldTitle` tem `data-slot="field-label"` que colide com `FieldLabel` — potencial bug em selectores CSS | Renomear slot de `FieldTitle` para `field-title` |
| U3 | `input-group.tsx` | Addon `onClick` usa DOM traversal (`querySelector("input")`) — frágil se input for substituído | Usar ref ou context para comunicar com input |
| U4 | `scroll-area.tsx` | Apenas scrollbar vertical por defeito — horizontal não é renderizada automaticamente | Adicionar prop `orientation` ou renderizar ambos |
| U5 | `sidebar.tsx` (ui) | Cookie de estado setado via `document.cookie` sem `SameSite`/`Secure` | Adicionar atributos de segurança ao cookie |
| U6 | `sonner.tsx` | Wrapper custom com icons temáticos existe mas `app-layout.tsx` importa do `sonner` directamente | Corrigido em L1 |

### 2.4 Formulários

| # | Componente Actual | Problema | Componente-Alvo | Estratégia | Impacto | Páginas |
|---|---|---|---|---|---|---|
| F1 | `unit-form.tsx` | Usa `useState` individual por campo (5 states) em vez de react-hook-form+Zod — inconsistente com `login-form.tsx` | `UnitForm` com react-hook-form + Zod schema | Refactorizar para usar `useForm` + `zodResolver` + schema de validação | Médio | Organização |
| F2 | `unit-form.tsx` | Sem validação cliente além de `required` no nome | Schema Zod com validação completa | Definir schema: nome obrigatório, tipo obrigatório, etc. | Médio | Organização |
| F3 | `unit-form.tsx` | Labels "Tipo" e "Unidade Pai" sem `htmlFor` — não conectados ao input | Labels com `htmlFor` via `FieldLabel` do design system | Usar componentes `Field`/`FieldLabel`/`FieldError` | Baixo | Organização |
| F4 | `unit-form.tsx` | Erros de validação como `<p className="text-destructive">` em vez de `FieldError` | Usar componente `FieldError` | Substituir `<p>` por `<FieldError>` que tem `role="alert"` | Baixo | Organização |
| F5 | `login-form.tsx` | Erros como `<p className="text-destructive">` em vez de `FieldError` | Usar componente `FieldError` | Substituir `<p>` por `<FieldError>` | Baixo | Login |
| F6 | `login-form.tsx` | Sem `aria-describedby` a ligar erro ao input | Adicionar `aria-describedby` | Aplicar `id` no error e `aria-describedby` no input | Médio | Login |
| F7 | `login-form.tsx` | Password sem toggle show/hide | Adicionar `PasswordInput` com toggle | Criar variante `SmartPasswordInput` com ícone de visibilidade (Fase 3) | Baixo | Login |

### 2.5 Data Fetching

| # | Componente Actual | Problema | Componente-Alvo | Estratégia | Impacto | Páginas |
|---|---|---|---|---|---|---|
| D1 | `organization/page.tsx` | Usa `useState` + `useEffect` para data fetching em vez de react-query — inconsistente com `health-status.tsx` | `useOrganizationQuery()` com react-query | Criar hook custom com `useQuery` + `queryKey` | Médio | Organização |
| D2 | `organization/page.tsx` | Catch blocks vazios (linhas 38-39, 53-54) — erros engolidos silenciosamente | Error handling com react-query + toast | react-query gerencia erro; mostrar toast ou ErrorState | Médio | Organização |
| D3 | `organization/page.tsx` | Loading state como texto "A carregar..." em vez de Skeleton | Skeleton adequado | Usar `Skeleton` component ou `CardSkeleton` | Baixo | Organização |
| D4 | `organization/page.tsx` | Botões de organização usam concatenação de className em vez de `cn()` | Usar `cn()` | Substituir por `cn()` | Baixo | Organização |
| D5 | `health-status.tsx` | `refetchInterval: 30000` hardcoded | Configurável ou token | Manter por agora; documentar como pendência para Fase 8 | Baixo | Dashboard |
| D6 | `health-status.tsx` | Sem `aria-live` para actualizações automáticas de status | Adicionar `aria-live="polite"` no container | Envoler output em div com `aria-live` | Médio | Dashboard |
| D7 | `health-status.tsx` | Sem retry button no estado de erro | Adicionar `RetryAction` | Usar `refetch()` do react-query + botão visual | Baixo | Dashboard |

### 2.6 Organização

| # | Componente Actual | Problema | Componente-Alvo | Estratégia | Impacto | Páginas |
|---|---|---|---|---|---|---|
| O1 | `organization-tree.tsx` | Prop `canManage` aceite mas **nunca usada** — dead code | Remover ou usar | Avaliar se é necessária para Fase 3+; por agora remover | Baixo | Organização |
| O2 | `organization-tree.tsx` | Padding hardcoded `paddingLeft: \`${level * 16 + 8}px\`` em vez de tokens | Usar classes Tailwind ou tokens | Calcular com base em spacing tokens | Baixo | Organização |
| O3 | `organization-tree.tsx` | Sem ARIA tree pattern — sem `role="tree"`, `role="treeitem"`, `aria-level`, `aria-expanded`, `aria-setsize`, `aria-posinset` | Tree acessível com ARIA completo | Implementar padrão WAI-ARIA Treeview | Alto | Organização |
| O4 | `organization-tree.tsx` | Sem keyboard navigation — sem `onKeyDown`, sem `tabIndex` management | Tree com navegação por teclado | Adicionar ArrowUp/Down/Left/Right, Home/End, Enter | Alto | Organização |

### 2.7 Auth & Route Protection

| # | Componente Actual | Problema | Componente-Alvo | Estratégia | Impacto | Páginas |
|---|---|---|---|---|---|---|
| A1 | `protected-route.tsx` | Redirect client-side com flash de loading/blank antes de redirecionar | Redirect server-side via middleware | Criar `middleware.ts` com verificação de cookie | Alto | Todas |
| A2 | `protected-route.tsx` | Loading skeleton genérico (3 blocos rectangulares) — não representativo de nenhuma página | Skeleton contextual ou null | Mostrar null ou skeleton específico da rota | Baixo | Todas |
| A3 | `protected-route.tsx` | Sem `<Suspense>` boundary | Adicionar Suspense | Envolver children em `<Suspense fallback={...}>` | Baixo | Todas |
| A4 | `navigation-config.ts` | Campos `requiredRoles`, `scope`, `featureFlag` no tipo `NavigationItem` definidos mas **nunca avaliados** | Avaliar ou remover | Documentar como pendência para Fase 7; manter tipo mas adicionar TODO | Baixo | Todas |

### 2.8 Segurança

| # | Problema | Severidade | Correcção |
|---|---|---|---|
| S1 | Cookie de sidebar (`sidebar_state`) setado sem `SameSite`/`Secure` | Média | Adicionar `SameSite=Lax; Secure` ao `document.cookie` |
| S2 | `ProtectedRoute` só verifica autenticação, não autorização (permissões) | Média | Criar `PermissionGate`/`RoleGate` que verifica `user.permissions` (Fase 7) |
| S3 | Não existe server-side middleware de protecção de rotas | Alta | Criar `middleware.ts` que valida JWT cookie em rotas protegidas |
| S4 | `GET /users/{id}/assignments` e `GET /me/organization-context` não verificam permissões no backend | Média | Adicionar `require_permission` nos endpoints correspondentes (backend) |

---

## 3. Mapeamento de Autorização (§4.4)

### 3.1 Identidade do Utilizador

| Aspecto | Estado |
|---------|--------|
| Mecanismo | JWT (HS256) em cookie httpOnly |
| Cookie name | `sip_access_token` |
| Cookie attributes | `httponly=True`, `secure=True` (prod), `samesite=lax`, `max_age=30min`, `path=/` |
| Claims JWT | `sub` (user UUID), `sid` (session UUID), `iss`, `aud`, `iat`, `exp` |
| **Dados de autorização no JWT** | **NENHUM** — JWT é apenas token de identidade |
| Resolução de permissões | Fresh from DB em cada request via `get_user_permissions()` |
| Revogação | Real-time via `UserSession.revoked_at` — sem esperar expiração do token |

### 3.2 Roles/Perfis

**Não existem "roles" tradicionais.** O sistema usa **perfis** (`ProfileEnum`) como função de role.

| Perfil | Código | Permissões-chave |
|--------|--------|------------------|
| Administrador do Sistema | `ADMINISTRADOR_SISTEMA` | TODAS (37) |
| Director | `DIRECTOR` | process.r/c/u/a, document.r/c/e, user.r, notification.r/m, organization.r, report.r/c/x |
| Secretaria Geral | `SECRETARIA_GERAL` | process.r, document.r/c/e, notification.r/m, organization.r, report.r |
| Chefe de Departamento | `CHEFE_DEPARTAMENTO` | process.r/c/u/a, document.r/e, notification.r/m, report.r |
| Chefe de Secção | `CHEFE_SECCAO` | process.r/c/u, document.r, notification.r, report.r |
| Instrutor Processual | `INSTRUTOR_PROCESSUAL` | process.r/c/u, document.r/c/e, notification.r |
| Agente de Piquete | `AGENTE_PIQUETE` | piquete.r/c/u, process.r, document.r, notification.r |
| Editor Documental | `EDITOR_DOCUMENTAL` | template.r/c/e/p, document.r/c/e/p, notification.r |
| Agente PGR | `AGENTE_PGR` | pgr.r/m, notification.r |

**Relação:** User ↔ Profile é **M:N** — um utilizador pode ter múltiplos perfis. Permissões = **union** de todas as permissões dos perfis activos.

### 3.3 Permissões

**Formato:** `RESOURCE.ACTION` (37 códigos)

| Resource | Permissões |
|----------|-----------|
| `process` | read, create, update, assign, delete |
| `document` | read, create, edit, publish, delete |
| `user` | read, create, update, delete |
| `profile` | read, manage |
| `permission` | read, manage |
| `notification` | read, manage |
| `organization` | read, manage |
| `system` | admin, config, audit |
| `report` | read, create, export |
| `template` | read, create, edit, publish |
| `piquete` | read, create, update |
| `pgr` | read, manage |

### 3.4 Scope / Organisation

| Aspecto | Estado |
|---------|--------|
| Enums definidos | `OrganizationScope` e `ResponsibilityScope` (9 valores: GLOBAL→PGR) |
| Implementação na autorização | **NÃO IMPLEMENTADO** — `ResourceScope` é structural mas não é avaliado |
| `organization_scope` no frontend | Sempre `[]` (stub) |
| Contexto organizacional | Disponível via `GET /me/organization-context` mas não usado para decisões de autorização |
| **Conclusão** | Scope é infraestrutura para futuras fases (7+); autorização actual é flat RBAC |

### 3.5 Hierarquia Organizacional

```
Organization (ex: SIC)
  └─ Direction (ex: DIR-INV "Direcção de Investigação")
       └─ Department (ex: DEP-IC "Departamento de Investigação Criminal")
            └─ Section (ex: SEC-INV "Secção de Investigação")
                 └─ Unit (ex: gabinetes, divisões)
                      └─ Piquete (ex: equipas de campo)
```

**Modelo:** Adjacency list (self-referential FK em `organizational_units.parent_id`)

**Tipos de unidade:** ORGANIZATION, DIRECTION, DEPARTMENT, SECTION, UNIT, PIQUETE, OTHER

**Atribuição de utilizadores:** `UserAssignment` com tipos: PRIMARY, SECONDARY, TEMPORARY, ACTING, DELEGATED

### 3.6 Onde Vive a Autorização

| Camada | Mecanismo | Estado |
|--------|-----------|--------|
| **Backend — Autenticação** | JWT cookie + session validation em cada request | ✅ Implementado |
| **Backend — Autorização** | `require_permission()`, `require_profile()` em `dependencies.py` | ✅ Disponível, usado apenas pelo módulo Organization |
| **Backend — Endpoints** | Apenas `auth` e `organization` têm routers com protecção | ⚠️ 2 de ~15 módulos |
| **Frontend — Route guards** | `ProtectedRoute` verifica apenas `isAuthenticated` | ⚠️ Sem verificação de permissões |
| **Frontend — Sidebar** | `filterNavigationByPermission()` esconde itens sem permissão | ⚠️ Cosmético, sem segurança real |
| **Frontend — Button visibility** | `user.permissions.includes(...)` para botões/acções | ⚠️ Cosmético, sem segurança real |

### 3.7 Endpoints que Confiem na UI (sem backend enforcement)

| Endpoint | Protecção Actual | Risco |
|----------|-----------------|-------|
| `GET /users/{id}/assignments` | Apenas autenticação | Qualquer user logado vê assignments de qualquer user |
| `GET /me/organization-context` | Apenas autenticação | Baixo — dados do próprio user |

### 3.8 Endpoints que NÃO EXISTEM no Backend

Os seguintes módulos estão definidos no frontend (navigation-config) mas **não têm endpoints backend com autorização**:

Processos, Documentos, Ocorrências, Mandados, Despachos, Detidos, Piquete (API), PGR (API), Relatórios, Notificações, Utilizadores (gestão), Auditoria (consulta), Templates, Definições, Pesquisa global.

---

## 4. Pontos de Sobreposição com Prompts Anteriores (§0)

O PROMPT-MESTRE v2 §0 referencia dois prompts de domínio:

### 4.1 Prompt do Módulo de Documentos

**Referência no PROMPT-MESTRE:** "fluxo template → schema de campos → formulário → preview → validação → geração DOCX/PDF → documento processual; mais de 100 templates; folhas de 25 linhas."

**Estado no repositório:** **NÃO EXISTE como ficheiro separado.**

- Não há `prompts/PROMPT-documentos.md` ou similar
- `FRONTEND-SENIOR-STACK.md` e `FRONTEND-ENGINEERING-standards.md` cobrem padrões gerais
- `humanize.ts` defines 15 tipos de documento (DENÚNCIA, PARTICIPAÇÃO, QUEIXA, AUTO, DESPACHO, etc.)
- A secção §45 do PROMPT-MESTRE descreve componentes de UI genéricos (`DocumentBuilder`, `DocumentPreview`, etc.)
- **Ponto de sobreposição:** O fluxo documental detalhado (templates, schema, preview, geração) deve ser definido antes da Fase 4-5

**Acção recomendada:** Criar prompt de domínio para Documentos como pré-requisito da Fase 4, ou integrar a especificação directamente no prompt-filho dessa fase.

### 4.2 Prompt do Módulo de Processos

**Referência no PROMPT-MESTRE:** "separação das entidades Documento, Processo e Tramitação; múltiplas origens (Piquete, PGR, outras entradas institucionais); Piquete como porta de entrada documental, não único ponto de origem."

**Estado no repositório:** **NÃO EXISTE como ficheiro separado.**

- Não há `prompts/PROMPT-processos.md` ou similar
- `humanize.ts` define 11 estados de processo (REcebido → Transferido) e 7 tipos de ocorrência
- O navigation-config define rotas para `/processos`, `/processos/novo`, `/ocorrencias`
- **Ponto de sobreposição:** O modelo de estados de Processo e a separação Documento/Processo/Tramitação devem ser especificados antes da Fase 3-4

**Acção recomendada:** Criar prompt de domínio para Processos como pré-requisito da Fase 3, ou integrar a especificação directamente no prompt-filho dessa fase.

### 4.3 Conclusão de Sobreposição

**Ambos os prompts de domínio referenciados em §0 não existem ainda no repositório.**

Recomendação: Criar ambos os prompts antes das Fases 3-5, ou definir claramente no prompt-filho de cada fase quais as regras de domínio aplicáveis, usando como fonte o código existente (`humanize.ts`, `navigation-config.ts`) e a arquitetura backend (`docs/architecture/`).

---

## 5. Portão de Saída da Fase 0

| Critério | Estado |
|----------|--------|
| Matriz de auditoria completa (secção 2) | ✅ Este documento |
| Mapeamento de autorização validado (secção 3) | ✅ Mapeado a partir do código real |
| Pontos de sobreposição listados (secção 4) | ✅ Identificados |
| **Aprovação do autor do produto** | ⏳ **PENDENTE** |

> **A avançar para a Fase 1 apenas com aprovação explícita do autor do produto sobre este documento.**

---

## 6. Recomendações Prioritárias

### 6.1 Corrigir Imediatamente (bugs/issues)

| # | Item | Ficheiro | Esforço |
|---|------|----------|---------|
| 1 | Import de Toaster — usar wrapper custom | `app-layout.tsx` | 5 min |
| 2 | `PageContainer`/`PageContent` — substituir concatenação por `cn()` | `page-container.tsx` | 10 min |
| 3 | Breadcrumb separadores ausentes | `breadcrumb-nav.tsx` | 15 min |
| 4 | Typos "Instrucao" e "sessao" | `sidebar.tsx` (layout) | 2 min |
| 5 | Cookie de sidebar sem atributos de segurança | `sidebar.tsx` (ui) | 5 min |
| 6 | `FieldTitle` data-slot collision | `field.tsx` | 5 min |

### 6.2 Padronizar Antes de Avançar

| # | Item | De | Para | Esforço |
|---|------|----|----|---------|
| 7 | Data fetching | `useState+useEffect` | react-query | Médio |
| 8 | Form handling | `useState` individual | react-hook-form+Zod | Médio |
| 9 | Error display | `<p className="text-destructive">` | `FieldError` | Baixo |
| 10 | Loading states | Texto "A carregar..." | `Skeleton` | Baixo |
| 11 | Tipografia | Classes inline hardcoded | Classes `sip-*` | Médio |

### 6.3 Adoptar Tokens Não Utilizados

| # | Token Category | Estado Actual | Acção |
|---|---------------|---------------|-------|
| 12 | Motion tokens | `duration-100/200/300` hardcoded | Substituir por `transition-motion-fast/normal/slow` |
| 13 | Z-index tokens | `z-50/10/20` hardcoded | Mapear para tokens `--z-*` |
| 14 | Status token variants | Sem variantes success/warning/info | Criar em Badge, Alert, Button |

---

*Documento gerado como parte da Fase 0 do PROMPT-MESTRE-FRONTEND-REENGENHARIA v2.*
*Aguarda aprovação do autor do produto antes de avançar para a Fase 1.*
