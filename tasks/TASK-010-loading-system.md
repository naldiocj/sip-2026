# TASK-010: Loading System

## Objetivo
Criar skeletons especializados para cada tipo de conteúdo: TableSkeleton, FormSkeleton, CardSkeleton, DashboardSkeleton, DetailsSkeleton, TimelineSkeleton.

## Contexto
Sprint 03 Phase 3. Loading states atualmente genéricos. Precisa simular layout real do conteúdo para melhor perceived performance.

## Dependências
- TASK-001 (tokens para spacing, motion)
- TASK-007 (PageContainer para integração)

## Fora do Escopo
- Spinner global (já existe)
- Progressive loading strategies (Sprint 16)

## Requisitos Funcionais
- RF-01: Skeletons especializados: TableSkeleton, FormSkeleton, CardSkeleton, DashboardSkeleton, DetailsSkeleton, TimelineSkeleton
- RF-02: Usar existente `skeleton.tsx` como base
- RF-03: Cada skeleton simula layout real do conteúdo
- RF-04: Animação suave (shimmer ou pulse via motion tokens)

## Requisitos Técnicos
- RT-01: Expandir `frontend/src/components/ui/skeleton.tsx` + novos ficheiros
- RT-02: Componentes compostos: TableSkeleton = HeaderSkeleton + RowSkeleton * n
- RT-03: CSS animations usando motion tokens (duration.normal, easing.standard)
- RT-04: Props para customizar número de linhas, colunas, etc.

## UX
- Skeleton aparece imediatamente (sem layout shift)
- Dimensões match conteúdo real
- Animação suave, não distracting
- Removido progressivamente à medida que dados chegam

## RBAC
- Não aplicável

## Organizational Scope
- Não aplicável

## API
- Não aplicável

## Banco
- Não aplicável

## Testes
- Visual: Network throttle (slow 3G), verificar skeletons
- Unitários: Renderização com diferentes props
- Integração: Páginas reais usam skeletons corretos

## Critérios de Aceitação
- [ ] CA-01: Skeletons para cada tipo de conteúdo
- [ ] CA-02: Animação suave
- [ ] CA-03: Simula layout real
- [ ] CA-04: Lint, typecheck, build PASS

## Definition of Done
- [ ] Código implementado e revisto
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Testes PASS
- [ ] Build PASS
- [ ] Quality Gate verificado
- [ ] Documentação atualizada
- [ ] graphify update . executado
- [ ] Commit criado (feat(loading): specialized skeletons system)

## Arquivos Afetados
- `frontend/src/components/ui/skeleton.tsx` (expandir)
- `frontend/src/components/ui/table-skeleton.tsx` (novo)
- `frontend/src/components/ui/form-skeleton.tsx` (novo)
- `frontend/src/components/ui/card-skeleton.tsx` (novo)
- `frontend/src/components/ui/dashboard-skeleton.tsx` (novo)
- `frontend/src/components/ui/details-skeleton.tsx` (novo)
- `frontend/src/components/ui/timeline-skeleton.tsx` (novo)

## Riscos
- Risco 1: Muitos componentes skeleton | Mitigação: Composição, base reutilizável
- Risco 2: Layout shift ao trocar skeleton → conteúdo | Mitigação: Dimensões exatas, CSS grid/flex estável

## Observações
- STARTUP.md secção 24: Toda página deve possuir Loading state
- STARTUP.md secção 726: Skeleton é padrão UX obrigatório

## Estado
DONE