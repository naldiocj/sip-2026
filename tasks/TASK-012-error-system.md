# TASK-012: Error System

## Objetivo
Criar sistema de erro completo: ErrorState visual, React Error Boundary global, RetryAction, correlation IDs.

## Contexto
Sprint 03 Phase 3. Error handling atualmente básico. Precisa de sistema enterprise com correlation IDs, fallback UI, retry.

## Dependências
- TASK-001 (tokens)
- TASK-008 (Button para RetryAction)
- TASK-011 (EmptyState para error variant)

## Fora do Escopo
- Logging backend (observabilidade)
- Sentry/Monitoring externo (separado)

## Requisitos Funcionais
- RF-01: `frontend/src/components/ui/error-state.tsx` (componente visual)
- RF-02: `frontend/src/components/error-boundary.tsx` (React Error Boundary global)
- RF-03: `frontend/src/components/ui/retry-action.tsx` (botão retry com backoff)
- RF-04: Error correlation: "Não foi possível concluir a operação. Referência: SIP-8F42A"
- RF-05: NUNCA expor stack traces, SQL, UUIDs, erro bruto do backend
- RF-06: Converter para mensagens humanas (STARTUP.md secção 111)

## Requisitos Técnicos
- RT-01: ErrorBoundary wraps App ou layouts principais
- RT-02: ErrorState recebe `error: Error | null`, `correlationId?: string`, `onRetry?: () => void`
- RT-03: RetryAction: exponential backoff, max retries, loading state
- RT-04: Correlation ID gerado no frontend + propagado do backend (header X-Correlation-ID)
- RT-05: Fallback UI amigável, não técnica

## UX
- Error boundary: fallback page com mensagem, correlation ID, botão retry, link suporte
- ErrorState inline: em cards, tabelas, forms
- Toast notifications para erros não-críticos (sonner)
- Mensagens humanas, actionable

## RBAC
- Error messages não vazam info de autorização

## Organizational Scope
- Não aplicável

## API
- Backend retorna error codes + correlation ID
- Frontend mapeia codes para mensagens humanas

## Banco
- Não aplicável

## Testes
- Unitários: ErrorBoundary captura erros, ErrorState renderiza, RetryAction retries
- Integração: Forçar erro (throw), verificar UI
- Visual: Diferentes error types

## Critérios de Aceitação
- [ ] CA-01: ErrorBoundary global funcional
- [ ] CA-02: ErrorState em cada página
- [ ] CA-03: RetryAction funcional com backoff
- [ ] CA-04: Correlation IDs exibidos
- [ ] CA-05: Zero stack traces expostos
- [ ] CA-06: Lint, typecheck, build PASS

## Definition of Done
- [ ] Código implementado e revisto
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Testes PASS
- [ ] Build PASS
- [ ] Quality Gate verificado
- [ ] Documentação atualizada
- [ ] graphify update . executado
- [ ] Commit criado (feat(error): comprehensive error system)

## Arquivos Afetados
- `frontend/src/components/ui/error-state.tsx` (novo)
- `frontend/src/components/error-boundary.tsx` (novo)
- `frontend/src/components/ui/retry-action.tsx` (novo)
- `frontend/src/lib/error-messages.ts` (novo, mapeamento codes → mensagens)

## Riscos
- Risco 1: Error boundary não captura async errors | Mitigação: try/catch em async handlers, report to boundary
- Risco 2: Correlation ID não propagado | Mitigação: Interceptor axios/fetch para header

## Observações
- STARTUP.md secção 111: Nunca mostrar stack trace, SQL, UUID, erro bruto
- STARTUP.md secção 24: Error state obrigatório em toda página

## Estado
DONE