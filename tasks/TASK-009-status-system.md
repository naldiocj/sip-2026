# TASK-009: Status System Central

## Objetivo
Criar StatusBadge centralizado mapeando todos os estados do SIP com variants semânticos, labels, ícones e tooltips.

## Contexto
Sprint 03 Phase 3. Estados atualmente espalhados/inconsistentes. Precisa de fonte única para: Recebido, Em análise, Em instrução, Aguardando despacho, Despachado, Concluído, Arquivado, Suspenso, etc.

## Dependências
- TASK-001 (tokens para semantic colors)
- TASK-002 (humanização para labels)

## Fora do Escopo
- Estados de workflow específicos de módulos (extensíveis via config)
- Badges de notificação (separado)

## Requisitos Funcionais
- RF-01: Componente `frontend/src/components/ui/status-badge.tsx`
- RF-02: Mapear estados SIP: Recebido, Em análise, Em instrução, Aguardando despacho, Despachado, Concluído, Arquivado, Suspenso
- RF-03: Cada estado: semantic variant (info/warning/success/destructive), label, ícone opcional, tooltip
- RF-04: Usar em sidebar badges, tabelas, cards, timeline
- RF-05: Extensível para novos estados via config

## Requisitos Técnicos
- RT-01: `status-badge.tsx` com variant baseada em config
- RT-02: Config de status em `frontend/src/lib/status-config.ts` (ou similar)
- RT-03: class-variance-authority para variants
- RT-04: Integração com humanize.ts para labels

## UX
- Cores semânticas consistentes (success=verde, warning=amarelo, info=azul, destructive=vermelho)
- Ícones Lucide opcionais para reforço visual
- Tooltip com descrição detalhada
- Tamanhos: sm, default, lg

## RBAC
- Não aplicável diretamente

## Organizational Scope
- Não aplicável

## API
- Backend retorna status codes; frontend mapeia via StatusBadge

## Banco
- Não aplicável

## Testes
- Unitários: Todos os estados renderizam com variant correta
- Visual: Em tabelas, cards, timeline, sidebar
- Acessibilidade: color contrast, screen reader labels

## Critérios de Aceitação
- [ ] CA-01: Status badges funcionais, semanticamente correctos
- [ ] CA-02: Todos os estados SIP mapeados
- [ ] CA-03: Usado em sidebar, tabelas, cards, timeline
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
- [ ] Commit criado (feat(status): centralized status badge system)

## Arquivos Afetados
- `frontend/src/components/ui/status-badge.tsx` (novo)
- `frontend/src/lib/status-config.ts` (novo)

## Riscos
- Risco 1: Novos estados adicionados pelo backend | Mitigação: Config extensível, fallback para unknown
- Risco 2: Inconsistência com status existentes | Mitigação: Auditoria antes de implementar

## Observações
- STARTUP.md secção 117: Humanização obrigatória
- STARTUP.md secção 108: Não aceitar badges pobres

## Estado
DONE