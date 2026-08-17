====================================================================
PROMPT 00 — SIP | BOOTSTRAP / ARCHITECTURE
====================================================================

PROJECT: SIP — Sistema de Instrução Processual

OBJECTIVE:
Construir a fundação técnica completa do SIP a partir de um repositório
vazio ou existente, preparando uma arquitectura modular, segura,
testável, observável e preparada para evolução incremental.

IMPORTANTE:

Este é o PRIMEIRO PROMPT do projecto.

NÃO implementar ainda os módulos funcionais de:

- Processos;
- Piquete;
- Entrada de Peças;
- Instrução Processual;
- Mandados;
- BRP;
- PGR;
- Relatórios funcionais.

Nesta etapa devemos construir APENAS a fundação arquitectural.

====================================================================
1. REGRA PRINCIPAL DE EXECUÇÃO
====================================================================

NÃO assumir que o projecto existente está correcto.

Antes de alterar qualquer coisa:

1. Inspeccionar todo o repositório.
2. Identificar tecnologias existentes.
3. Identificar código existente.
4. Identificar configurações existentes.
5. Identificar problemas arquitecturais.
6. Identificar código morto.
7. Identificar duplicações.
8. Identificar configurações conflitantes.
9. Produzir um diagnóstico inicial.

Se o projecto estiver vazio, criar a estrutura do zero.

Se já existir código, NÃO apagar indiscriminadamente.

Primeiro avaliar.

====================================================================
2. STACK OFICIAL
====================================================================

BACKEND

Python
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL

FRONTEND

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide React

STATE / DATA

TanStack Query

TABLES

TanStack Table

INFRAESTRUTURA

Docker
Docker Compose
Nginx

CACHE / ASYNC

Redis
RabbitMQ

DOCUMENTOS / OBJECT STORAGE

MinIO

SEARCH

OpenSearch

OBSERVABILITY

OpenTelemetry
Prometheus
Grafana

NÃO utilizar Elasticsearch.

NÃO utilizar microserviços nesta fase.

A arquitectura será um MODULAR MONOLITH.

====================================================================
3. PRINCÍPIO ARQUITECTURAL
====================================================================

O SIP deve utilizar uma arquitectura de Modular Monolith.

Não criar microserviços.

O sistema deve possuir fronteiras claras entre módulos.

Cada módulo deve possuir:

- domínio;
- aplicação;
- infraestrutura;
- API;
- schemas;
- testes.

Evitar dependências circulares.

As regras de negócio não devem depender directamente do framework.

Utilizar princípios:

- SOLID;
- Clean Architecture onde fizer sentido;
- Domain Driven Design pragmático;
- Dependency Injection;
- Repository Pattern quando necessário;
- Service/Application Layer;
- DTO/Schemas;
- Unit of Work quando necessário.

NÃO aplicar padrões apenas por estética.

A simplicidade deve ser priorizada.

====================================================================
4. ESTRUTURA DO PROJECTO
====================================================================

Criar uma estrutura semelhante a:

sip/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── shared/
│   │   ├── modules/
│   │   └── main.py
│   │
│   ├── tests/
│   ├── alembic/
│   ├── pyproject.toml
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   │
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── infra/
│   ├── docker/
│   ├── nginx/
│   └── docker-compose.yml
│
├── docs/
│   ├── architecture/
│   ├── adr/
│   └── api/
│
├── prompts/
│   └── tasks/
│
├── scripts/
│
├── AGENTS.md
├── README.md
└── .gitignore

A estrutura pode ser adaptada caso exista uma razão arquitectural clara.

====================================================================
5. BACKEND
====================================================================

Configurar FastAPI correctamente.

Criar:

/api/v1

Separar:

- routers;
- schemas;
- services;
- repositories;
- models;
- dependencies.

Criar configuração centralizada através de Settings.

Não utilizar configurações espalhadas pelo código.

Utilizar variáveis de ambiente.

Criar:

.env.example

NUNCA colocar secrets reais no Git.

====================================================================
6. DATABASE
====================================================================

Utilizar PostgreSQL.

Configurar:

SQLAlchemy
Alembic

