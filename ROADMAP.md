# Roadmap oficial de construção do SIP

```text
FASE 00
Bootstrap + Arquitectura
        ↓
FASE 01
Identidade + Autenticação + Autorização
        ↓
FASE 02
Estrutura Organizacional + Utilizadores
        ↓
FASE 03
Notificações
        ↓
FASE 04
Motor Documental + Form Builder
        ↓
FASE 05
Entrada e Registo de Peças
        ↓
FASE 06
Processos
        ↓
FASE 07
Distribuição + Tramitação
        ↓
FASE 08
Instrução Processual
        ↓
FASE 09
Despachos + Prazos
        ↓
FASE 10
Mandados
        ↓
FASE 11
BRP / Detidos
        ↓
FASE 12
PGR
        ↓
FASE 13
Pesquisa + OpenSearch
        ↓
FASE 14
Relatórios + Dashboards
        ↓
FASE 15
Auditoria + Segurança + Performance
        ↓
FASE 16
QA + Release
```

---

# FASE 00 — Bootstrap / Arquitectura

### Primeiro prompt que a IA deve executar

**PROMPT 00 — Bootstrap / Architecture**

Objectivo:

Criar a fundação técnica do SIP.

### A IA deve executar:

1. Inspeccionar o repositório.
2. Criar estrutura do projecto.
3. Configurar Next.js.
4. Configurar FastAPI.
5. Configurar PostgreSQL.
6. Configurar SQLAlchemy.
7. Configurar Alembic.
8. Configurar Redis.
9. Configurar Docker Compose.
10. Configurar ambiente `.env`.
11. Criar health checks.
12. Criar logging.
13. Criar correlation ID.
14. Criar estrutura de testes.
15. Configurar lint.
16. Configurar type checking.
17. Configurar CI.
18. Criar AGENTS.md.
19. Criar ADRs.
20. Criar `docs/architecture`.
21. Criar `prompts/tasks`.
22. Criar documentação do motor documental.
23. Validar frontend ↔ backend.
24. Executar testes.
25. Criar commit.

### Resultado

```text
SIP
├── frontend
├── backend
├── infra
├── docs
├── prompts
│   └── tasks
├── AGENTS.md
└── README.md
```

**Não avançar enquanto esta fase não estiver funcional.**

---

# FASE 01 — Identidade, Autenticação e Autorização

Depois do Bootstrap:

```text
TASK-001 Authentication
TASK-002 Authorization
TASK-003 RBAC
TASK-004 Permissions
TASK-005 Scope
TASK-006 Session/Security
```

Implementar:

* login;
* JWT;
* refresh token, se definido;
* password hashing;
* utilizadores;
* perfis;
* permissões;
* RBAC;
* scopes;
* autorização backend;
* protecção de endpoints;
* auditoria de autenticação.

### Perfis oficiais

```text
ADMINISTRADOR_SISTEMA
DIRECTOR
SECRETARIA_GERAL
CHEFE_DEPARTAMENTO
CHEFE_SECCAO
INSTRUTOR_PROCESSUAL
AGENTE_PIQUETE
EDITOR_DOCUMENTAL
AGENTE_PGR
```

### Regra

Não basta:

```text
user.role == "INSTRUTOR"
```

Deve existir:

```text
USER
 ↓
PROFILE
 ↓
PERMISSION
 ↓
ORGANIZATION
 ↓
SCOPE
 ↓
RESOURCE
```

---

# FASE 02 — Organização + Utilizadores

Agora implementar:

```text
Organização
├── Direcção
│   ├── Departamento
│   │   └── Secção
│   └── Utilizadores
```

Criar:

* Direcções;
* Departamentos;
* Secções;
* unidades;
* utilizadores;
* associação utilizador/unidade;
* responsáveis;
* perfis;
* permissões.

Também criar a base para:

```text
user_scope
organization_scope
resource_scope
```

### Teste obrigatório

Criar pelo menos:

```text
Director A
Chefe Departamento A
Chefe Secção A
Instrutor A
Instrutor B
Agente Piquete
Editor
Agente PGR
```

e verificar que cada um vê apenas o que deve.

---

# FASE 03 — Notificações

Só depois da identidade estar pronta.

Implementar o **Notification Center**.

Deve suportar:

* notificações;
* lidas/não lidas;
* prioridade;
* tipo;
* origem;
* destinatário;
* data;
* deep link;
* expiração;
* preferências.

Exemplos:

```text
Novo processo atribuído
Novo despacho
Prazo próximo
Documento recebido
Processo devolvido
Solicitação PGR
```

RabbitMQ pode começar a ser utilizado aqui para notificações assíncronas.

---

# FASE 04 — Motor Documental + Form Builder

