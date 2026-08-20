# Plano de Execução: STARTUP.md (SIP Master Prompt)

## Estado Atual Normalizado

| Sprint STARTUP.md | Estado | Tasks | Notas |
|-------------------|--------|-------|-------|
| SPRINT 00 — Bootstrap + Architecture | ✅ DONE | — | Infra, CI, Alembic, Docker, testes base |
| SPRINT 01 — Foundation + Design System + App Shell | ⚠️ PARCIAL | App Shell funcional; Design Tokens enterprise incompletos | Coberto por `docs/sprints/SPRINT-03-design-system.md` (PLANNED) |
| SPRINT 02 — Gestão de Utilizadores | ✅ DONE | 15/15 | `prompts/tasks/sprint-02-users/` |
| SPRINT 03 — Gestão da Organização | 🔄 27/30 | TASK-028 e2e-tests, TASK-030 final-review pendentes | Implementado em `prompts/tasks/sprint-02/` (numeração legada) |
| SPRINT 04 — Notificações + Comunicação Transversal | ⏳ PENDING | — | Corresponde a `docs/sprints/SPRINT-04-advanced-components.md` (parcialmente) |
| SPRINT 05 — Form Builder Foundation | ⏳ PENDING | — | Corresponde a `docs/sprints/SPRINT-05-data-layer-tables.md` (frontend infra) + Form Builder spec |
| SPRINT 06+ | ⏳ PENDING | — | Conforme STARTUP.md |

## Decisão de Normalização

**Fonte de verdade para numeração de sprints: `STARTUP.md`.**

A partir daqui:
- Pastas `prompts/tasks/sprint-02-users/` → SPRINT 02
- Pastas `prompts/tasks/sprint-02/` → SPRINT 03 (Gestão da Organização)
- `docs/sprints/SPRINT-03-design-system.md` → SPRINT 01 complementar
- `docs/sprints/SPRINT-04-advanced-components.md` → SPRINT 04
- `docs/sprints/SPRINT-05-data-layer-tables.md` → SPRINT 05

## Sequência de Execução

### Fase A — Fechar SPRINT 03 (Gestão da Organização)
**Duração estimada:** 1–2 sprints de implementação curta.

Tarefas pendentes:
1. **TASK-028 — e2e-tests**: Avaliar se Playwright deve ser adicionado ou se a cobertura E2E atual (pytest integration + frontend vitest) é suficiente. Se Playwright: instalar, configurar, escrever 3–5 fluxos críticos (login, criação de unidade, atribuição, árvore organizacional).
2. **TASK-030 — final-review**: Security review final, revisão de permissões, validação de todos os critérios de aceitação da sprint, atualização de ADRs se necessário, commit final.

**Critério de saída:** SPRINT 03 marcada como DONE em `docs/sprints/SPRINT-02.md` (renomear/migrar para `SPRINT-03.md`).

### Fase B — Executar SPRINT 04 (Notificações + Comunicação Transversal)

**Objetivo:** Implementar Notification Center como capacidade transversal.

**Tarefas propostas:**

| ID | Task | Descrição |
|----|------|-----------|
| TASK-031 | notification-domain | Modelo de domínio: Notification, NotificationType, NotificationPriority, NotificationPreference. Backend module `notifications` com domain/application/infrastructure/api. |
| TASK-032 | notification-api | Endpoints REST: list, mark-read, mark-all-read, preferences, delete. Integração com RabbitMQ para eventos assíncronos. |
| TASK-033 | notification-seed | Seed de tipos de notificação: nova tarefa, novo despacho, prazo próximo, documento recebido, processo devolvido, solicitação PGR, alteração de estado. |
| TASK-034 | notification-frontend-data | Hooks TanStack Query: useNotifications, useUnreadCount, useMarkAsReadMutation. Integração com sidebar badge. |
| TASK-035 | notification-ui | NotificationCenter component, NotificationList, NotificationItem, NotificationPreferences. Inbox com filtros (todas/não lidas/por tipo). |
| TASK-036 | notification-sidebar | Badge no sidebar, dropdown de notificações recentes, deep links para recurso relacionado. |
| TASK-037 | notification-tests | Backend: API tests, domain tests. Frontend: component tests, hook tests. |
| TASK-038 | notification-docs | Documentação da API, ADR se necessário, atualização do ROADMAP. |