Criar:

- conexão;
- session management;
- migrations;
- base model;
- timestamps;
- UUID quando apropriado.

Definir estratégia consistente para:

created_at
updated_at
created_by
updated_by

quando aplicável.

Não criar ainda entidades funcionais complexas.

====================================================================
7. API
====================================================================

Criar:

GET /api/v1/health
GET /api/v1/health/ready
GET /api/v1/health/live

Criar tratamento global de erros.

Criar resposta consistente para erros.

Exemplo conceptual:

{
  "code": "VALIDATION_ERROR",
  "message": "...",
  "details": []
}

Não expor stack traces ao utilizador.

====================================================================
8. LOGGING
====================================================================

Criar logging estruturado.

Os logs devem permitir identificar:

- timestamp;
- level;
- service;
- request_id;
- correlation_id;
- user_id quando disponível;
- endpoint;
- duration;
- error.

Não gravar passwords, tokens ou dados sensíveis desnecessariamente.

====================================================================
9. CORRELATION ID
====================================================================

Criar middleware para:

X-Request-ID
X-Correlation-ID

Caso não existam, gerar automaticamente.

O mesmo correlation ID deve poder ser propagado para:

FastAPI
RabbitMQ
logs
workers
operações assíncronas

====================================================================
10. OBSERVABILIDADE
====================================================================

NÃO exagerar na observabilidade.

Utilizar:

OpenTelemetry
Prometheus
Grafana

Preparar:

- traces;
- metrics;
- logs estruturados.

Não implementar uma infraestrutura de observabilidade excessivamente
complexa.

O objectivo é obter:

- health;
- métricas HTTP;
- erros;
- latência;
- traces essenciais;
- disponibilidade.

Criar apenas o necessário nesta fase.

====================================================================
11. REDIS
====================================================================

Preparar Redis para:

- cache;
- sessões quando necessário;
- rate limiting;
- operações temporárias.

NÃO espalhar Redis pela aplicação sem necessidade.

Criar uma abstração clara.

====================================================================
12. RABBITMQ
====================================================================

Preparar RabbitMQ para processamento assíncrono.

Não criar dezenas de queues nesta fase.

Criar apenas a infraestrutura base.

Preparar conceitos:

Event
Message
Publisher
Consumer

Criar correlation_id nas mensagens.

====================================================================
13. MINIO
====================================================================

Configurar MinIO para object storage.

Preparar buckets separados logicamente para:

- documentos;
- assets;
- anexos;
- exports.

Não guardar ficheiros binários no PostgreSQL.

Guardar no banco apenas:

- object key;
- bucket;
- filename;
- content type;
- size;
- checksum;
- metadata necessária.

CLAMAV NÃO será utilizado.

A plataforma SIP gera e controla os documentos através do seu próprio
motor documental.

====================================================================
14. OPENSEARCH
====================================================================

Preparar a infraestrutura para OpenSearch.

NÃO implementar ainda toda a pesquisa.

Nesta fase apenas:

- configuração;
- conexão;
- health check;
- abstração inicial.

PostgreSQL continuará sendo a fonte oficial dos dados.

OpenSearch será utilizado posteriormente para pesquisa avançada.

====================================================================
15. FRONTEND
====================================================================

Utilizar:

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
TanStack Query
TanStack Table

Utilizar App Router.

Criar arquitectura preparada para:

- autenticação;
- layouts;
- dashboards;
- módulos;
- tabelas;
- formulários;
- documentos.

Não criar ainda os módulos funcionais.

====================================================================
16. DESIGN SYSTEM
====================================================================

Configurar:

shadcn/ui
Tailwind CSS
Lucide React

Criar uma base visual consistente.

Preparar:

- Button;
- Input;
- Select;
- Combobox;
- Dialog;
- Drawer;
- Sheet;
- Tabs;
- Table;
- Dropdown;
- Tooltip;
- Badge;
- Alert;
- Form;
- Calendar;
- Date Picker.

Não criar componentes visuais duplicados sem necessidade.

NÃO utilizar SVG manual quando existir ícone equivalente no Lucide React.

====================================================================
17. LAYOUT
====================================================================

