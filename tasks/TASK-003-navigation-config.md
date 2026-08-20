# TASK-003: Navigation Config Data Model

## Objetivo
Criar configuração centralizada de navegação data-driven que alimente Sidebar, Breadcrumb e CommandPalette.

## Contexto
Sprint 03 Phase 1. Atualmente a navegação está hardcoded em múltiplos locais. Precisa de fonte única de verdade tipada com todos os módulos SIP.

## Dependências
- TASK-001 (tokens para ícones/estados)
- TASK-002 (humanização para labels)

## Fora do Escopo
- Implementação da Sidebar (Task 004)
- Implementação do Breadcrumb (Task 006)
- CommandPalette (Sprint 04)

## Requisitos Funcionais
- RF-01: Tipo `NavigationItem { id, label, route, icon, description, roles, permissions, scope, children, badge, featureFlag }`
- RF-02: Config data-driven com todos os módulos SIP (processos, ocorrencias, documentos, peças, mandados, detidos, despachos, relatorios, notificacoes, administracao, utilizadores, organizacao)
- RF-03: Cada item com label português, rota portuguesa, permissão necessária, ícone Lucide
- RF-04: Mesma config alimenta Sidebar, Breadcrumb, CommandPalette
- RF-05: Suporte a nested navigation (children), grupos, badges dinâmicos

## Requisitos Técnicos
- RT-01: `frontend/src/lib/navigation-config.ts` com config exportada
- RT-02: `frontend/src/types/navigation.ts` com tipos TypeScript
- RT-03: Rotas em português, lowercase, sem acentos (`/processos`, `/ocorrencias`, etc.)
- RT-04: Permissões referenciam backend (não hardcoded)

## UX
- Labels humanos em português
- Ícones Lucide consistentes
- Descrições contextuais para tooltips
- Badges com dados reais (não inventados)

## RBAC
- Cada item tem `roles` e `permissions` arrays
- Frontend filtra navegação baseando-se em permissões do backend
- Scope organizacional respeitado

## Organizational Scope
- Itens de navegação podem ter `scope` para restringir por unidade/direção/departamento/secção

## API
- Consumir permissões do backend via endpoint de autorização
- Types gerados do OpenAPI

## Banco
- Não aplicável

## Testes
- Unitários: Tipos TypeScript válidos, config importável
- Integração: Sidebar filtra corretamente por permissões mockadas

## Critérios de Aceitação
- [ ] CA-01: Config central tipada com todos os módulos do roadmap
- [ ] CA-02: Typecheck PASS
- [ ] CA-03: Import funciona em sidebar, breadcrumb, command palette
- [ ] CA-04: Labels em português, rotas portuguesas
- [ ] CA-04: Permissões e roles referenciam backend

## Definition of Done
- [ ] Código implementado e revisto
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Testes PASS
- [ ] Build PASS
- [ ] Quality Gate verificado
- [ ] Documentação atualizada
- [ ] graphify update . executado
- [ ] Commit criado (feat(navigation): centralized navigation config)

## Arquivos Afetados
- `frontend/src/lib/navigation-config.ts` (novo)
- `frontend/src/types/navigation.ts` (novo)

## Riscos
- Risco 1: Backend adiciona novos módulos | Mitigação: Config extensível, feature flags
- Risco 2: Permissões mudam | Mitigação: Consumir do backend, não hardcoded

## Observações
- Regra absoluta: NÃO adicionar Search na Sidebar (STARTUP.md secção 10)
- NavigationConfig é fonte única para Sidebar, Breadcrumb, CommandPalette

## Estado
DONE