Esta será uma das maiores fases do projecto.

E aqui deve ser utilizada **integralmente a especificação que forneceste**:

```text
docs/architecture/document-component-library.md
```

### Ordem interna

```text
04.1 Document Registry
04.2 Document Type Registry
04.3 Asset Registry
04.4 Component Registry
04.5 Field Registry
04.6 Template Schema
04.7 Data Binding
04.8 Validation Engine
04.9 Form Builder Canvas
04.10 Component Editor
04.11 Preview Renderer
04.12 PDF Renderer
04.13 DOCX Renderer
04.14 Versioning
04.15 Publishing
04.16 Document Instances
04.17 Audit
```

### Primeiro construir a fundação

Não começar pelos 100 componentes.

Primeiro:

```text
Component Registry
        ↓
Schema
        ↓
Renderer
```

Depois componentes básicos:

```text
TEXT
HEADING
PARAGRAPH
RICH_TEXT
LINE
CONTAINER
SECTION
```

Depois:

```text
DOCUMENT_NUMBER
DOCUMENT_REFERENCE
SUBJECT_BLOCK
PERSON_FIELD
PROCESS_FIELD
```

Depois:

```text
OFFICIAL_HEADER
COAT_OF_ARMS
OFFICIAL_LOGO
INSTITUTIONAL_BLOCK
```

Depois:

```text
DOCUMENT_TABLE
REPEATER
SIGNATURE_BLOCK
MULTI_SIGNATURE_BLOCK
```

E então os componentes processuais:

```text
PARTICIPATION_BLOCK
DECLARATION_BLOCK
SEIZURE_BLOCK
OCCURRENCE_BLOCK
STATEMENT_BLOCK
DETENTION_BLOCK
MANDATE_BLOCK
```

E finalmente:

```text
OFFICIAL_25_LINE_SHEET
```

e os componentes avançados.

### Critério de sucesso

A IA deve conseguir criar um documento:

```text
República de Angola
        ↓
SIC
        ↓
Direcção
        ↓
Processo
        ↓
Pessoa
        ↓
Conteúdo
        ↓
Assinatura
        ↓
PDF
        ↓
DOCX
```

**sem criar código específico para esse documento.**

---

# FASE 05 — Entrada e Registo de Peças

Agora entra o conceito que discutimos.

Não começar por “Ocorrências” como entidade central.

O ponto de entrada deve permitir:

```text
ENTRADA
   │
   ├── Denúncia
   ├── Participação
   ├── Queixa
   ├── Auto
   └── Outra peça
```

A peça é criada através do:

```text
Form Builder
      ↓
Documento
      ↓
Entrada/Registo
```

O Agente Piquete pode:

* registar;
* preencher;
* gerar;
* validar;
* encaminhar.

O sistema deve manter:

```text
Entrada
 ↓
Peça
 ↓
Registo
 ↓
Encaminhamento
```

---

# FASE 06 — Processos

Agora construir o núcleo processual.

Modelo conceptual:

```text
PROCESSO
│
├── Capa
├── Participação
├── Autos
├── Declarações
├── Termos
├── Despachos
├── Relatórios
├── Mandados
├── Outras peças
├── Tramitações
├── Prazos
└── Histórico
```

A **capa também é uma peça/documento**, gerada pelo módulo documental.

Não criar uma implementação paralela de documentos dentro do módulo Processos.

---

# FASE 07 — Distribuição + Tramitação

Implementar:

```text
Entrada
 ↓
Secretaria
 ↓
Director
 ↓
Chefe Departamento
 ↓
Chefe Secção
 ↓
Instrutor
```

Mas o workflow deve ser configurável.

Implementar:

* atribuição;
* distribuição;
* redistribuição;
* encaminhamento;
* devolução;
* aceite;
* recusa justificada;
* transferência;
* histórico.

Tudo deve gerar auditoria.

---

# FASE 08 — Instrução Processual

Agora o Instrutor ganha o ambiente próprio.

Dashboard:

```text
Meus Processos
Pendentes
Em Instrução
Prazos
Diligências
Documentos
Despachos
```

Implementar:

* actos;
* diligências;
* documentos;
* pedidos;
* respostas;
* histórico;
* prazos;
* conclusão da instrução.

O Instrutor só trabalha nos processos autorizados.

---

# FASE 09 — Despachos + Prazos

Criar o motor de despacho.

Exemplo:

```text
Director
   ↓
Despacho
   ↓
Destinatário
   ↓
Prazo
   ↓
Notificação
   ↓
Execução
   ↓
Conclusão
```

Implementar:

* despacho;
* destinatário;
* instrução;
* prazo;
* prioridade;
* estado;
* cumprimento;
* incumprimento;
* histórico.

---

# FASE 10 — Mandados