Criar arquitectura base:

AppLayout
├── Sidebar
├── Header
├── Breadcrumb
└── MainContent

Criar também:

PageContainer
PageHeader
PageContent

O conteúdo principal deve possuir comportamento consistente de largura,
padding e responsividade.

Não duplicar layouts em cada página.

====================================================================
18. SIDEBAR
====================================================================

NÃO implementar ainda todos os itens finais do SIP.

Criar apenas a arquitectura do Sidebar.

O Sidebar deverá futuramente ser construído com base em:

- perfil;
- permissões;
- contexto organizacional;
- funcionalidades disponíveis.

Não confiar apenas no frontend.

A autorização real deve ocorrer no backend.

Não hardcodar regras de segurança apenas no Sidebar.

====================================================================
19. AUTENTICAÇÃO
====================================================================

Preparar arquitectura para:

JWT
Access Token
Refresh Token quando necessário
Password Hashing
RBAC
Permissions
Scopes

Nesta Sprint pode ser criada apenas a fundação.

A implementação funcional completa de autenticação será realizada
na Sprint seguinte.

====================================================================
20. AUTORIZAÇÃO
====================================================================

Preparar modelo:

User
Profile
Permission
Organization
Scope

Conceito:

USER
 ↓
PROFILE
 ↓
PERMISSION
 ↓
ORGANIZATIONAL SCOPE
 ↓
RESOURCE

A autorização deve ser validada no backend.

Nunca confiar em:

- hidden buttons;
- sidebar;
- frontend route guards

como mecanismo de segurança.

====================================================================
21. PERFIS OFICIAIS DO SIP
====================================================================

Preparar os seguintes perfis:

ADMINISTRADOR_SISTEMA
DIRECTOR
SECRETARIA_GERAL
CHEFE_DEPARTAMENTO
CHEFE_SECCAO
INSTRUTOR_PROCESSUAL
AGENTE_PIQUETE
EDITOR_DOCUMENTAL
AGENTE_PGR

Humanizar os nomes na interface.

Exemplo:

ADMINISTRADOR_SISTEMA
→ Administrador do Sistema

CHEFE_DEPARTAMENTO
→ Chefe de Departamento

CHEFE_SECCAO
→ Chefe de Secção

AGENTE_PGR
→ Agente PGR

Nunca mostrar enum técnico directamente ao utilizador.

====================================================================
22. DOCUMENT ENGINE
====================================================================

Nesta fase NÃO implementar todo o Form Builder.

Criar apenas a arquitectura e documentação necessárias.

Criar:

docs/architecture/document-architecture.md

docs/architecture/document-component-library.md

A segunda deve conter integralmente a especificação da:

BIBLIOTECA PROFISSIONAL DE COMPONENTES DOCUMENTAIS DO SIP

fornecida pelo projecto.

Essa especificação é normativa.

O Form Builder não será um editor HTML genérico.

Será um editor de documentos oficiais e processuais.

Preparar arquitectura:

Component Registry
Component Definition
Component Schema
Field Registry
Template Registry
Asset Registry
Template Schema
Validation Engine
Binding Engine
Document Rendering Engine
PDF Renderer
DOCX Renderer

Não implementar todos os componentes nesta Sprint.

====================================================================
23. DOCUMENT ENGINE — PRINCÍPIO
====================================================================

O fluxo futuro será:

Template
 ↓
Template Schema
 ↓
Data Binding
 ↓
Validation
 ↓
Document Rendering Engine
 ↓
 ┌──────────────┐
 │              │
PDF Renderer   DOCX Renderer
 │              │
PDF            DOCX

Não criar dois designers.

Não criar dois templates.

Não exigir que o utilizador desenhe o documento duas vezes.

====================================================================
24. DOCUMENTOS
====================================================================

O sistema deverá futuramente suportar:

- Participações;
- Denúncias;
- Queixas;
- Autos;
- Declarações;
- Termos;
- Despachos;
- Ofícios;
- Mandados;
- Relatórios;
- Documentos de Piquete;
- Documentos de Instrução;
- Documentos destinados à PGR.

