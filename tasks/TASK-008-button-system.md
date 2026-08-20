# TASK-008: Button System

## Objetivo
Criar sistema de botões completo com variantes, tamanhos, AsyncButton, IconButton, ConfirmButton, DestructiveButton.

## Contexto
Sprint 03 Phase 3. shadcn/ui button.tsx é base. Precisa expandir para todas as variantes enterprise.

## Dependências
- TASK-001 (tokens para cores, spacing, motion)
- TASK-009 (status badge - para destructive variant)

## Fora do Escopo
- Form-specific buttons (submit, cancel) — Form Engine (Sprint 04)
- Button groups — se necessário, componente separado

## Requisitos Funcionais
- RF-01: Variantes: primary, secondary, outline, ghost, destructive, link
- RF-02: Tamanhos: xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg
- RF-03: AsyncButton (com loading state interno)
- RF-04: IconButton (apenas ícone, acessível com aria-label)
- RF-05: ConfirmButton (abre ConfirmDialog antes da ação)
- RF-06: DestructiveButton (variant destructive + confirmação)
- RF-07: Suportar: loading, icon (leading/trailing), tooltip, keyboard shortcut

## Requisitos Técnicos
- RT-01: Expandir `frontend/src/components/ui/button.tsx` (shadcn base)
- RT-02: class-variance-authority para variants
- RT-03: AsyncButton: promise-based, loading state visual, disabled durante execução
- RT-04: ConfirmButton: integra com Dialog Engine (Sprint 04) ou sonner confirm
- RT-05: DestructiveButton: variant destructive + ConfirmButton behavior
- RT-06: Tooltip via shadcn/ui tooltip (se disponível) ou custom

## UX
- Feedback visual imediato (hover, active, focus, loading)
- Loading spinner não muda dimensões do botão
- Keyboard shortcut visível no tooltip
- Destructive actions sempre com confirmação

## RBAC
- Buttons podem receber `permission` prop para auto-hide/disable

## Organizational Scope
- Não aplicável diretamente

## API
- Não aplicável

## Banco
- Não aplicável

## Testes
- Unitários: Todas as variantes renderizam, AsyncButton loading, ConfirmButton abre dialog
- Visual: Storybook ou visual regression
- Acessibilidade: keyboard, focus, aria-labels

## Critérios de Aceitação
- [ ] CA-01: Todas as variantes funcionam
- [ ] CA-02: AsyncButton com loading visual
- [ ] CA-03: IconButton acessível
- [ ] CA-04: ConfirmButton abre dialog
- [ ] CA-05: DestructiveButton com confirmação
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
- [ ] Commit criado (feat(button): complete button system)

## Arquivos Afetados
- `frontend/src/components/ui/button.tsx` (expandir)
- `frontend/src/components/ui/async-button.tsx` (novo)
- `frontend/src/components/ui/confirm-button.tsx` (novo)
- `frontend/src/components/ui/icon-button.tsx` (novo, se não existir)

## Riscos
- Risco 1: shadcn base-nova usa render prop | Mitigação: Seguir padrões existentes
- Risco 2: Muitas variantes = bundle size | Mitigação: Tree-shaking, exportar apenas o necessário

## Observações
- shadcn/ui usa `@base-ui/react` (NÃO Radix) — padrão render prop
- STARTUP.md secção 8: Design System consistente

## Estado
DONE