Criar gestão de:

* mandados;
* tipos;
* emissão;
* estado;
* cumprimento;
* devolução;
* documentos;
* histórico.

Os documentos dos mandados continuam a ser produzidos pelo **Document Engine**.

---

# FASE 11 — BRP / Detidos

Implementar:

* registo;
* identificação;
* situação;
* processo relacionado;
* entrada;
* saída;
* movimentações;
* documentos;
* histórico.

Manter separação entre:

```text
Pessoa
Detido
Processo
Documento
```

---

# FASE 12 — PGR

Agora implementar o actor:

```text
AGENTE_PGR
```

e o espaço de colaboração.

Fluxo:

```text
SIP
 ↓
Processo
 ↓
Documentos/Peças seleccionados
 ↓
Disponibilização PGR
 ↓
AGENTE_PGR
 ↓
Comunicação
 ↓
Resposta
 ↓
Histórico
```

O Agente PGR nunca deve ganhar acesso global aos processos.

---

# FASE 13 — OpenSearch

Só depois de os dados estarem estáveis.

Indexar:

```text
Processos
Documentos
Peças
Pessoas
Despachos
```

Implementar:

* full text;
* filtros;
* pesquisa por número;
* pesquisa por pessoa;
* pesquisa documental;
* pesquisa combinada.

PostgreSQL continua sendo a fonte de verdade.

---

# FASE 14 — Relatórios + Dashboards

Só depois dos módulos operacionais.

Criar dashboards por perfil.

### Director

```text
Processos
Pendentes
Em instrução
Prazos
Distribuição
Produtividade
```

### Chefe Departamento

```text
Processos do departamento
Instrutores
Prazos
Pendências
```

### Instrutor

```text
Meus processos
Prazos
Diligências
Pendências
```

### Secretaria

```text
Entradas
Encaminhamentos
Pendências
```

---

# FASE 15 — Hardening

Aqui fazemos a auditoria geral.

### Segurança

* RBAC;
* IDOR;
* scopes;
* JWT;
* permissions;
* secrets;
* uploads;
* API;
* CORS;
* rate limiting.

### Performance

* queries;
* indexes;
* N+1;
* cache;
* OpenSearch;
* RabbitMQ;
* PostgreSQL.

### Documentos

* PDF;
* DOCX;
* paginação;
* 25 linhas;
* tabelas;
* bindings;
* assets;
* versões.

### Auditoria

Verificar se operações críticas estão registadas.

---

# FASE 16 — QA + Release

Executar:

```text
Unit Tests
Integration Tests
API Tests
Authorization Tests
Workflow Tests
Document Tests
PDF Tests
DOCX Tests
E2E
Performance Tests
Security Tests
```

Depois:

```text
Build
 ↓
Docker
 ↓
Migration
 ↓
Deploy
 ↓
Smoke Tests
 ↓
Release
```

---

# Regra que a IA deve seguir em TODAS as fases

Eu colocaria isto no `AGENTS.md`:

```text
============================================================
CICLO OBRIGATÓRIO DE EXECUÇÃO
============================================================

Para cada Sprint:

1. Ler a Sprint.
2. Ler as Tasks.
3. Ler AGENTS.md.
4. Ler ADRs relevantes.
5. Inspeccionar o código existente.
6. Criar plano.
7. Executar uma Task de cada vez.
8. Implementar.
9. Testar.
10. Corrigir.
11. Executar lint.
12. Executar typecheck.
13. Rever segurança.
14. Rever permissões.
15. Actualizar documentação.
16. Criar commit.
17. Actualizar estado da Task.
18. Só então passar para a próxima Task.

NUNCA saltar directamente para a próxima Sprint.

Uma Sprint só pode ser considerada concluída quando todas as suas Tasks
estiverem concluídas e validadas.
```

## E a regra mais importante

A IA **não deve tentar construir o SIP inteiro num único prompt**.

O fluxo deve ser:

```text
PROMPT 00
     ↓
Bootstrap
     ↓
COMMIT
     ↓
TASK-001
     ↓
TESTES
     ↓
COMMIT
     ↓
TASK-002
     ↓
TESTES
     ↓
COMMIT
     ↓
...
     ↓
SPRINT CONCLUÍDA
     ↓
PRÓXIMA SPRINT
```

Dessa forma, se uma IA cometer um erro na Sprint 04 do **Form Builder**, por exemplo, não precisas reconstruir o SIP inteiro: tens **commits, Tasks, ADRs, testes e checkpoints** para voltar a um estado estável.

**O ponto de partida concreto é, portanto, o `PROMPT 00 — Bootstrap/Architecture`; depois dele, a IA deve executar as Sprints na ordem acima, sem saltar etapas.**