Uma participação, denúncia ou auto deve ser tratado como peça/documento
de entrada processual quando aplicável.

Não modelar "Ocorrência" como substituto universal de:

- denúncia;
- participação;
- auto;
- peça documental.

====================================================================
25. ARQUITECTURA DE DOCUMENTOS
====================================================================

Manter separados:

DocumentTemplate
DocumentTemplateVersion
DocumentType
DocumentInstance
DocumentAsset
DocumentAudit

E posteriormente:

Process
ProcessPiece

Uma peça processual poderá referenciar uma DocumentInstance.

Não duplicar o motor documental dentro do módulo Processos.

====================================================================
26. SEGURANÇA
====================================================================

Implementar boas práticas desde o primeiro commit.

Verificar:

- secrets;
- CORS;
- headers;
- validation;
- SQL injection;
- path traversal;
- upload security;
- authorization;
- rate limiting;
- password handling;
- JWT security.

Não armazenar secrets no Git.

====================================================================
27. TESTES
====================================================================

Configurar:

Backend:

pytest

Frontend:

Vitest ou equivalente apropriado

E2E:

Playwright

Nesta fase criar pelo menos testes para:

- health;
- configuração;
- API base;
- tratamento de erros;
- frontend inicial;
- integração básica frontend/backend.

O projecto não pode avançar com testes quebrados.

====================================================================
28. CI
====================================================================

Criar pipeline para:

- lint;
- typecheck;
- tests;
- build.

O CI não deve depender de serviços externos desnecessários.

====================================================================
29. DOCKER
====================================================================

O backend e o frontend DEVEM rodar em Docker.

O Docker é o ambiente de execução oficial do SIP em desenvolvimento.

Criar Docker Compose para ambiente de desenvolvimento.

Serviços iniciais:

backend
frontend
nginx
postgres
redis
rabbitmq
minio
opensearch
prometheus
grafana

O Nginx funciona como reverse proxy:

/api → backend
restante → frontend

Não adicionar serviços desnecessários.

Não criar Kubernetes.

Não criar microserviços.

Não adicionar ClamAV.

====================================================================
30. HOT RELOAD
====================================================================

O ambiente de desenvolvimento deve suportar:

FastAPI hot reload
Next.js hot reload

O hot reload deve funcionar DENTRO dos containers.

Preparar volumes e configurações apropriadas:

- montar o código do backend e do frontend como volumes;
- uvicorn --reload no backend;
- next dev no frontend;
- reconstruir apenas quando as dependências mudarem.

O Docker não deve destruir a experiência de desenvolvimento.

====================================================================
31. DOCUMENTAÇÃO
====================================================================

Criar:

README.md

AGENTS.md

docs/architecture/system-architecture.md

docs/architecture/document-architecture.md

docs/architecture/document-component-library.md

docs/adr/

Criar ADRs quando houver decisões arquitecturais relevantes.

====================================================================
32. TASKS E SPRINTS
====================================================================

Criar:

prompts/tasks/

Cada Sprint deve possuir Tasks claras.

Exemplo:

prompts/tasks/
├── sprint-00-bootstrap/
│   ├── TASK-001-repository-analysis.md
│   ├── TASK-002-backend-bootstrap.md
│   ├── TASK-003-frontend-bootstrap.md
│   ├── TASK-004-infrastructure.md
│   ├── TASK-005-observability.md
│   ├── TASK-006-testing.md
│   └── TASK-007-documentation.md
│
└── README.md

Não criar Tasks vagas.

Cada Task deve possuir:

- objective;
- scope;
- dependencies;
- implementation;
- acceptance criteria;
- tests;
- definition of done.

====================================================================
33. SPRINT MANAGEMENT
====================================================================

Criar:

docs/sprints/

Cada Sprint deverá possuir:

- objetivo;
- Tasks;
- estado;
- critérios de conclusão;
- riscos;
- decisões.

Formato:

SPRINT-00
Bootstrap / Architecture

Estado inicial:

IN_PROGRESS

====================================================================
34. REGRA DE EXECUÇÃO DAS TASKS
====================================================================

Executar uma Task por vez.

