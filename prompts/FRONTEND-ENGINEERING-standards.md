========================================================================
SIP — FRONTEND ENGINEERING STANDARDS
Padrão obrigatório para todos os prompts de frontend
========================================================================

PROJECT:
SIP — Sistema de Instrução Processual

APLICAÇÃO:
Todo prompt que envolva trabalho de frontend DEVE referenciar e seguir
estas normas. Estas normas são o padrão de referência, não uma sugestão.

Atue como um Senior Frontend Architect / Principal Frontend Engineer e
estabeleça no projecto uma arquitectura frontend moderna, enterprise,
escalável, performática, acessível e altamente manutenível.

Não trate a tarefa apenas como instalação de bibliotecas. Analise o
projecto existente, preserve o que estiver correcto, elimine
inconsistências e estabeleça padrões profissionais de desenvolvimento.

========================================================================
1. STACK PRINCIPAL OBRIGATÓRIA
========================================================================

Utilizar:

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

Não introduzir Redux, GraphQL, WebSocket, micro-frontends ou bibliotecas
redundantes sem justificativa arquitectural.

========================================================================
2. TIPOGRAFIA GLOBAL
========================================================================

Estabeleça uma tipografia profissional e consistente em toda a
aplicação.

A fonte padrão deve ser **Geist** (Google Fonts), carregada via `next/font/google`:

    import { Geist, Geist_Mono } from "next/font/google";
    const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
    const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

A definição CSS no `@theme inline` do Tailwind v4 deve referenciar as variáveis
com nomes diferentes das que está a definir:

    --font-sans: var(--font-geist-sans);
    --font-mono: var(--font-geist-mono);

> **Nota:** No Tailwind v4 com `@theme inline`, as variáveis CSS são resolvidas a
> parse time, não runtime. Usar `var(--font-sans)` dentro de `--font-sans` cria
> uma referência circular. Referenciar sempre variáveis com nomes diferentes
> (ex: `--font-geist-sans` em vez de `--font-sans`).

A aplicação deve utilizar Geist como fallback padrão, incluindo:

- shadcn/ui
- componentes próprios
- tabelas
- formulários
- dialogs
- menus
- sidebar
- breadcrumbs
- páginas
- estados de loading
- mensagens
- dashboards

Não permitir que componentes utilizem fontes diferentes arbitrariamente.

Centralizar a definição tipográfica no design system/Tailwind.

A hierarquia tipográfica deve ser consistente:

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

- tamanho consistente
- peso consistente
- line-height adequado
- contraste
- legibilidade
- truncamento quando necessário
- suporte a textos longos
- comportamento responsivo

Não utilizar fontes decorativas ou serifadas como padrão.

========================================================================
3. DESIGN SYSTEM
========================================================================

Construir o design system sobre:

    shadcn/ui + Tailwind CSS v4

Os componentes devem possuir aparência consistente em toda a aplicação.

Criar e padronizar:

- Button
- Input
- Textarea
- Select
- Combobox
- Checkbox
- Radio
- Switch
- Form
- Dialog
- Sheet
- Drawer
- Dropdown
- Popover
- Tooltip
- Tabs
- Card
- Badge
- Alert
- Breadcrumb
- Pagination
- Command
- Calendar
- DatePicker
- DateRangePicker
- Skeleton
- Separator
- Avatar
- Table

Não criar versões duplicadas desses componentes.

Quando o shadcn/ui já fornecer uma solução adequada, reutilizá-la.

========================================================================
4. COMPONENTES EMPRESARIAIS REUTILIZÁVEIS
========================================================================

Além dos componentes base, criar componentes de nível de aplicação:

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

Esses componentes devem ser reutilizáveis entre módulos.

========================================================================
5. LAYOUT PROFissional
========================================================================

Estabelecer um sistema de layout consistente:

    AppShell
    ├── Sidebar
    ├── Header
    ├── Breadcrumb
    └── MainContent
        └── PageContainer
            ├── PageHeader
            ├── PageToolbar
            └── PageContent