**Critérios de aceitação:**
- Backend emite eventos RabbitMQ para ações relevantes (processo criado, despacho emitido, prazo atribuído, documento recebido).
- NotificationCenter lista notificações com paginação server-side.
- Badge no sidebar reflete contagem de não lidas em tempo real (polling ou WebSocket).
- Deep link navega para o recurso relacionado.
- Preferências de notificação por tipo e por utilizador.
- Notificações expiram conforme configuração.
- Backend valida ownership/scope antes de entregar notificação.

### Fase C — Preparar SPRINT 05 (Form Builder Foundation)

STARTUP.md exige um motor documental profissional. SPRINT 05 é a fundação.

**Tarefas propostas:**

| ID | Task | Descrição |
|----|------|-----------|
| TASK-039 | document-registry | Domain models: DocumentTemplate, DocumentTemplateVersion, DocumentInstance, AssetReference. Backend module `documents`. |
| TASK-040 | template-schema | Definir JSON Schema oficial para templates documentais. Validação Pydantic. |
| TASK-041 | component-registry | Backend: registro de tipos de componente, schema, propriedades, validadores, renderers. |
| TASK-042 | asset-registry | Integração MinIO para upload de brasões, logotipos, assinaturas, carimbos. Endpoints de asset. |
| TASK-043 | field-registry | Tipos de campo base: text, number, date, select, multiselect, entity-reference. Schema e validação. |
| TASK-044 | binding-system | Engine de bindings: `{{processo.numero}}`, `{{organizacao.nome}}`. Resolução de contexto. |
| TASK-045 | form-builder-canvas | Frontend: Canvas A4, rulers, grid, snap, propriedades. Esqueleto do editor. |
| TASK-046 | component-library | Biblioteca de componentes básicos: TEXT, HEADING, PARAGRAPH, SPACER, LINE, CONTAINER, SECTION. |
| TASK-047 | form-builder-ux | Field Picker, Component Library panel, Properties Panel, Preview, Validation. |
| TASK-048 | renderer-foundation | Preview Renderer (React) e PDF Renderer base (estrutura). Sem still fidelidade total. |
| TASK-049 | form-builder-tests | Backend + Frontend tests. |

## Validação Contínua

Para cada sprint:
1. `make test` — Backend + Frontend tests passing
2. `make lint` — ruff + eslint sem erros
3. `make typecheck` — mypy + tsc sem erros
4. `make build` — Docker build OK
5. Backend: migrations Alembic aplicáveis
6. Frontend: rotas protegidas respeitam RBAC
7. Segurança: nenhum segredo hardcoded, CORS configurado, rate limiting ativo
8. Documentação: ADRs atualizados, docs/sprints atualizados

## Riscos e Mitigações

| Risco | Mitigação |
|--------|-----------|
| Numeração de sprints inconsistente | Normalizar docs/sprints/ e prompts/tasks/ para STARTUP.md após conclusão de cada sprint |
| Notificações dependem de RabbitMQ não utilizado | Utilizar publisher/subscriber in-process primeiro; migrar para RabbitMQ quando necessário |
| Form Builder muito ambicioso | YAGNI: implementar apenas componentes básicos + 1 template real (ex: Despacho) na SPRINT 05 |
| Frontend App Shell já existe mas não é "enterprise" | Não refatorar código funcionando; melhorar incrementalmente conforme necessário |

## Arquivos de Referência

- `STARTUP.md` — Roadmap master e regras de engenharia
- `ROADMAP.md` — Fases 00–16
- `AGENTS.md` — Regras de execução obrigatórias
- `docs/sprints/SPRINT-02.md` — Status actual da sprint de organização
- `prompts/tasks/sprint-02/` — Tasks de organização (a migrar para SPRINT 03)
- `docs/adr/` — ADRs existentes
- `graphify-out/` — Knowledge graph do codebase

## Próxima Ação Imediata

1. Fechar SPRINT 03: executar TASK-028 (e2e-tests) e TASK-030 (final-review).
2. Iniciar SPRINT 04: TASK-031 (notification-domain).
