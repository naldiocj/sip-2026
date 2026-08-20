# AGENTS.md — Frontend SIP

## Regras do Projeto (herdadas de /AGENTS.md)
- Uso obrigatório de skills (frontend-ui-engineering, spec-driven-development, etc.)
- graphify como fonte primária — SEMPRE `graphify query` antes de qualquer task
- Ciclo: DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP
- NUNCA implementar módulos funcionais antes da fase correspondente
- NUNCA confiar em segurança no frontend (hidden buttons, route guards)
- NUNCA armazenar secrets no Git

## Stack Frontend
- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4 (CSS-first, sem tailwind.config.ts)
- shadcn/ui com @base-ui/react (render prop, NÃO asChild)
- TanStack Query v5 (server state), TanStack Table v9
- React Hook Form + Zod (forms)
- lucide-react (icons), sonner (toasts), cmdk (command palette)

## Arquitetura Frontend
```
frontend/
├── app/                    # App Router pages
├── components/
│   ├── ui/                 # Genéricos (button, dialog, etc.) — nomes em INGLÊS
│   └── layout/             # AppShell, Sidebar, Header, etc.
├── features/               # Por domínio (processos, documentos, etc.) — nomes em PORTUGUÊS
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       ├── services/
│       ├── types/
│       └── queries/
├── lib/                    # Utilitários partilhados (humanize, navigation-config, etc.)
├── hooks/                  # Hooks transversais (useUrlState, etc.)
├── providers/              # React Context providers
├── types/                  # Tipos partilhados
└── tests/                  # Testes unitários/integração
```

## Regras Obrigatórias
- **Design System**: shadcn/ui + Tailwind — reutilizar antes de criar
- **Humanização**: SEMPRE usar `humanize.ts` — NUNCA mostrar UUIDs, IDs técnicos, enums crus
- **Entity Resolution**: Labels humanos, value = ID
- **TanStack Query**: OBRIGATÓRIO para server state — NUNCA `useEffect + fetch`
- **Formulários**: React Hook Form + Zod — validação client + server
- **Tabelas**: DataTable reutilizável (TanStack Table) — pesquisa, filtros, paginação, seleção
- **Estados**: Loading, Empty, Error, Success, Unauthorized, Forbidden em TODAS as páginas
- **Acessibilidade**: WCAG 2.1 AA — keyboard, focus, ARIA, contraste
- **Rotas**: Português, lowercase, sem acentos (`/processos`, `/ocorrencias`, `/documentos`)
- **RBAC**: Consultar backend — NUNCA hardcodear perfis/permissões
- **Organizational Scope**: Respeitar hierarquia backend

## Quality Gate (por task)
- [ ] Typecheck PASS (`npm run typecheck`)
- [ ] Lint PASS (`npm run lint`)
- [ ] Testes PASS (`npm run test`)
- [ ] Build PASS (`npm run build`)
- [ ] RBAC validado contra backend
- [ ] Organizational scope respeitado
- [ ] UX: loading/empty/error states
- [ ] Acessibilidade verificada