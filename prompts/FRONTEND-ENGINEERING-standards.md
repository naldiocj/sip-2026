========================================================================
SIP — FRONTEND ENGINEERING STANDARDS
Padrão obrigatório para todos os prompts de frontend
========================================================================

PROJECT:
SIP — Sistema de Instrução Processual

APLICAÇÃO:
Todo prompt que envolva trabalho de frontend DEVE referenciar e seguir
estas normas. Estas normas são o padrão de referência, não uma sugestão.

========================================================================
1. STACK PRINCIPAL OBRIGATÓRIA
========================================================================

Utilizar exclusivamente:

- Next.js com App Router
- React
- TypeScript strict
- Tailwind CSS v4
- shadcn/ui
- Lucide React
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Zustand (somente quando realmente necessário)
- nuqs (estado sincronizado com URL)
- Vitest
- Testing Library
- Playwright
- Storybook
- ESLint
- Prettier

NÃO introduzir:

- Redux
- GraphQL
- WebSocket
- Micro-frontends
- Bibliotecas redundantes sem justificativa arquitectural

========================================================================
2. TTIPOGRAFIA GLOBAL
========================================================================

Estabelecer tipografia profissional e consistente em toda a aplicação.

Fonte padrão:

    font-family: sans-serif

A aplicação DEVE utilizar sans-serif como fallback padrão, incluindo:

- shadcn/ui
- Componentes próprios
- Tabelas
- Formulários
- Dialogs
- Menus
- Sidebar
- Breadcrumbs
- Páginas
- Estados de loading
- Mensagens
- Dashboards

NÃO permitir que componentes utilizem fontes diferentes arbitrariamente.

Centralizar definição tipográfica no design system/Tailwind.

Hierarquia tipográfica consistente:

    Display
    H1
    H2
    H3
    H4
    Body
    Small
    Caption
    Label

Garantir:

- Tamanho consistente
- Peso consistente
- Line-height adequado
- Contraste
- Legibilidade
- Truncamento quando necessário
- Suporte a textos longos
- Comportamento responsivo

NÃO utilizar fontes decorativas ou serifadas como padrão.

========================================================================
3. DESIGN SYSTEM
========================================================================

Construir sobre:

    shadcn/ui + Tailwind CSS v4

Componentes base a padronizar:

    Button
    Input
    Textarea
    Select
    Combobox
    Checkbox
    Radio
    Switch
    Form
    Dialog
    Sheet
    Drawer
    Dropdown
    Popover
    Tooltip
    Tabs
    Card
    Badge
    Alert
    Breadcrumb
    Pagination
    Command
    Calendar
    DatePicker
    DateRangePicker
    Skeleton
    Separator
    Avatar
    Table

NÃO criar versões duplicadas.

Quando shadcn/ui fornecer solução adequada, reutilizar.

========================================================================
4. COMPONENTES EMPRESARIAIS REUTILIZÁVEIS
========================================================================

Criar componentes de nível de aplicação:

    PageContainer
    PageHeader
    PageToolbar
    PageActions
    DataTable
    DataTableToolbar
    DataTableFilters
    DataTablePagination
    DataTableColumnVisibility
    SearchInput
    FilterBar
    StatusBadge
    PermissionGuard
    EmptyState
    ErrorState
    LoadingState
    ConfirmDialog
    FormSection
    FormActions
    FileUpload
    FilePreview
    DocumentPreview
    CommandMenu

Esses componentes DEVEM ser reutilizáveis entre módulos.

========================================================================
5. LAYOUT PROFissional
========================================================================

Sistema de layout consistente:

    AppShell
    ├── Sidebar
    ├── Header
    ├── Breadcrumb
    └── MainContent
        └── PageContainer
            ├── PageHeader
            ├── PageToolbar
            └── PageContent

O conteúdo principal NÃO deve possuir diferentes max-width, paddings e
margens arbitrariamente.

Centralizar regras de layout.

========================================================================
6. RESPONSIVIDADE
========================================================================

O frontend DEVE ser:

- Desktop-first (aplicação predominantemente administrativa)
- Responsivo
- Adaptável a tablets
- Funcional em resoluções menores
- Sem overflow horizontal acidental

