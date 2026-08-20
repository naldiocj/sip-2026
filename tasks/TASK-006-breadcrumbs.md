# TASK-006: Breadcrumbs Inteligentes

## Objetivo
Refatorar Breadcrumb para usar NavigationConfig com labels em português, geração automática a partir da URL + config.

## Contexto
Sprint 03 Phase 2. Breadcrumb atual pode mostrar IDs técnicos. Precisa gerar automaticamente: Início > Processos > Processo 2026/00125 > Documentos.

## Dependências
- TASK-003 (NavigationConfig)
- TASK-001 (tokens)
- TASK-002 (humanização para entity resolution)

## Fora do Escopo
- Sidebar (Task 004)
- Header (Task 005)
- CommandPalette (Sprint 04)

## Requisitos Funcionais
- RF-01: Usar NavigationConfig como fonte de labels
- RF-02: Labels em português (NÃO IDs internos)
- RF-03: Suportar hierarquia: Início > Processos > Processo 2026/00125 > Documentos
- RF-04: Gerar automaticamente a partir da URL + config
- RF-05: Entity resolution para IDs dinâmicos (buscar nome do processo, documento, etc.)
- RF-06: Links clicáveis para níveis pai

## Requisitos Técnicos
- RT-01: Refatorar `frontend/src/components/layout/breadcrumb-nav.tsx`
- RT-02: Hook `useBreadcrumbs()` que combina URL + NavigationConfig + entity resolution
- RT-03: Entity resolution via API para IDs dinâmicos (cache com TanStack Query)
- RT-04: Fallback gracioso se entity não encontrado

## UX
- Breadcrumbs sempre visíveis no PageHeader
- Labels humanos, nunca UUIDs
- Separador visual claro (>)
- Home link sempre presente
- Último item (atual) não clicável, destacado

## RBAC
- Não aplicável diretamente (navegação já filtrada)

## Organizational Scope
- Breadcrumbs respeitam contexto organizacional ativo

## API
- GET /api/v1/processos/{id} para resolver nome do processo
- GET /api/v1/documentos/{id} para resolver nome do documento
- etc. (conforme NavigationConfig)

## Banco
- Não aplicável

## Testes
- Unitários: Geração de breadcrumbs para rotas conhecidas
- Integração: Entity resolution com mock API
- Visual: Navegar por todas as rotas, verificar breadcrumbs

## Critérios de Aceitação
- [ ] CA-01: Breadcrumbs corretos para todas as rotas
- [ ] CA-02: Labels em português, sem IDs
- [ ] CA-03: Entity resolution funcional para IDs dinâmicos
- [ ] CA-04: Geração automática URL + config
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
- [ ] Commit criado (feat(breadcrumb): intelligent breadcrumbs with navigation config)

## Arquivos Afetados
- `frontend/src/components/layout/breadcrumb-nav.tsx`
- `frontend/src/hooks/use-breadcrumbs.ts` (novo)

## Riscos
- Risco 1: Muitas chamadas API para entity resolution | Mitigação: Cache TanStack Query, prefetch
- Risco 2: Rotas dinâmicas não mapeadas | Mitigação: NavigationConfig extensível, fallback para route params

## Observações
- Entity resolution é regra obrigatória (STARTUP.md secção 16)
- Humanização centralizada (TASK-002)

## Estado
DONE