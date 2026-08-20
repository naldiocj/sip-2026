# TASK-007: PageContainer + PageHeader + PageToolbar Enterprise

## Objetivo
Expandir PageContainer com SectionHeader, ContentSection, ContentCard. PageHeader com breadcrumb, title, description, status, primary actions, more actions. PageToolbar com filtros, pesquisa, density toggle, view options.

## Contexto
Sprint 03 Phase 2. Layout base para todas as páginas da aplicação. Padronizar estrutura de página.

## Dependências
- TASK-001 (tokens)
- TASK-006 (breadcrumb)
- TASK-008 (button system - para actions)
- TASK-009 (status badge - para status no header)

## Fora do Escopo
- Conteúdo específico de cada página (domain modules)
- DataTable (Sprint 05)
- Form Engine (Sprint 04)

## Requisitos Funcionais
- RF-01: PageContainer com SectionHeader, ContentSection, ContentCard
- RF-02: PageHeader: breadcrumb, title, description, status badge, primary actions, more actions (dropdown)
- RF-03: PageToolbar: filtros, pesquisa, density toggle, view options (table/list/cards)
- RF-04: Componentes padronizados, usados por TODAS as páginas
- RF-05: Largura adequada, não centralizar arbitrariamente (STARTUP.md secção 9)

## Requisitos Técnicos
- RT-01: Expandir `frontend/src/components/layout/page-container.tsx`
- RT-02: Composição: PageContainer > PageHeader + PageToolbar + Content
- RT-03: Props tipadas para cada variante
- RT-04: Density token integration (comfortable/compact/dense)

## UX
- Estrutura consistente em toda a app
- PageHeader informativo com actions contextuais
- PageToolbar funcional para páginas com dados
- Responsive: toolbar colapsa em mobile

## RBAC
- Actions no PageHeader filtradas por permissões
- PageToolbar mostra apenas filtros permitidos

## Organizational Scope
- PageHeader pode mostrar contexto organizacional

## API
- Não aplicável diretamente (consumido por pages)

## Banco
- Não aplicável

## Testes
- Unitários: Renderização com diferentes props
- Integração: Páginas reais usam PageContainer
- Visual: Todas as páginas usam PageContainer

## Critérios de Aceitação
- [ ] CA-01: PageContainer, PageHeader, PageToolbar funcionais
- [ ] CA-02: Todas as páginas usam PageContainer
- [ ] CA-03: Density toggle funcional
- [ ] CA-04: Actions filtradas por RBAC
- [ ] CA-05: Lint, typecheck, build PASS

## Definition of Done
- [ ] Código implementado e revisto
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Testes PASS
- [ ] Build PASS
- [ ] Quality Gate verificado
- [ ] Documentação atualizada
- [ ] graphify update . executado
- [ ] Commit criado (feat(layout): page container header toolbar enterprise)

## Arquivos Afetados
- `frontend/src/components/layout/page-container.tsx`
- `frontend/src/components/layout/page-header.tsx` (novo, se separado)
- `frontend/src/components/layout/page-toolbar.tsx` (novo, se separado)

## Riscos
- Risco 1: Muitas props, API complexa | Mitigação: Composição over configuration, defaults sensatos
- Risco 2: Conflito com layouts existentes | Mitigação: Migrar páginas gradualmente

## Observações
- STARTUP.md secção 9: conteúdo deve possuir largura adequada, não centralizar arbitrariamente
- PageToolbar integra com DataTable filters (Sprint 05)

## Estado
DONE