Garantir comportamento adequado para:

- Sidebar
- Tabelas
- Formulários
- Dialogs
- Filtros
- Cards
- Dashboards

========================================================================
7. TEMA
========================================================================

Preparar design system para:

- Light mode
- Dark mode
- System preference

Cores baseadas em tokens, sem espalhar valores arbitrários:

    background
    foreground
    card
    card-foreground
    primary
    primary-foreground
    secondary
    muted
    accent
    destructive
    border
    input
    ring

NUNCA espalhar hexadecimal directamente por componentes sem necessidade.

========================================================================
8. ÍCONES
========================================================================

Utilizar exclusivamente:

    Lucide React

NÃO criar SVGs manualmente quando existir ícone equivalente.

Os ícones DEVEM:

- Possuir tamanho consistente
- Possuir alinhamento correcto
- Respeitar currentColor
- Possuir tooltip quando a accção não for óbvia
- Não substituir texto quando o contexto exigir clareza

========================================================================
9. NEXT.JS
========================================================================

Utilizar App Router.

Preferir Server Components por padrão.

Utilizar "use client" SOMENTE quando houver necessidade de:

- Interação
- Estado
- Eventos
- Browser APIs
- React Hook Form
- TanStack Query
- Componentes interativos

Implementar adequadamente:

- Layouts
- loading.tsx
- error.tsx
- not-found.tsx
- Route groups
- Metadata
- Dynamic imports
- Streaming quando adequado

========================================================================
10. SERVER STATE
========================================================================

Utilizar TanStack Query para dados da API.

Separar rigorosamente:

    Server State      → TanStack Query
    Form State        → React Hook Form
    URL State         → nuqs
    Global UI State   → Zustand
    Local UI State    → useState/useReducer

NUNCA duplicar desnecessariamente server state em Zustand.

========================================================================
11. API LAYER
========================================================================

Centralizar comunicação com o backend.

Criar camada responsável por:

- HTTP client
- Autenticação
- Headers
- Timeout
- Tratamento de erros
- Serialização
- Tipagem
- Cancellation
- Intercepção quando necessária

Os componentes NÃO devem possuir chamadas HTTP directamente.

========================================================================
12. FORMULÁRIOS
========================================================================

Utilizar:

    React Hook Form + Zod + shadcn/ui

Padronizar:

- Schemas
- Validação
- Mensagens
- Estados
- Submit
- Erros
- Loading
- Sucesso
- Reset
- Dirty state
- Confirmação antes de abandonar alterações quando necessário

Evitar formulários monolíticos.

Dividir formulários complexos em seccções e componentes.

========================================================================
13. TABELAS
========================================================================

Utilizar:

    TanStack Table

Com suporte a:

- Server-side pagination
- Sorting
- Filtering
- Global search
- Column filtering
- Column visibility
- Row selection
- Bulk actions
- URL state
- Responsive behavior
- Loading
- Empty state
- Error state

Criar infraestrutura DataTable reutilizável.

========================================================================
14. PERFORMANCE
========================================================================

Aplicar boas práticas:

- Server Components
- Code splitting
- Lazy loading
- Dynamic imports
- Cache
- Prefetch
- Otimização de imagens
- Virtualização para grandes datasets
- Evitar renders desnecessários
- Evitar componentes gigantes
- Evitar dependências desnecessárias

NÃO aplicar memo, useMemo e useCallback indiscriminadamente.

Utilizar otimização baseada em necessidade real.

========================================================================
15. ACESSIBILIDADE
========================================================================

Seguir boas práticas WCAG.

Garantir:

- Keyboard navigation
- Focus management
- Focus visible
- Semantic HTML
- Labels
- ARIA quando necessário
- Dialogs acessíveis
- Tabelas acessíveis
- Contraste adequado
- Screen readers

NÃO utilizar apenas cor para transmitir informação.

========================================================================
16. UX STATES
========================================================================

Toda operação assíncrona DEVE considerar:

    Idle
    Loading
    Success
    Error
    Empty
    Unauthorized
    Forbidden

NUNCA deixar área da interface aparentemente quebrada ou vazia sem feedback.