O conteúdo principal não deve possuir diferentes max-width, paddings e
margens arbitrariamente.

Centralizar as regras de layout.

========================================================================
6. RESPONSIVIDADE
========================================================================

O frontend deve ser:

- desktop-first quando a aplicação for predominantemente administrativa
- responsivo
- adaptável a tablets
- funcional em resoluções menores
- sem overflow horizontal acidental

Garantir comportamento adequado para:

- sidebar
- tabelas
- formulários
- dialogs
- filtros
- cards
- dashboards

========================================================================
7. TEMA
========================================================================

Preparar o design system para:

- light mode
- dark mode
- system preference

As cores devem ser baseadas em tokens sem espalhar valores arbitrários
pelo código.

Exemplo conceitual:

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

Nunca espalhar hexadecimal directamente pelos componentes sem
necessidade.

========================================================================
8. ÍCONES
========================================================================

Utilizar exclusivamente:

    Lucide React

Não criar SVGs manualmente quando existir um ícone equivalente.

Os ícones devem:

- possuir tamanho consistente
- possuir alinhamento correcto
- respeitar currentColor
- possuir tooltip quando a acção não for óbvia
- não substituir texto quando o contexto exigir clareza

========================================================================
9. NEXT.JS
========================================================================

Utilizar App Router.

Preferir:

    Server Components

por padrão.

Utilizar:

    "use client"

somente quando houver necessidade de:

- interação
- estado
- eventos
- browser APIs
- React Hook Form
- TanStack Query
- componentes interativos

Implementar adequadamente:

- layouts
- loading.tsx
- error.tsx
- not-found.tsx
- route groups
- metadata
- dynamic imports
- streaming quando adequado

========================================================================
10. SERVER STATE
========================================================================

Utilizar:

    TanStack Query

para dados provenientes da API.

Separar rigorosamente:

    Server State      → TanStack Query
    Form State        → React Hook Form
    URL State         → nuqs
    Global UI State   → Zustand
    Local UI State    → useState/useReducer

Nunca duplicar desnecessariamente server state em Zustand.

========================================================================
11. API LAYER
========================================================================

Centralizar comunicação com o backend.

Criar uma camada responsável por:

- HTTP client
- autenticação
- headers
- timeout
- tratamento de erros
- serialização
- tipagem
- cancellation
- intercepção quando necessária

Os componentes não devem possuir chamadas HTTP directamente.

========================================================================
12. FORMULÁRIOS
========================================================================

## Regra Obrigatória: React Hook Form

**Todos** os formulários devem usar `react-hook-form` + `@hookform/resolvers` + `zod`.

**NÃO utilizar:**
- `useState` para cada campo de form
- `onChange` handlers manuais
- Validação manual com `required` HTML only
- Lógica de validação inline no componente

**Padrão obrigatório:**

    import { useForm } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import { z } from "zod";

    const schema = z.object({ ... });
    type FormData = z.infer<typeof schema>;

    const form = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: { ... },
    });

    // No JSX:
    <Input {...form.register("fieldName")} />
    {form.formState.errors.fieldName && (
      <p className="text-sm text-destructive">
        {form.formState.errors.fieldName.message}
      </p>
    )}

**Integração com shadcn/ui:**
- Usar `{...form.register("field")}` nos componentes `Input`, `Textarea`, `Select`
- Erros de validação com `form.formState.errors`
- Loading com `form.formState.isSubmitting` ou prop `isSubmitting`
- Reset com `form.reset()` após sucesso

**Padronizar:**

- schemas Zod por form (exportados)
- validação server-side via mesmo schema
- mensagens de erro em PT
- estados: idle, loading, success, error
- submit com `form.handleSubmit`
- dirty state com `form.formState.isDirty`
- confirmação antes de abandonar alterações quando necessário

Evitar formulários monolíticos.

Dividir formulários complexos em seccções e componentes.

