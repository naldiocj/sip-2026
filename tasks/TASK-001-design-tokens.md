# TASK-001: Design Tokens + Typography + Identity SIP

## Objetivo
Centralizar todos os design tokens (cores, tipografia, spacing, motion, density) em `globals.css` eliminando valores hardcoded.

## Contexto
Sprint 03 Phase 1. O Design System deve ter tokens semânticos consistentes para toda a aplicação. Atualmente existem valores hardcoded espalhados.

## Dependências
- Nenhuma (task inicial do Sprint 03)

## Fora do Escopo
- Componentes UI (botões, inputs, etc.) — Task 008
- Configuração de temas (dark/light) — já existe via next-themes

## Requisitos Funcionais
- RF-01: Tokens semânticos para status (success, warning, info, destructive, surface-elevated)
- RF-02: Hierarquia tipográfica completa (Display, PageTitle, SectionTitle, CardTitle, Body, Label, Description, Metadata, Caption)
- RF-03: Motion tokens (duration.fast/normal/slow, easing.standard/emphasized)
- RF-04: Density tokens (comfortable/compact/dense)
- RF-05: Preservar identidade SIP (cores atuais como base)
- RF-06: CSS variables para semantic status colors

## Requisitos Técnicos
- RT-01: Usar `@theme inline` do Tailwind v4 em `globals.css`
- RT-02: Nenhum valor hardcoded restante em componentes (exceto overrides justificados)
- RT-03: Variáveis CSS customizadas para cores semânticas

## UX
- Consistência visual em toda a aplicação
- Suporte a densidade compacta para tabelas densas
- Animações suaves e previsíveis

## RBAC
- Não aplicável (design tokens são transversais)

## Organizational Scope
- Não aplicável

## API
- Não aplicável

## Banco
- Não aplicável

## Testes
- Unitários: Verificar se tokens são exportados corretamente
- Visual: Inspeção manual de componentes usando tokens
- Build: `npm run build` deve passar

## Critérios de Aceitação
- [ ] CA-01: Todos os tokens centralizados em `globals.css`
- [ ] CA-02: Nenhum valor hardcoded restante em componentes UI
- [ ] CA-03: Hierarquia tipográfica funcional
- [ ] CA-04: Motion e density tokens utilizáveis
- [ ] CA-05: `npm run build` passa sem erros

## Definition of Done
- [ ] Código implementado e revisto
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Testes PASS
- [ ] Build PASS
- [ ] Quality Gate verificado
- [ ] Documentação atualizada
- [ ] graphify update . executado
- [ ] Commit criado (feat(design-system): design tokens + typography)

## Arquivos Afetados
- `frontend/src/app/globals.css`

## Riscos
- Risco 1: Quebra de componentes existentes | Mitigação: Testar build após cada mudança
- Risco 2: Conflito com shadcn/ui base-nova | Mitigação: Usar `@theme inline` corretamente

## Observações
- shadcn/ui usa `@base-ui/react` com render prop
- Tailwind v4 é CSS-first, sem `tailwind.config.ts`

## Estado
IMPLEMENTED