# TASK-014: Tests + Lint + Typecheck para SPRINT-03

## Objetivo
Executar todos os testes, lint e typecheck para validar Sprint 03 completo.

## Contexto
Sprint 03 Phase 4. Quality gate final do Sprint 03. Todas as tasks 001-013 devem passar.

## Dependências
- TASK-001 a TASK-013 (todas devem estar IMPLEMENTED ou TESTING)

## Fora do Escopo
- Testes E2E completos (Playwright) — Sprint 09
- Visual regression — Sprint 09
- Performance benchmarks — Sprint 16

## Requisitos Funcionais
- RF-01: Testes unitários para: HumanizationEngine, NavigationConfig, StatusBadge, EmptyState, ErrorState, Button variants
- RF-02: Testes de integração para: Sidebar permission filtering, Breadcrumb generation
- RF-03: Atualizar testes existentes para novos componentes
- RF-04: Executar lint e typecheck
- RF-05: Build de produção passa

## Requisitos Técnicos
- RT-01: `npm run test` - Vitest unit + integration
- RT-02: `npm run lint` - ESLint + Prettier
- RT-03: `npm run typecheck` - TypeScript strict
- RT-04: `npm run build` - Next.js production build
- RT-05: Cobertura alvo: >80% para novos componentes

## UX
- Não aplicável

## RBAC
- Testes validam permission filtering

## Organizational Scope
- Testes validam scope respeitado

## API
- Mocks para API calls nos testes

## Banco
- Não aplicável

## Testes
- Unitários: Humanize, NavigationConfig, StatusBadge, EmptyState, ErrorState, Button, AsyncButton, ConfirmButton, IconButton, Skeletons, URL State hooks
- Integração: Sidebar filtering, Breadcrumb generation, ErrorBoundary
- Cobertura: >80% novos componentes

## Critérios de Aceitação
- [ ] CA-01: Todos os testes passam (`npm run test`)
- [ ] CA-02: Lint clean (`npm run lint`)
- [ ] CA-03: Typecheck clean (`npm run typecheck`)
- [ ] CA-04: Build passa (`npm run build`)
- [ ] CA-05: Cobertura >80% novos componentes

## Definition of Done
- [ ] Código implementado e revisto
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Testes PASS
- [ ] Build PASS
- [ ] Quality Gate verificado
- [ ] Documentação atualizada
- [ ] graphify update . executado
- [ ] Commit criado (test(sprint03): quality gate validation)

## Arquivos Afetados
- `frontend/src/__tests__/*.test.tsx` (novos/atualizados)
- `frontend/src/components/**/*.test.tsx`
- `frontend/src/hooks/**/*.test.ts`
- `frontend/src/lib/**/*.test.ts`

## Riscos
- Risco 1: Testes flaky | Mitigação: Deterministic mocks, no timers
- Risco 2: Typecheck errors em shadcn base-nova | Mitigação: @types ou type assertions mínimas

## Observações
- STARTUP.md secção 106: Quality Gate checklist
- STARTUP.md secção 127: Sprint 00 criteria aplicável a todos sprints

## Estado
DONE