# TASK-004: Sidebar Enterprise

## Objetivo
Refatorar Sidebar para usar NavigationConfig com suporte a estados expanded/collapsed/icon-only, nested navigation, mobile drawer, persistência de preferência.

## Contexto
Sprint 03 Phase 2. Sidebar atual é básica. Precisa ser enterprise-grade com todas as funcionalidades de navegação profissional.

## Dependências
- TASK-003 (NavigationConfig)
- TASK-001 (tokens para cores, spacing, motion)
- TASK-002 (humanização para labels)

## Fora do Escopo
- Search na Sidebar (REGRA ABSOLUTA: NÃO adicionar)
- Header (Task 005)
- Breadcrumb (Task 006)

## Requisitos Funcionais
- RF-01: Usar NavigationConfig como fonte de dados
- RF-02: Estados: expanded, collapsed, icon-only, tooltips
- RF-03: Nested navigation com grupos e submenus
- RF-04: Badges com dados reais (não inventar números)
- RF-05: Active state, hover, focus, keyboard navigation completo
- RF-06: Responsive: mobile drawer via Sheet
- RF-07: Animações de transição collapsed/expanded
- RF-08: Persistência da preferência (cookie ou localStorage)
- RF-09: Rail para collapsed state
- RF-10: Permission-filtered (ocultar itens sem autorização)

## Requisitos Técnicos
- RT-01: Refatorar `frontend/src/components/layout/sidebar.tsx`
- RT-02: Usar shadcn/ui Sheet para mobile drawer
- RT-03: Lucide icons da NavigationConfig
- RT-04: CSS transitions suaves (motion tokens)
- RT-05: Cookie/localStorage para persistência

## UX
- Sidebar profissional, não menu CRUD simples
- Agrupamento visual claro
- Tooltips informativos no estado collapsed
- Transições suaves (200-300ms)
- Mobile-first responsive

## RBAC
- Filtrar itens baseando-se em `roles` e `permissions` da NavigationConfig
- Consultar backend para permissões atuais do utilizador
- Respeitar `scope` organizacional

## Organizational Scope
- Itens com `scope` só visíveis se utilizador pertence ao scope

## API
- Endpoint de permissões do utilizador logado
- Types do OpenAPI

## Banco
- Não aplicável

## Testes
- Unitários: Renderização com diferentes configs, filtering por permissões
- Integração: Estados expanded/collapsed, mobile drawer, persistência
- Visual: Desktop + mobile, keyboard navigation

## Critérios de Aceitação
- [ ] CA-01: Sidebar funciona em todos os estados (expanded/collapsed/icon-only/mobile)
- [ ] CA-02: Permission-filtered correctamente
- [ ] CA-03: Nested navigation funcional
- [ ] CA-04: Persistência de preferência funciona
- [ ] CA-05: Mobile drawer via Sheet
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
- [ ] Commit criado (feat(sidebar): enterprise sidebar with navigation config)

## Arquivos Afetados
- `frontend/src/components/layout/sidebar.tsx`
- `frontend/src/components/ui/sidebar-rail.tsx` (novo, se necessário)
- `frontend/src/hooks/use-sidebar.ts` (novo, se necessário)

## Riscos
- Risco 1: shadcn/ui base-nova API diferente | Mitigação: Estudar padrões render prop
- Risco 2: Performance com muitos itens | Mitigação: Virtualização se >50 itens
- Risco 3: Conflito z-index com Header | Mitigação: Coordenar com Task 005

## Observações
- NÃO adicionar Search na Sidebar (regra absoluta)
- Active state alinhado à identidade visual SIP

## Estado
DONE