Para cada Task:

1. Ler a Task.
2. Inspeccionar código relevante.
3. Implementar.
4. Executar testes.
5. Executar lint.
6. Executar typecheck.
7. Corrigir problemas.
8. Actualizar documentação.
9. Marcar Task como DONE.
10. Criar commit.

NUNCA marcar uma Task como DONE sem validação.

====================================================================
35. COMMITS
====================================================================

Cada Task concluída deve gerar um commit.

Formato:

feat(scope): description

Exemplos:

feat(bootstrap): initialize FastAPI backend

feat(frontend): initialize Next.js application

feat(infra): add development infrastructure

test(bootstrap): add health checks

docs(architecture): document modular monolith

Não fazer um único commit gigantesco no final da Sprint.

====================================================================
36. NÃO AVANÇAR AUTOMATICAMENTE
====================================================================

Depois de terminar uma Task:

- testar;
- commit;
- actualizar estado.

Depois de terminar a Sprint:

- executar validação completa;
- confirmar que todas as Tasks estão DONE;
- criar commit final da Sprint;
- apresentar resumo.

NÃO iniciar automaticamente a Sprint seguinte.

Parar e aguardar autorização.

====================================================================
37. DEFINITION OF DONE — SPRINT 00
====================================================================

A Sprint 00 somente estará concluída quando:

[ ] Repositório analisado
[ ] Arquitectura definida
[ ] Backend FastAPI funcional
[ ] Backend a rodar em Docker
[ ] Frontend Next.js funcional
[ ] Frontend a rodar em Docker
[ ] Nginx configurado como reverse proxy
[ ] PostgreSQL funcional
[ ] Alembic funcional
[ ] Redis funcional
[ ] RabbitMQ funcional
[ ] MinIO funcional
[ ] OpenSearch preparado
[ ] Prometheus preparado
[ ] Grafana preparado
[ ] OpenTelemetry preparado
[ ] Docker Compose funcional
[ ] Hot reload funcional em Docker
[ ] Health checks funcionais
[ ] Logging estruturado
[ ] Correlation ID
[ ] Testes configurados
[ ] Lint configurado
[ ] Typecheck configurado
[ ] CI configurado
[ ] AGENTS.md criado
[ ] Documentação criada
[ ] ADR inicial criado
[ ] Document Engine documentado
[ ] Document Component Library criada
[ ] Sistema de Tasks criado
[ ] Sistema de Sprints criado
[ ] Todos os testes passam
[ ] Build passa
[ ] Commits realizados

====================================================================
38. RESULTADO ESPERADO
====================================================================

Ao terminar esta Sprint deverá ser possível executar:

docker compose up

E verificar:

Backend e Frontend a correr em containers.

GET /api/v1/health

com resposta saudável, acessível:

directamente no backend:

http://localhost:8000/api/v1/health

e através do Nginx:

http://localhost/api/v1/health

O frontend deverá abrir correctamente:

http://localhost

A infraestrutura deverá estar funcional.

Nenhum módulo de negócio deve ser implementado prematuramente.

====================================================================
39. COMPORTAMENTO DO AGENTE
====================================================================

Se encontrar problemas arquitecturais:

NÃO esconder.

Documentar.

Se uma decisão importante for necessária:

Criar ADR.

Se houver dúvida:

Não inventar requisito.

Consultar:

- documentação;
- código existente;
- AGENTS.md;
- ADRs;
- Tasks;
- especificações do SIP.

Priorizar:

1. Correctness
2. Security
3. Maintainability
4. Testability
5. Performance
6. Developer Experience

====================================================================
40. FINAL DA EXECUÇÃO
====================================================================

Quando terminar a Sprint 00, apresentar:

1. Resumo da arquitectura.
2. Estrutura de pastas.
3. Tecnologias configuradas.
4. Serviços Docker.
5. Tasks concluídas.
6. Testes executados.
7. Problemas encontrados.
8. ADRs criados.
9. Commits realizados.
10. Estado final da Sprint.

NÃO iniciar a Sprint 01.

Aguardar autorização explícita.

====================================================================
FIM DO PROMPT 00
====================================================================