Criar componentes reutilizáveis:

    LoadingState
    Skeleton
    EmptyState
    ErrorState
    PermissionDenied
    NotFoundState

========================================================================
17. SEGURANÇA FRONTEND
========================================================================

Implementar:

- Protecção de rotas
- Controlo de acesso
- Tratamento de sessão
- Protecção contra exposição de secrets
- Validação de inputs
- Tratamento seguro de erros

NUNCA confiar no frontend como mecanismo definitivo de autorização.

A autorização real pertence ao backend.

========================================================================
18. ARQUITECTURA POR DOMÍNIO
========================================================================

Utilizar Feature-Based Architecture:

    src/
    ├── app/
    ├── features/
    │   ├── autenticacao/
    │   ├── ocorrencias/
    │   ├── processos/
    │   ├── documentos/
    │   ├── piquete/
    │   ├── mandados/
    │   ├── detidos/
    │   ├── pgr/
    │   └── relatorios/
    ├── components/
    ├── lib/
    ├── hooks/
    ├── types/
    └── styles/

Cada feature DEVE encapsular sua própria lógica:

    feature/
    ├── components/
    ├── hooks/
    ├── queries/
    ├── mutations/
    ├── schemas/
    ├── types/
    ├── services/
    └── utils/

Evitar dependências circulares entre features.

========================================================================
19. QUALIDADE DE CÓDIGO
========================================================================

Configurar:

- TypeScript strict
- ESLint
- Prettier
- Import aliases
- Import sorting
- lint-staged
- Husky
- Typecheck
- Testes automatizados
- CI quality gates

Proibir ou reduzir fortemente:

- any
- @ts-ignore
- Casts desnecessários
- Código duplicado
- Funções gigantes
- Componentes gigantes
- Hooks gigantes
- Prop drilling excessivo
- Lógica de negócio dentro da UI
- Chamadas HTTP directamente em componentes

========================================================================
20. TESTES
========================================================================

Implementar:

    Vitest            → Unit tests
    Testing Library   → Component tests
    Playwright        → E2E

Testar principalmente:

- Autenticação
- Autorização
- Formulários
- Tabelas
- Filtros
- CRUD
- Navegação
- Estados de erro
- Loading
- Fluxos críticos

========================================================================
21. STORYBOOK
========================================================================

Utilizar Storybook para documentar componentes reutilizáveis.

Cada componente importante DEVE possuir:

- Default state
- Loading
- Disabled
- Error
- Empty
- Variants
- Casos extremos

Storybook funciona como catálogo vivo do design system.

========================================================================
22. DEVELOPER EXPERIENCE
========================================================================

Criar scripts padronizados:

    dev
    build
    start
    lint
    typecheck
    test
    test:watch
    test:e2e
    storybook

O projecto DEVE permitir que novo desenvolvedor inicie ambiente rapidamente.

Documentar decisões arquitecturais importantes.

========================================================================
23. PRINCÍPIO FUNDAMENTAL
========================================================================

NÃO adicionar tecnologia apenas porque é popular.

Cada dependência DEVE responder a uma necessidade real.

Priorizar:

    Simplicidade
    +
    Consistência
    +
    Performance
    +
    Segurança
    +
    Acessibilidade
    +
    Testabilidade
    +
    Manutenibilidade

O resultado DEVE ter qualidade de Senior/Staff/Principal Frontend Engineer,
com arquitectura preparada para crescimento sem cair em overengineering.

========================================================================
AUDITÓRIA ANTES DE IMPLEMENTAR
========================================================================

Antes de modificar o projecto, FAZER auditoria da implementação existente:

1. Tecnologias já utilizadas
2. Duplicações
3. Inconsistências
4. Componentes reutilizáveis existentes
5. Problemas de arquitectura
6. Problemas de performance
7. Problemas de acessibilidade
8. Problemas de tipagem
9. Problemas de UX
10. Dependências desnecessárias

Depois da auditoria, aplicar arquitectura definida de forma incremental,
preservando funcionalidades existentes e evitando regressões.

========================================================================
FIM — FRONTEND ENGINEERING STANDARDS
========================================================================
