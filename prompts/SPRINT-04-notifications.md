Sim. O próximo passo é a **SPRINT 04 — Notificações e Eventos do SIP**.

Esta Sprint deve vir agora porque vários módulos futuros — processos, documentos, despacho, distribuição, prazos, atribuições e PGR — precisarão de um mecanismo central para comunicar eventos aos utilizadores. O ideal é construí-lo **antes dos módulos de negócio que vão gerar essas notificações**, mas sem criar dependência circular.

Vou manter a mesma regra: **Tasks → implementação → testes → commit → checkpoint → documentação → parar no fim da Sprint**.

# PROMPT 04 — NOTIFICAÇÕES E EVENTOS

```text
====================================================================
SIP — PROMPT 04
SPRINT 04 — NOTIFICAÇÕES, EVENTOS E CENTRAL DE ALERTAS
====================================================================

PROJECT:
SIP — Sistema de Instrução Processual

SPRINT:
SPRINT-04

TITLE:
Notificações, Eventos, Alertas e Centro de Notificações

STATUS:
PLANNED

====================================================================
1. MISSÃO
====================================================================

Implementar uma infraestrutura central de:

- eventos;
- notificações;
- alertas;
- notificações internas;
- preferências de notificação;
- leitura/não leitura;
- prioridade;
- expiração;
- histórico;
- entrega assíncrona.

Esta infraestrutura será utilizada futuramente por:

- Gestão de Utilizadores;
- Gestão de Pessoas;
- Gestão da Estrutura Organizacional;
- Form Builder;
- Documentos;
- Participações;
- Autos;
- Processos;
- Distribuição de Processos;
- Despachos;
- Mandados;
- BRP;
- PGR;
- Prazos;
- Auditoria;
- Relatórios.

====================================================================
2. PRINCÍPIO FUNDAMENTAL
====================================================================

NOTIFICAÇÃO ≠ EVENTO

EVENTO:
algo aconteceu no sistema.

NOTIFICAÇÃO:
uma mensagem criada para informar um ou mais utilizadores sobre
determinado evento.

Exemplo:

EVENTO:
PROCESSO_DISTRIBUIDO

NOTIFICAÇÃO:
"O processo SIP/001/2026 foi distribuído ao Instrutor João Manuel."

====================================================================
3. ARQUITECTURA
====================================================================

Implementar:

Domain Event
      ↓
Event Bus
      ↓
Event Handler
      ↓
Notification Service
      ↓
Notification
      ↓
Delivery
      ↓
Frontend / canais futuros

A arquitectura deve ser modular.

NÃO implementar microservices.

O sistema continuará a ser um:

MODULAR MONOLITH

====================================================================
4. EVENT BUS
====================================================================

Criar uma abstração:

EventBus

Permitir:

publish(event)
subscribe(handler)
dispatch(event)

O domínio não deve depender directamente de RabbitMQ.

Exemplo:

ProcessService
      ↓
EventBus
      ↓
ProcessAssignedEvent
      ↓
NotificationHandler

====================================================================
5. RABBITMQ
====================================================================

Utilizar RabbitMQ apenas para processamento assíncrono quando necessário.

Não transformar todos os eventos em mensagens RabbitMQ.

Eventos simples e internos podem ser processados localmente.

RabbitMQ deve ser utilizado principalmente para:

- notificações assíncronas;
- processamento pesado;
- integração futura;
- tarefas que não devem bloquear a request HTTP.

====================================================================
6. REDIS
====================================================================

Utilizar Redis apenas quando houver benefício real.

Possíveis utilizações:

- contadores;
- cache de unread count;
- throttling;
- deduplicação;
- locks temporários.

Não transformar Redis na fonte de verdade.

PostgreSQL continua sendo a fonte oficial das notificações.

====================================================================
7. EVENTO
====================================================================

Criar modelo conceptual:

DomainEvent

Campos:

id
event_type
aggregate_type
aggregate_id
actor_user_id
occurred_at
payload
metadata
correlation_id

====================================================================
8. EVENT TYPE
====================================================================

Criar catálogo extensível.

Exemplos:

USER_CREATED
USER_UPDATED
USER_ACTIVATED
USER_DEACTIVATED

PERSON_CREATED
PERSON_UPDATED

ASSIGNMENT_CREATED
ASSIGNMENT_ENDED

RESPONSIBILITY_ASSIGNED
RESPONSIBILITY_ENDED

DELEGATION_CREATED
DELEGATION_ENDED

SUBSTITUTION_CREATED
SUBSTITUTION_ENDED

Não criar uma enum rígida que impeça expansão futura.

====================================================================
9. FUTUROS EVENTOS
====================================================================

Preparar para:

DOCUMENT_CREATED
DOCUMENT_PUBLISHED
DOCUMENT_SIGNED

PROCESS_CREATED
PROCESS_ASSIGNED
PROCESS_REASSIGNED
PROCESS_RECEIVED
PROCESS_STATUS_CHANGED

DEADLINE_CREATED
DEADLINE_APPROACHING
DEADLINE_EXPIRED

DISPATCH_CREATED
DISPATCH_COMPLETED

MANDATE_CREATED
MANDATE_EXPIRED

PGR_RECEIVED
PGR_RESPONSE_REQUIRED

Nesta Sprint não implementar os módulos acima.

====================================================================
10. NOTIFICATION
====================================================================

Criar:

Notification

Campos:

id
recipient_user_id
event_id
type
title
message
priority
status
read_at
created_at
expires_at
metadata

====================================================================
11. STATUS
====================================================================

Estados:

UNREAD
READ
ARCHIVED
EXPIRED

Não apagar notificações automaticamente.

====================================================================
12. PRIORIDADE
====================================================================

Suportar:

LOW
NORMAL
HIGH
URGENT

Labels humanizados:

Baixa
Normal
Alta
Urgente

====================================================================
13. TIPOS DE NOTIFICAÇÃO
====================================================================

Criar tipos:

INFO
SUCCESS
WARNING
ERROR
ACTION_REQUIRED
DEADLINE
SYSTEM

====================================================================
14. NOTIFICAÇÕES DE ACÇÃO
====================================================================

Uma notificação pode exigir uma acção.

Exemplo:

"Foi-lhe atribuído o Processo SIP/001/2026."

A notificação deve poder conter:

action_url
action_type
action_label

Exemplo:

Abrir processo

O backend deve controlar autorização.

Não confiar apenas na URL.

====================================================================
15. DEEP LINK
====================================================================

Suportar:

action_url

Exemplo:

/processos/123

ou futuramente:

/documentos/456

O frontend deve verificar autorização antes de abrir o recurso.

====================================================================
16. NOTIFICAÇÕES EM LOTE
====================================================================

Permitir criar notificações para:

- utilizador;
- grupo;
- unidade;
- função;
- responsabilidade.

Não criar milhares de notificações individualmente se o sistema puder
processar a distribuição de forma eficiente.

====================================================================
17. DESTINATÁRIOS
====================================================================

Criar conceito:

NotificationRecipient

Tipos:

USER
ROLE
ORGANIZATIONAL_UNIT
RESPONSIBILITY

O mecanismo deve resolver os destinatários para utilizadores concretos.

====================================================================
18. RESOLUÇÃO DE DESTINATÁRIOS
====================================================================

Criar:

RecipientResolver

Exemplo:

PROCESS_ASSIGNED

destinatário:

instrutor responsável

Outro exemplo:

DOCUMENT_APPROVAL_REQUIRED

destinatário:

responsável pela aprovação.

A resolução deve respeitar:

- perfil;
- unidade;
- responsabilidade;
- atribuição;
- substituição;
- delegação.

====================================================================
19. RESPONSABILIDADE EFECTIVA
====================================================================

Reutilizar:

EffectiveResponsibilityService

Não duplicar a lógica da SPRINT-03.

Exemplo:

Responsável principal está ausente.

Existe substituto válido.

A notificação deve poder ser enviada ao responsável efectivo,
conforme a regra do evento.

====================================================================
20. DEDUPLICAÇÃO
====================================================================

Evitar notificações duplicadas.

Criar mecanismo baseado em:

event_id
recipient_user_id
notification_type

Quando aplicável.

====================================================================
21. IDEMPOTÊNCIA
====================================================================

Handlers devem ser idempotentes.

Se um evento for processado duas vezes:

não criar duas notificações iguais.

====================================================================
22. NOTIFICAÇÃO IN-APP
====================================================================

Implementar inicialmente apenas:

NOTIFICAÇÕES INTERNAS

Não implementar nesta Sprint:

SMS
WhatsApp
Email externo
Push mobile

A arquitectura deve permitir adicionar esses canais futuramente.

====================================================================
23. DELIVERY CHANNEL
====================================================================

Criar abstracção:

NotificationChannel

Implementação inicial:

InAppNotificationChannel

Futuro:

EmailNotificationChannel
SmsNotificationChannel
PushNotificationChannel

Não implementar os canais futuros agora.

====================================================================
24. CENTRO DE NOTIFICAÇÕES
====================================================================

Frontend:

/notificacoes

Criar interface profissional.

Mostrar:

- todas;
- não lidas;
- importantes;
- acções pendentes.

====================================================================
25. NOTIFICATION BELL
====================================================================

Adicionar ao App Header:

ícone de notificações.

Utilizar:

Lucide React.

Não utilizar SVG manual.

Mostrar:

badge com quantidade de não lidas.

Exemplo:

🔔 5

====================================================================
26. DROPDOWN DE NOTIFICAÇÕES
====================================================================

Ao clicar:

mostrar últimas notificações.

Cada item:

ícone
título
mensagem
data relativa
prioridade
estado

Exemplo:

"há 5 minutos"

====================================================================
27. AÇÕES
====================================================================

Permitir:

Marcar como lida
Marcar como não lida
Arquivar
Abrir recurso
Marcar todas como lidas

====================================================================
28. MARCAR TODAS
====================================================================

Criar:

POST /api/v1/notifications/read-all

Deve ser eficiente.

Não fazer N requests.

====================================================================
29. CONTAGEM
====================================================================

Criar:

GET /api/v1/notifications/unread-count

Retornar:

{
  "count": 5
}

Não retornar notificações completas.

====================================================================
30. LISTAGEM
====================================================================

Criar:

GET /api/v1/notifications

Suportar:

page
page_size
status
priority
type
date_from
date_to

====================================================================
31. DETALHE
====================================================================

Criar:

GET /api/v1/notifications/{id}

Validar que o utilizador é o destinatário autorizado.

Nunca permitir consultar notificação de outro utilizador.

====================================================================
32. READ
====================================================================

Criar:

POST /api/v1/notifications/{id}/read

====================================================================
33. UNREAD
====================================================================

Criar:

POST /api/v1/notifications/{id}/unread

====================================================================
34. ARCHIVE
====================================================================

Criar:

POST /api/v1/notifications/{id}/archive

====================================================================
35. PREFERÊNCIAS
====================================================================

Criar:

NotificationPreference

Campos:

id
user_id
notification_type
enabled
created_at
updated_at

Permitir ao utilizador controlar notificações não críticas.

====================================================================
36. NOTIFICAÇÕES CRÍTICAS
====================================================================

Algumas notificações não podem ser simplesmente desactivadas.

Exemplo futuro:

prazo processual crítico.

O sistema deve permitir:

mandatory = true

Nesses casos:

não permitir desactivar através das preferências.

====================================================================
37. PREFERÊNCIAS — FRONTEND
====================================================================

Criar:

/notificacoes/preferencias

Tabela:

Tipo
Descrição
Estado

Utilizar switches.

Mostrar claramente quando uma notificação é obrigatória.

====================================================================
38. EVENT LOG
====================================================================

Criar histórico de eventos processados.

Campos:

id
event_id
handler
status
processed_at
error
retry_count

Não expor detalhes internos ao utilizador normal.

====================================================================
39. EVENT PROCESSING
====================================================================

Estados:

PENDING
PROCESSING
PROCESSED
FAILED

Permitir retry.

====================================================================
40. RETRY
====================================================================

Para eventos assíncronos:

retry_count

backoff controlado.

Não fazer loops infinitos.

Após limite:

FAILED

e registar erro.

====================================================================
41. DEAD LETTER
====================================================================

Preparar RabbitMQ para Dead Letter Queue.

Não implementar dashboard complexo nesta Sprint.

====================================================================
42. TRANSAÇÃO
====================================================================

Garantir consistência entre:

evento de domínio
e
persistência necessária.

Evitar publicar eventos que depois sejam perdidos por rollback.

Avaliar:

Transactional Outbox

Implementar Outbox quando necessário para garantir confiabilidade.

====================================================================
43. OUTBOX
====================================================================

Criar:

OutboxEvent

Campos:

id
event_type
aggregate_type
aggregate_id
payload
status
created_at
published_at
retry_count

Fluxo:

Database Transaction
        ↓
Outbox
        ↓
Publisher
        ↓
Event Bus / RabbitMQ
        ↓
Handler

====================================================================
44. REGRA DA OUTBOX
====================================================================

Não utilizar RabbitMQ como fonte de verdade.

PostgreSQL:

fonte de verdade.

RabbitMQ:

transporte/processamento.

====================================================================
45. WORKER
====================================================================

Criar worker para processamento assíncrono.

Respeitar arquitectura existente do projecto.

Não criar microservice.

O worker deve ser parte do mesmo backend modular.

====================================================================
46. FASTAPI
====================================================================

Utilizar:

Python
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL
RabbitMQ
Redis

Não adicionar novas tecnologias sem necessidade.

====================================================================
47. FRONTEND
====================================================================

Utilizar:

Next.js
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
TanStack Query
TanStack Table

====================================================================
48. POLLING
====================================================================

Como não será utilizado WebSocket:

implementar inicialmente polling inteligente para unread count.

Não fazer polling agressivo.

Exemplo:

intervalo configurável.

Reduzir/pausar polling quando:

- browser está em background;
- utilizador está inactivo;
- aplicação não está visível.

====================================================================
49. NÃO UTILIZAR WEBSOCKET
====================================================================

Não implementar:

WebSocket
Socket.IO
SSE

Nesta Sprint.

A arquitectura deve permitir evolução futura sem dependência.

====================================================================
50. QUERY CACHE
====================================================================

TanStack Query:

notifications
unread-count
notification-preferences

Após:

read
unread
archive
read-all

invalidar queries apropriadas.

====================================================================
51. UI — NOTIFICAÇÃO
====================================================================

Criar componente reutilizável:

NotificationItem

Propriedades:

title
message
type
priority
createdAt
read
action

====================================================================
52. UI — EMPTY STATE
====================================================================

Quando não existirem notificações:

"Nenhuma notificação"

Não apresentar tabelas vazias sem contexto.

====================================================================
53. UI — LOADING
====================================================================

Utilizar skeleton.

Não bloquear toda a aplicação enquanto o centro de notificações carrega.

====================================================================
54. UI — PRIORIDADE
====================================================================

Usar:

Badge
Icon
Tooltip

Evitar excesso de cores.

A prioridade deve ser visualmente clara mas profissional.

====================================================================
55. HUMANIZAÇÃO
====================================================================

Nunca apresentar:

ACTION_REQUIRED
UNREAD
NOTIFICATION_TYPE
HIGH

Apresentar:

Acção necessária
Não lida
Tipo de notificação
Alta

====================================================================
56. SEGURANÇA
====================================================================

Um utilizador só pode:

consultar as próprias notificações;
alterar o estado das próprias notificações;
alterar as próprias preferências.

Administrador não deve automaticamente poder ler notificações pessoais
sem uma permissão explícita para isso.

====================================================================
57. PRIVACIDADE
====================================================================

Notificações podem conter informação processual sensível.

Não colocar dados excessivos no:

title
message

Preferir:

"Novo processo atribuído"

em vez de colocar informação processual desnecessária.

Detalhes devem estar no recurso protegido.

====================================================================
58. AUDITORIA
====================================================================

Registar:

NOTIFICATION_CREATED
NOTIFICATION_READ
NOTIFICATION_UNREAD
NOTIFICATION_ARCHIVED
NOTIFICATION_PREFERENCE_CHANGED

Não guardar conteúdo excessivamente sensível na auditoria.

====================================================================
59. DATABASE
====================================================================

Criar migrations:

domain_events
outbox_events
notifications
notification_preferences
event_processing_logs

Adaptar nomes às convenções existentes.

====================================================================
60. ÍNDICES
====================================================================

Criar índices adequados para:

recipient_user_id
status
created_at
priority
event_type
notification_type

Especial atenção a:

recipient_user_id + status

para unread count.

====================================================================
61. API DOCUMENTATION
====================================================================

Todos os endpoints devem aparecer correctamente no OpenAPI.

Adicionar schemas de:

Notification
NotificationList
UnreadCount
NotificationPreference
DomainEvent

====================================================================
62. TESTES UNITÁRIOS
====================================================================

Testar:

EventBus
EventHandler
NotificationService
RecipientResolver
NotificationPreferenceService
OutboxService
NotificationDeduplication

====================================================================
63. TESTES DE SEGURANÇA
====================================================================

Testar:

utilizador A não pode ler notificação do utilizador B.

Utilizador A não pode marcar como lida notificação do utilizador B.

Utilizador A não pode alterar preferência do utilizador B.

====================================================================
64. TESTES DE IDEMPOTÊNCIA
====================================================================

Publicar o mesmo evento duas vezes.

Resultado:

não duplicar notificações.

====================================================================
65. TESTES DE OUTBOX
====================================================================

Testar:

transaction commit
transaction rollback
publish
retry
failure
duplicate processing

====================================================================
66. TESTES DE PREFERÊNCIAS
====================================================================

Testar:

activar;
desactivar;
notificação obrigatória;
preferência inexistente;
alteração de preferência.

====================================================================
67. TESTES E2E
====================================================================

E2E-001

Criar evento.

Resultado:

notificação criada.

------------------------------------------------------------

E2E-002

Utilizador abre centro de notificações.

Resultado:

notificação aparece.

------------------------------------------------------------

E2E-003

Marcar como lida.

Resultado:

badge diminui.

------------------------------------------------------------

E2E-004

Marcar todas como lidas.

Resultado:

unread count = 0.

------------------------------------------------------------

E2E-005

Utilizador tenta consultar notificação de outro utilizador.

Resultado:

403 ou 404 conforme política de segurança.

------------------------------------------------------------

E2E-006

Evento duplicado.

Resultado:

uma única notificação.

====================================================================
68. TASKS
====================================================================

Criar:

prompts/tasks/sprint-04/

TASK-001-audit-existing-events.md
TASK-002-domain-events.md
TASK-003-event-bus.md
TASK-004-outbox.md
TASK-005-event-publisher.md
TASK-006-event-handlers.md
TASK-007-notification-domain.md
TASK-008-recipient-resolver.md
TASK-009-notification-service.md
TASK-010-deduplication.md
TASK-011-retry.md
TASK-012-rabbitmq-worker.md
TASK-013-redis-support.md
TASK-014-notification-api.md
TASK-015-notification-preferences.md
TASK-016-notification-center.md
TASK-017-notification-bell.md
TASK-018-unread-count.md
TASK-019-polling.md
TASK-020-authorization.md
TASK-021-audit.md
TASK-022-tests.md
TASK-023-e2e.md
TASK-024-documentation.md
TASK-025-final-review.md

====================================================================
69. CHECKPOINTS
====================================================================

CHECKPOINT A
Domain Events

CHECKPOINT B
Event Bus

CHECKPOINT C
Outbox

CHECKPOINT D
Notification Domain

CHECKPOINT E
Recipient Resolver

CHECKPOINT F
RabbitMQ Worker

CHECKPOINT G
Notification API

CHECKPOINT H
Preferences

CHECKPOINT I
Frontend Notification Center

CHECKPOINT J
Unread Count + Polling

CHECKPOINT K
Authorization

CHECKPOINT L
Tests

CHECKPOINT M
Documentation

Cada checkpoint deve executar:

lint
typecheck
tests
build

Depois:

commit.

====================================================================
70. COMMITS
====================================================================

Utilizar Conventional Commits.

Exemplos:

feat(events): implement domain events

feat(events): implement event bus

feat(events): implement transactional outbox

feat(notifications): implement notification domain

feat(notifications): implement recipient resolver

feat(notifications): implement notification api

feat(notifications): implement preferences

feat(notifications): implement notification center

feat(notifications): implement unread count

feat(notifications): implement polling

test(events): add event processing tests

test(notifications): add notification authorization tests

docs(notifications): document notification architecture

chore(sprint-04): complete notifications sprint

====================================================================
71. DOCUMENTAÇÃO
====================================================================

Criar:

docs/sprints/SPRINT-04.md

docs/architecture/events.md

docs/architecture/notifications.md

docs/architecture/outbox.md

Actualizar documentação da arquitectura geral.

====================================================================
72. SIDEBAR
====================================================================

Adicionar:

NOTIFICAÇÕES

Somente se o utilizador possuir acesso ao centro de notificações.

Não criar menu administrativo para eventos internos.

====================================================================
73. HEADER
====================================================================

Adicionar:

Notification Bell

ao App Header global.

O componente deve funcionar independentemente do módulo actual.

====================================================================
74. NÃO IMPLEMENTAR
====================================================================

Nesta Sprint NÃO implementar:

Email
SMS
WhatsApp
Push Mobile
WebSocket
SSE
Processos
Documentos
Form Builder
Piquete
Mandados
BRP
PGR
Workflow
Deadlines processuais
Despachos

Apenas preparar a infraestrutura necessária.

====================================================================
75. INTEGRAÇÃO COM SPRINT-03
====================================================================

Integrar apenas eventos já existentes:

USER_CREATED
USER_UPDATED
USER_ACTIVATED
USER_DEACTIVATED

PERSON_CREATED
PERSON_UPDATED

ASSIGNMENT_CREATED
ASSIGNMENT_ENDED

RESPONSIBILITY_ASSIGNED
RESPONSIBILITY_ENDED

DELEGATION_CREATED
DELEGATION_ENDED

SUBSTITUTION_CREATED
SUBSTITUTION_ENDED

Não inventar eventos de módulos ainda inexistentes.

====================================================================
76. EXEMPLO
====================================================================

Quando:

RESPONSIBILITY_ASSIGNED

acontecer:

1. operação é persistida;
2. evento é criado;
3. outbox é persistido;
4. publisher publica;
5. handler recebe;
6. RecipientResolver identifica destinatário;
7. NotificationService cria notificação;
8. utilizador vê no centro de notificações.

====================================================================
77. QUALIDADE
====================================================================

Não criar:

God Service
God EventHandler
God Repository

Separar responsabilidades.

Seguir:

SOLID
Clean Architecture
DDD pragmático
Dependency Injection
Separation of Concerns

Não exagerar abstrações.

====================================================================
78. PERFORMANCE
====================================================================

Não executar operações pesadas dentro da request HTTP quando puderem ser
assíncronas.

Não fazer N+1 queries.

Não carregar todas as notificações do utilizador para calcular unread.

Utilizar COUNT eficiente.

====================================================================
79. OBSERVABILIDADE
====================================================================

Utilizar apenas a infraestrutura de observabilidade já definida no
projecto.

Não adicionar novas ferramentas.

Registar:

event processing latency
failed events
notification creation failures
queue failures

====================================================================
80. DEFINITION OF DONE
====================================================================

[ ] Domain Events
[ ] Event Bus
[ ] Event Handlers
[ ] Transactional Outbox
[ ] RabbitMQ Worker
[ ] Retry
[ ] Idempotência
[ ] Deduplicação
[ ] Notification Domain
[ ] Recipient Resolver
[ ] In-App Channel
[ ] Notification API
[ ] Notification Center
[ ] Notification Bell
[ ] Unread Count
[ ] Polling
[ ] Preferences
[ ] Authorization
[ ] Audit
[ ] PostgreSQL migrations
[ ] Tests
[ ] E2E
[ ] Documentation
[ ] Sidebar
[ ] Header
[ ] Lint PASS
[ ] Typecheck PASS
[ ] Build PASS
[ ] Tests PASS
[ ] Tasks DONE
[ ] Commits DONE

====================================================================
81. FINALIZAÇÃO
====================================================================

Actualizar:

docs/sprints/SPRINT-04.md

Marcar:

SPRINT-04 = DONE

Criar commit final:

chore(sprint-04): complete notifications and events

====================================================================
82. REGRA FINAL
====================================================================

NÃO iniciar automaticamente a SPRINT-05.

Depois de concluir:

PARAR.

Apresentar relatório final.

Aguardar autorização explícita para continuar.

====================================================================
FIM DO PROMPT — SPRINT 04
====================================================================
```

