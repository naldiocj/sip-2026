# TASK-011: Empty States Sistema

## Objetivo
Criar EmptyState component com variantes para todos os cenários: no-data, no-results, no-results-filter, no-permission, error.

## Contexto
Sprint 03 Phase 3. Empty states atualmente inexistentes ou inconsistentes. Precisa de componente unificado.

## Dependências
- TASK-001 (tokens)
- TASK-008 (Button para actions)
- TASK-009 (StatusBadge se aplicável)

## Fora do Escopo
- Loading states (Task 010)
- Error states (Task 012)

## Requisitos Funcionais
- RF-01: Componente `frontend/src/components/ui/empty-state.tsx`
- RF-02: Variantes: no-data, no-results, no-results-filter, no-permission, error
- RF-03: Cada variante: ícone, título, descrição, action opcional (botão/link)
- RF-04: Usar em tabelas, listas, cards, dashboards, search results

## Requisitos Técnicos
- RT-01: `empty-state.tsx` com variant prop
- RT-02: Ícones Lucide apropriados por variante
- RT-03: Action prop: `onAction?: () => void`, `actionLabel?: string`
- RT-04: Responsivo, centered no container

## UX
- Ilustrações/ícones significativos (não genéricos)
- Copy humano, actionable (ex: "Nenhum processo encontrado. Crie o primeiro processo.")
- Action button proeminente quando aplicável
- Não deixar página branca (STARTUP.md secção 24)

## RBAC
- no-permission variant para quando utilizador não tem acesso

## Organizational Scope
- Empty states podem variar por scope (ex: sem processos nesta secção)

## API
- Não aplicável

## Banco
- Não aplicável

## Testes
- Unitários: Todas as variantes renderizam
- Visual: Em tabelas vazias, search sem resultados, sem permissão
- Acessibilidade: screen reader announcements

## Critérios de Aceitação
- [ ] CA-01: Empty states para todos os cenários
- [ ] CA-02: Ícones, títulos, descrições, actions apropriados
- [ ] CA-03: Usado em tabelas, listas, cards, dashboards
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
- [ ] Commit criado (feat(empty-state): comprehensive empty state system)

## Arquivos Afetados
- `frontend/src/components/ui/empty-state.tsx` (novo)

## Riscos
- Risco 1: Muitas variantes = manutenção | Mitigação: Config-driven, extensível
- Risco 2: Copy inconsistente | Mitigação: Centralizar copy em lib/empty-state-copy.ts

## Observações
- STARTUP.md secção 24: Empty state obrigatório em toda página
- STARTUP.md secção 108: Não aceitar telas vazias

## Estado
DONE