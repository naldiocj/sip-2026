# TASK-005: Header Enterprise

## Objetivo
Refatorar Header para usar NavigationConfig com notification bell, user menu completo, organization context, system status indicator.

## Contexto
Sprint 03 Phase 2. Header atual é básico. Precisa ser enterprise-grade com todas as funcionalidades de header profissional.

## Dependências
- TASK-003 (NavigationConfig para user menu items)
- TASK-001 (tokens)
- TASK-002 (humanização, getInitials centralizado)

## Fora do Escopo
- Sidebar (Task 004)
- Breadcrumb (Task 006)
- Notification Center completo (Sprint 04)

## Requisitos Funcionais
- RF-01: Usar NavigationConfig para itens do user menu
- RF-02: Notification bell com counter real (do backend)
- RF-03: User menu completo (perfil, configurações, logout, switch organization)
- RF-04: Organization context (nome da organização/direção/departamento/secção ativa)
- RF-05: System status indicator (online/offline/degraded)
- RF-06: Header limpo e funcional

## Requisitos Técnicos
- RT-01: Refatorar `frontend/src/components/layout/header.tsx`
- RT-02: shadcn/ui DropdownMenu para user menu e notificações
- RT-03: getInitials() do humanize.ts centralizado
- RT-04: WebSocket ou polling para notification counter (conforme decisão arquitetural)
- RT-05: Responsive: compacto em mobile

## UX
- Header limpo, não cluttered
- Notification bell com badge count
- User menu com avatar (iniciais), nome, perfil, organização
- Organization context visível
- System status discreto mas visível

## RBAC
- User menu items filtrados por permissões
- Organization switch respeita scope do utilizador

## Organizational Scope
- Mostrar contexto organizacional atual (unidade/direção/departamento/secção)
- Permitir switch se utilizador tem múltiplas atribuições

## API
- GET /api/v1/auth/me (perfil, permissões, organização)
- GET /api/v1/notifications/unread-count
- WebSocket/polling para real-time

## Banco
- Não aplicável

## Testes
- Unitários: Renderização com diferentes estados, user menu items
- Integração: Notification counter, organization switch
- Visual: Desktop + mobile, keyboard navigation

## Critérios de Aceitação
- [ ] CA-01: Header com notificações, user menu, context info
- [ ] CA-02: Notification counter real (não mockado)
- [ ] CA-03: Organization context exibido corretamente
- [ ] CA-04: System status indicator funcional
- [ ] CA-05: Lint, typecheck, build PASS

## Definition of Done
- [ ] Código implementado e revisto
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] Testes PASS
- [ ] Build PASS
- [ ] Quality Gate verificado
- [ ] Documentação atualizada
- [ ] graphify update . executado
- [ ] Commit criado (feat(header): enterprise header with notifications)

## Arquivos Afetados
- `frontend/src/components/layout/header.tsx`
- `frontend/src/components/layout/user-menu.tsx` (novo, se necessário)
- `frontend/src/components/layout/notification-bell.tsx` (novo, se necessário)

## Riscos
- Risco 1: Dropdown positioning (top-left bug) | Mitigação: Testar Portal, Anchor, Collision, Viewport boundaries
- Risco 2: WebSocket não decidido | Mitigação: Polling fallback, decisão arquitetural em ADR
- Risco 3: Performance de re-renders | Mitigação: React.memo, seletores granulares

## Observações
- Dropdowns devem estar corretamente posicionados (STARTUP.md secção 22)
- Testar em Desktop, Tablet, Mobile

## Estado
DONE