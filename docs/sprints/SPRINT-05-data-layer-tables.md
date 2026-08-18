# SPRINT-05 — Data Layer + Tables

## Objetivo

Estabelecer a arquitetura de dados com TanStack Query e criar o DataTable Engine com TanStack Table.

## Estado

**PLANNED**

## Capabilities

| Module id | Responsibility | Depends on |
|-----------|---------------|------------|
| data-layer | TanStack Query patterns, caching, mutations | — |
| data-table-engine | TanStack Table, filters, pagination | data-layer, SPRINT-03 core-components |

## Tasks

| ID | Task | Estado |
|----|------|--------|
| TASK-027 | TanStack Query patterns + query keys | TODO |
| TASK-028 | URL state hooks para tabelas | TODO |
| TASK-029 | AdvancedDataTable core | TODO |
| TASK-030 | DataTableToolbar + Filters | TODO |
| TASK-031 | DataTableBulkActions + Partial Success | TODO |
| TASK-032 | DataTableDensity + Saved Views | TODO |
| TASK-033 | DataTable responsive | TODO |
| TASK-034 | AdvancedFilterBuilder | TODO |
| TASK-035 | Migrar Organization page | TODO |
| TASK-036 | Tests + Lint + Typecheck | TODO |

## Critérios de Conclusão

- [ ] TanStack Query como padrão (queryKeys, mutations, invalidation, optimistic updates)
- [ ] AdvancedDataTable com sorting, filtering, pagination, row selection, column visibility
- [ ] DataTableToolbar com pesquisa, filtros, density toggle, view options
- [ ] DataTableBulkActions com progresso e partial success
- [ ] Saved Views (minhas vistas, vistas partilhadas)
- [ ] AdvancedFilterBuilder com operadores, AND/OR, chips, presets
- [ ] Organization page migrada para novo padrão
- [ ] Todos os testes passam
- [ ] Lint PASS
- [ ] Typecheck PASS
- [ ] Build PASS

## Referências

- `prompts/PROMPT-MESTRE-FRONTEND-REENGENHARIA.md` — Secções 30-36
