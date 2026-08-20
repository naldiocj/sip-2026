# TASK-013: Rotas Portuguesas + URL State Hooks

## Objetivo
Implementar rotas em português, useUrlState hook para persistir filtros/paginação na URL, usePreservedContext para preservar contexto ao voltar.

## Contexto
Sprint 03 Phase 4. Rotas atualmente podem ter termos técnicos. Precisa: /processos, /ocorrencias, /documentos, /piquete, /mandados, /detidos, /despachos, /relatorios, /notificacoes.

## Dependências
- TASK-003 (NavigationConfig com rotas)
- TASK-007 (PageToolbar para integração filtros)

## Fora do Escopo
- Router config (Next.js App Router já define)
- Deep linking avançado (básico aqui)

## Requisitos Funcionais
- RF-01: Verificar/criar rotas em português: /processos, /ocorrencias, /documentos, /piquete, /mandados, /detidos, /despachos, /relatorios, /notificacoes, /administracao, /utilizadores, /organizacao
- RF-02: URLs lowercase, sem acentos, sem `_`
- RF-03: `useUrlState` hook para persistir filtros/paginação na URL (search params)
- RF-04: `usePreservedContext` hook para preservar contexto ao voltar (scroll position, expanded rows, etc.)
- RF-05: Separar: route, label, component name, service name

## Requisitos Técnicos
- RT-01: `frontend/src/hooks/use-url-state.ts` - gerencia search params tipados
- RT-02: `frontend/src/hooks/use-preserved-context.ts` - sessionStorage para contexto
- RT-03: Integração com TanStack Query (queryKey inclui URL params)
- RT-04: Typescript types para URL state por feature
- RT-05: Next.js App Router: useSearchParams, useRouter, usePathname

## UX
- Deep linking: compartilhar URL com filtros aplicados
- Back/forward do browser preserva estado
- Refresh preserva filtros
- URL limpa (apenas params necessários)

## RBAC
- Não aplicável diretamente

## Organizational Scope
- URL state pode incluir scope organizacional ativo

## API
- Endpoints aceitam query params para filtros/paginação
- OpenAPI documenta query parameters

## Banco
- Não aplicável

## Testes
- Unitários: Hooks funcionam isoladamente
- Integração: Navegar, refresh, back/forward, deep link
- E2E: Fluxo completo com filtros

## Critérios de Aceitação
- [ ] CA-01: Rotas portuguesas funcionais
- [ ] CA-02: URL state funcional (filtros/paginação na URL)
- [ ] CA-03: Contexto preservado ao voltar
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
- [ ] Commit criado (feat(routing): portuguese routes + url state hooks)

## Arquivos Afetados
- `frontend/src/hooks/use-url-state.ts` (novo)
- `frontend/src/hooks/use-preserved-context.ts` (novo)
- `frontend/src/app/*/page.tsx` (atualizar para usar hooks)

## Riscos
- Risco 1: Serialização complexa de filtros | Mitigação: Zod schemas para URL state, JSON.stringify fallback
- Risco 2: URLs muito longas | Mitigação: Compressão, apenas params essenciais

## Observações
- STARTUP.md secção 116: Rotas frontend amigáveis, português
- STARTUP.md secção 640: URL state quando apropriado

## Estado
DONE