### O roadmap passa a ficar assim

```text
SPRINT 00
Bootstrap / Architecture
        ↓
SPRINT 01
Autenticação + RBAC + Autorização
        ↓
SPRINT 02
Gestão de Utilizadores
        ↓
SPRINT 03
Pessoas + Estrutura + Lotação + Funções +
Responsabilidades + Atribuições
        ↓
SPRINT 04
Notificações + Eventos + Outbox
        ↓
SPRINT 05
Form Builder + Biblioteca Documental
        ↓
SPRINT 06
Gestão de Documentos
        ↓
SPRINT 07
Entrada de Registos:
Denúncias + Participações + Autos
        ↓
SPRINT 08
Piquete
        ↓
SPRINT 09
Gestão da Instrução Processual
        ↓
SPRINT 10
Processos + Peças Processuais
        ↓
SPRINT 11
Distribuição + Acompanhamento + Despachos
        ↓
SPRINT 12
Mandados
        ↓
SPRINT 13
BRP
        ↓
SPRINT 14
PGR / Integração
        ↓
SPRINT 15
Relatórios + Dashboards
```

**Nota importante:** eu manteria o **Form Builder antes da Entrada de Registos**. Como já definiste, denúncia, participação, declaração, auto etc. são **peças/documentos**, e a entrada de registos deve conseguir gerar esses documentos através da biblioteca documental especializada — não através de formulários CRUD independentes e duplicados. Isso deixa a arquitectura do SIP muito mais coerente.
