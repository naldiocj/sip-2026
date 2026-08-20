# TASK-015: Enterprise Dialog Engine

## Objetivo
Criar Dialog Engine enterprise com sizes (xs → full), responsive, animations, sticky header/footer, focus management, base para variants.

## Contexto
Sprint 04 Phase 1. O dialog.tsx base já existe usando @base-ui/react/dialog. Precisa evoluir para enterprise-grade com sizes, responsive, sticky header/footer, animations, focus management.

## Dependências
- TASK-008 (Button System) - DONE
- TASK-009 (Status System) - DONE
- Sprint 03 core-components - DONE

## Fora do Escopo
- Dialog variants (ConfirmDialog, FormDialog, etc.) — Task 016
- Drawer Engine — Task 017
- Command Palette — Task 023

## Requisitos Funcionais
- RF-01: Size variants: xs, sm, md, lg, xl, full (fullscreen)
- RF-02: Responsive: mobile-first, adapta ao viewport
- RF-03: Sticky header/footer opcional
- RF-04: Animations: enter/exit, backdrop fade, slide
- RF-05: Focus management: trap, restore, initial focus
- RF-06: Close on Escape, backdrop click (configurável)
- RF-07: Scroll lock no body quando aberto
- RF-08: Nested dialogs support
- RF-09: Acessibilidade: ARIA, focus trap, screen reader

## Requisitos Técnicos
- RT-01: Estender dialog.tsx existente (@base-ui/react/dialog)
- RT-02: Usar cva para size variants
- RT-03: CSS variables para sizes (--dialog-width-xs, etc.)
- RT-05: Focus trap usando @base-ui/react primitives
- RT-06: Portal para renderização

## UX
- Tamanhos consistentes: xs(320px), sm(480px), md(640px), lg(800px), xl(1024px), full(100vw)
- Header sticky quando conteúdo longo
- Footer sticky com actions
- Backdrop blur + fade
- Slide from center + fade
- Mobile: full width, bottom sheet style para full

## RBAC
- Não aplicável diretamente

## Organizational Scope
- Não aplicável

## API
- Não aplicável diretamente

## Banco
- Não aplicável

## Testes
- Unitários: sizes, focus trap, close handlers, nested
- Integração: nested dialogs, focus restore
- Visual: sizes, responsive, animations

## Critérios de Aceitação
- [ ] CA-01: Todos os sizes funcionam
- [ ] CA-02: Responsive no mobile
- [ ] CA-03: Sticky header/footer opcional
- [ ] CA-04: Focus trap funciona
- [ ] CA-04: Escape/backdrop close funciona
- [ ] CA-05: Nested dialogs funcionam
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
- [ ] Commit criado (feat(dialog): enterprise dialog engine)

## Arquivos Afetados
- `frontend/src/components/ui/dialog.tsx` (expandir)
- `frontend/src/components/ui/dialog-hooks.ts` (novo, hooks)
- `frontend/src/components/ui/dialog-context.tsx` (novo, context)

## Riscos
- Risco 1: @base-ui/react API diferente de Radix | Mitigação: Seguir padrões existentes
- Risco 2: Focus trap complexo | Mitigação: Usar primitives @base-ui/react

## Observações
- Reutilizar DialogPrimitive do @base-ui/react
- Manter API compatível com shadcn/ui base-nova

## Estado
DONE