========================================================================
13. TABELAS
========================================================================

Utilizar:

    TanStack Table

com suporte a:

- server-side pagination
- sorting
- filtering
- global search
- column filtering
- column visibility
- row selection
- bulk actions
- URL state
- responsive behavior
- loading
- empty state
- error state

Criar uma infraestrutura de DataTable reutilizável.

========================================================================
14. PERFORMANCE
========================================================================

Aplicar boas práticas de performance:

- Server Components
- code splitting
- lazy loading
- dynamic imports
- cache
- prefetch
- otimização de imagens
- virtualização para grandes datasets
- evitar renders desnecessários
- evitar componentes gigantes
- evitar dependências desnecessárias

Não aplicar memo, useMemo e useCallback indiscriminadamente.

Utilizar otimização baseada em necessidade real.

========================================================================
15. ACESSIBILIDADE
========================================================================

Seguir boas práticas WCAG.

Garantir:

- keyboard navigation
- focus management
- focus visible
- semantic HTML
- labels
- ARIA quando necessário
- dialogs acessíveis
- tabelas acessíveis
- contraste adequado
- screen readers

Não utilizar apenas cor para transmitir informação.

========================================================================
16. UX STATES
========================================================================

Toda operação assíncrona deve considerar:

    Idle
    Loading
    Success
    Error
    Empty
    Unauthorized
    Forbidden

Nunca deixar uma área da interface aparentemente quebrada ou vazia sem
feedback.

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

- protecção de rotas
- controle de acesso
- tratamento de sessão
- protecção contra exposição de secrets
- validação de inputs
- tratamento seguro de erros

Nunca confiar no frontend como mecanismo definitivo de autorização.

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

Cada feature deve encapsular sua própria lógica:

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
- import aliases
- import sorting
- lint-staged
- Husky
- typecheck
- testes automatizados
- CI quality gates

Proibir ou reduzir fortemente:

- any
- @ts-ignore
- casts desnecessários
- código duplicado
- funções gigantes
- componentes gigantes
- hooks gigantes
- prop drilling excessivo
- lógica de negócio dentro da UI
- chamadas HTTP directamente em componentes

========================================================================
20. TESTES
========================================================================

Implementar:

    Vitest            → Unit tests
    Testing Library   → Component tests
    Playwright        → E2E

Testar principalmente:

- autenticação
- autorização
- formulários
- tabelas
- filtros
- CRUD
- navegação
- estados de erro
- loading
- fluxos críticos

========================================================================
21. STORYBOOK
========================================================================

Utilizar Storybook para documentar componentes reutilizáveis.

Cada componente importante deve possuir:

- default state
- loading
- disabled
- error
- empty
- variants
- casos extremos

O Storybook deve funcionar como catálogo vivo do design system.

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

O projecto deve permitir que um novo desenvolvedor consiga iniciar o
ambiente rapidamente.

Documentar decisões arquitecturais importantes.

========================================================================
23. PRINCÍPIO FUNDAMENTAL
========================================================================

Não adicionar tecnologia apenas porque é popular.

Cada dependência deve responder a uma necessidade real.

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

O resultado final deve ter qualidade de Senior/Staff/Principal Frontend
Engineer, com uma arquitectura preparada para crescimento sem cair em
overengineering.

========================================================================
AUDITÓRIA ANTES DE IMPLEMENTAR
========================================================================

Antes de modificar o projecto, faça uma auditoria da implementação
existente e identifique:

1. tecnologias já utilizadas
2. duplicações
3. inconsistências
4. componentes reutilizáveis existentes
5. problemas de arquitectura
6. problemas de performance
7. problemas de acessibilidade
8. problemas de tipagem
9. problemas de UX
10. dependências desnecessárias

Depois da auditoria, aplique a arquitectura definida neste prompt de
forma incremental, preservando funcionalidades existentes e evitando
regressões.

========================================================================
FIM — FRONTEND ENGINEERING STANDARDS
========================================================================
