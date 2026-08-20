# TASK-002: Humanization Engine Expandido

## Objetivo
Expandir `humanize.ts` com mapeamentos completos para todos os domínios SIP e criar funções genéricas reutilizáveis.

## Contexto
Sprint 03 Phase 1. Atualmente `humanize.ts` tem mapeamentos parciais. Precisa cobrir: process statuses, document types, occurrence types, mandate states, notification types. Também remover duplicatas de `getInitials()` em sidebar.tsx e header.tsx.

## Dependências
- TASK-001 (tokens centralizados para cores de status)

## Fora do Escopo
- Internacionalização (i18n) — apenas PT-PT por enquanto
- Backend enums — frontend consome do backend

## Requisitos Funcionais
- RF-01: Mapeamentos para process statuses, document types, occurrence types, mandate states, notification types
- RF-02: `humanizeStatus(status, domain)` genérico
- RF-03: `humanizeEntity(type, code)` genérico
- RF-04: `getInitials()` como utilitário partilhado (remover duplicatas)
- RF-05: Dicionário completo, funções reutilizáveis, sem duplicações

## Requisitos Técnicos
- RT-01: Arquivo `frontend/src/lib/humanize.ts` expandido
- RT-02: Testes unitários em `frontend/src/__tests__/humanize.test.ts`
- RT-03: TypeScript strict — tipos para todos os mapeamentos

## UX
- Labels sempre em português, legíveis
- Fallback gracioso para códigos desconhecidos
- Consistência entre Sidebar, Header, Tabelas, Cards, Timeline

## RBAC
- Não aplicável (utilitário transversal)

## Organizational Scope
- Não aplicável

## API
- Consumir enums do backend via OpenAPI types

## Banco
- Não aplicável

## Testes
- Unitários: 100% cobertura das funções humanize
- Casos: known codes, unknown codes, edge cases (null, undefined, empty)

## Critérios de Aceitação
- [ ] CA-01: Dicionário completo para todos os domínios
- [ ] CA-02: Funções genéricas funcionais
- [ ] CA-03: `getInitials()` centralizado, duplicatas removidas
- [ ] CA-04: Testes unitários passam
- [ ] CA-05: Typecheck PASS

## Definition of Done
- [ ] Código implementado e revisto
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Testes PASS
- [ ] Build PASS
- [ ] Quality Gate verificado
- [ ] Documentação atualizada
- [ ] graphify update . executado
- [ ] Commit criado (feat(humanize): expanded humanization engine)

## Arquivos Afetados
- `frontend/src/lib/humanize.ts`
- `frontend/src/__tests__/humanize.test.ts` (novo)
- `frontend/src/components/layout/sidebar.tsx` (remover getInitials duplicado)
- `frontend/src/components/layout/header.tsx` (remover getInitials duplicado)

## Riscos
- Risco 1: Backend muda enums | Mitigação: Tipos gerados do OpenAPI, fallback gracioso
- Risco 2: Performance de lookup | Mitigação: Map/Object lookup O(1), memoização se necessário

## Observações
- Nunca mostrar UUIDs, IDs técnicos, enums crus ao utilizador
- Humanização é regra obrigatória (STARTUP.md secção 117)

## Estado
DONE