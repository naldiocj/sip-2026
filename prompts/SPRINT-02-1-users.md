Sim. Eu faria essa alteração na **SPRINT 02 — Gestão de Utilizadores**.

Há, porém, uma decisão importante: **a Gestão de Utilizadores deve permitir atribuir o utilizador à sua unidade organizacional**, mas não deve duplicar a implementação da Estrutura Organizacional. A Sprint 03 será responsável pelo domínio completo de pessoas, organização, lotação e atribuições.

Assim, na Sprint 02 criamos a **integração/contrato de atribuição organizacional** necessária para o utilizador, e na Sprint 03 aprofundamos esse domínio.

Abaixo está o prompt completo para o OpenCode.

```text
====================================================================
SIP — PROMPT 02
SPRINT 02 — GESTÃO DE UTILIZADORES
====================================================================

PROJECT:
SIP — Sistema de Instrução Processual

SPRINT:
SPRINT-02

TITLE:
Gestão de Utilizadores, Perfis, Permissões e Contexto Organizacional

STATUS:
PLANNED

====================================================================
1. MISSÃO
====================================================================

Implementar completamente o módulo de Gestão de Utilizadores do SIP.

O módulo deve permitir aos utilizadores autorizados:

- criar utilizadores;
- consultar utilizadores;
- pesquisar utilizadores;
- filtrar utilizadores;
- editar utilizadores;
- activar utilizadores;
- desactivar utilizadores;
- bloquear/desbloquear utilizadores;
- associar perfis;
- gerir permissões através dos perfis;
- consultar estado da conta;
- consultar actividade;
- atribuir contexto organizacional;
- atribuir Direcção;
- atribuir Departamento;
- atribuir Secção;
- atribuir Unidade;
- definir a atribuição principal;
- consultar o histórico das atribuições;
- auditar alterações.

O módulo deve integrar-se com:

- autenticação;
- JWT;
- RBAC;
- autorização;
- auditoria;
- estrutura organizacional;
- contexto de acesso.

====================================================================
2. PRINCÍPIO FUNDAMENTAL
====================================================================

SEPARAR:

USER
PERSON
PROFILE
PERMISSION
ORGANIZATIONAL ASSIGNMENT

Não transformar User numa entidade que contenha todos os dados
pessoais e funcionais.

Nesta Sprint:

USER
=
conta de acesso ao SIP.

PERSON
=
pessoa representada pela conta.

ORGANIZATIONAL ASSIGNMENT
=
contexto organizacional da conta.

PROFILE
=
papel de autorização no SIP.

PERMISSION
=
capacidade específica.

====================================================================
3. REGRA DE DEPENDÊNCIA
====================================================================

A SPRINT-01 deve fornecer:

- autenticação;
- JWT;
- User;
- Profile;
- Permission;
- RBAC;
- AuthorizationService.

A SPRINT-02 deve utilizar essas fundações.

A SPRINT-03 será responsável pelo domínio completo de:

- Person;
- Organization;
- OrganizationalUnit;
- Lotação;
- FunctionalRole;
- Responsibility;
- Delegation;
- Substitution.

NÃO duplicar esses domínios.

====================================================================
4. CONTEXTO ORGANIZACIONAL DO UTILIZADOR
====================================================================

Apesar de a estrutura organizacional completa pertencer à SPRINT-03,
a Gestão de Utilizadores deve possuir desde já a capacidade de atribuir
o contexto organizacional do utilizador.

O formulário do utilizador deve permitir:

Organização
    ↓
Direcção
    ↓
Departamento
    ↓
Secção
    ↓
Unidade

Nem todos os níveis precisam estar preenchidos.

Exemplos:

Utilizador → Direcção

Utilizador → Direcção + Departamento

Utilizador → Direcção + Departamento + Secção

Utilizador → Unidade

Utilizador → Direcção + Departamento + Secção + Unidade

====================================================================
5. CONCEITO DE ATRIBUIÇÃO
====================================================================

Criar/usar o conceito:

UserOrganizationalAssignment

Representa o contexto organizacional atribuído a um utilizador.

Não confundir com:

Person Assignment
Functional Responsibility
Delegation
Substitution

Nesta Sprint o foco é:

USER → CONTEXTO ORGANIZACIONAL.

====================================================================
6. ESTRUTURA DA ATRIBUIÇÃO
====================================================================

A atribuição deve suportar:

organization_id
direction_id
department_id
section_id
unit_id

OU, preferencialmente, uma referência à unidade organizacional
hierárquica que permita resolver os seus ancestrais.

Avaliar a arquitetura existente antes de implementar.

Não duplicar campos se OrganizationalUnit já existir.

====================================================================
7. RECOMENDAÇÃO ARQUITETURAL
====================================================================

Se a arquitetura da SPRINT-01 já possuir OrganizationalUnit:

Utilizar:

organizational_unit_id

e resolver:

organization
direction
department
section
unit

através da hierarquia.

Se OrganizationalUnit ainda não existir:

Criar apenas o contrato/interface necessário para a Sprint-02.

Não implementar uma segunda estrutura organizacional completa.

A SPRINT-03 deverá consolidar o domínio.

====================================================================
8. ATRIBUIÇÃO PRINCIPAL
====================================================================

Um utilizador pode possuir uma ou várias atribuições.

Deve existir:

is_primary

Somente uma atribuição activa pode ser principal.

Exemplo:

USER
João Manuel

Atribuição Principal:
Direcção de Investigação

Atribuição Secundária:
Departamento X

Quando o contexto não for explicitamente escolhido,
utilizar a atribuição principal.

====================================================================
9. PERÍODO DA ATRIBUIÇÃO
====================================================================

A atribuição deve suportar:

start_date
end_date
status

Estados humanizados:

Activa
Inactiva
Agendada
Expirada

Não apagar atribuições históricas.

====================================================================
10. HISTÓRICO
====================================================================

Quando a atribuição mudar:

NÃO sobrescrever silenciosamente.

Manter histórico.

Exemplo:

01/01/2026
Direcção A

01/05/2026
Direcção B

01/08/2026
Direcção B
Departamento X

O sistema deve conseguir reconstruir o histórico.

====================================================================
11. PERFIS DO SIP
====================================================================

Utilizar os perfis oficiais:

ADMINISTRADOR_SISTEMA
DIRECTOR
SECRETARIA_GERAL
CHEFE_DEPARTAMENTO
CHEFE_SECCAO
INSTRUTOR_PROCESSUAL
AGENTE_PIQUETE
EDITOR_DOCUMENTAL
AGENTE_PGR

Labels:

Administrador
Director
Secretaria Geral
Chefe de Departamento
Chefe de Secção
Instrutor Processual
Agente de Piquete
Editor Documental
Agente PGR

NÃO apresentar os enums técnicos na interface.

====================================================================
12. PERFIS E CONTEXTO ORGANIZACIONAL
====================================================================

O perfil NÃO determina sozinho o contexto organizacional.

Exemplo:

INSTRUTOR_PROCESSUAL

não significa:

"ver todos os processos".

O utilizador deverá possuir:

Profile
+
Organizational Assignment
+
Responsibility
+
Ownership

quando os módulos funcionais forem implementados.

====================================================================
13. ADMINISTRADOR
====================================================================

O Administrador pode:

- criar utilizadores;
- editar utilizadores;
- activar;
- desactivar;
- bloquear;
- desbloquear;
- atribuir perfil;
- alterar perfil;
- atribuir contexto organizacional;
- alterar contexto;
- consultar histórico;
- consultar auditoria.

Sempre respeitando as permissões.

====================================================================
14. CRIAÇÃO DE UTILIZADOR
====================================================================

Criar formulário profissional:

---------------------------------
DADOS DA CONTA
---------------------------------

Nome de utilizador
Email
Estado

---------------------------------
PERFIL
---------------------------------

Perfil principal

---------------------------------
CONTEXTO ORGANIZACIONAL
---------------------------------

Direcção
Departamento
Secção
Unidade

[ ] Atribuição principal

---------------------------------
SEGURANÇA
---------------------------------

Estado da conta

---------------------------------

Guardar
Cancelar

====================================================================
15. CAMPOS ORGANIZACIONAIS
====================================================================

Implementar seleção hierárquica.

Fluxo:

Direcção
    ↓
Departamento
    ↓
Secção
    ↓
Unidade

Quando o utilizador seleccionar uma Direcção:

carregar apenas os Departamentos dessa Direcção.

Quando seleccionar Departamento:

carregar apenas as Secções desse Departamento.

Quando seleccionar Secção:

carregar apenas as Unidades dessa Secção.

Não carregar toda a estrutura desnecessariamente.

====================================================================
16. DEPENDÊNCIA DOS SELECTS
====================================================================

Exemplo:

Direcção:
[ Direcção de Investigação ]

Departamento:
[ Departamento de Crimes Económicos ]

Secção:
[ Secção de Investigação ]

Unidade:
[ Unidade X ]

Se Direcção mudar:

limpar seleções inferiores incompatíveis.

Exemplo:

Direcção alterada
→ Departamento resetado
→ Secção resetada
→ Unidade resetada

====================================================================
17. COMBOBOX
====================================================================

Não utilizar select HTML simples para estruturas grandes.

Utilizar:

Combobox
Command
Autocomplete

com:

- pesquisa;
- loading;
- empty state;
- error state;
- clear;
- keyboard navigation.

====================================================================
18. VISUALIZAÇÃO DA HIERARQUIA
====================================================================

Na selecção apresentar o caminho:

Direcção de Investigação
/
Departamento de Crimes Económicos
/
Secção de Investigação
/
Unidade X

Isso permite ao administrador compreender exactamente onde o utilizador
está atribuído.

====================================================================
19. ATRIBUIÇÕES MÚLTIPLAS
====================================================================

Na página de detalhe do utilizador:

TAB:
Atribuições

Mostrar:

| Contexto | Tipo | Principal | Início | Fim | Estado | Acções |

Exemplo:

Direcção X
Departamento Y
Secção Z
Unidade A

Principal
01/01/2026
Activo

====================================================================
20. ADICIONAR ATRIBUIÇÃO
====================================================================

Criar modal/drawer:

Adicionar atribuição

Campos:

Direcção
Departamento
Secção
Unidade
Data de início
Data de fim
Principal

Botões:

Cancelar
Adicionar

O componente deve ser responsivo.

====================================================================
21. EDITAR ATRIBUIÇÃO
====================================================================

Permitir:

- alterar unidade;
- alterar contexto;
- alterar período;
- definir como principal;
- terminar atribuição.

Alterações críticas devem solicitar confirmação.

====================================================================
22. TERMINAR ATRIBUIÇÃO
====================================================================

Não apagar.

Executar:

end_assignment()

Definir:

end_date
status = INACTIVE

Registar auditoria.

====================================================================
23. REGRAS DE VALIDAÇÃO
====================================================================

Impedir:

- Departamento de outra Direcção;
- Secção de outro Departamento;
- Unidade de outra Secção;
- duas atribuições principais activas;
- período inválido;
- data final anterior à inicial;
- unidade inactiva;
- estrutura inexistente.

====================================================================
24. UTILIZADOR SEM ATRIBUIÇÃO
====================================================================

Permitir que um utilizador administrativo exista inicialmente sem
atribuição organizacional, caso o fluxo institucional permita.

Mas:

o sistema deve indicar claramente:

"Sem atribuição organizacional"

Não inventar contexto.

====================================================================
25. CONTEXTO DO UTILIZADOR
====================================================================

Criar endpoint:

GET /api/v1/me/context

Retornar:

user
profile
permissions
primary_assignment
assignments

Quando a estrutura organizacional estiver disponível:

organization
direction
department
section
unit

====================================================================
26. ACCESS CONTEXT
====================================================================

Preparar integração com:

AccessContext

Estrutura conceptual:

AccessContext
├── user
├── person
├── profiles
├── permissions
├── primary_assignment
├── assignments
└── effective_scopes

Não implementar ainda regras específicas de processos.

====================================================================
27. USER LIST
====================================================================

Criar:

/administracao/utilizadores

Tabela profissional utilizando:

TanStack Table
TanStack Query
shadcn/ui

Colunas sugeridas:

Utilizador
Nome
Email
Perfil
Direcção
Departamento
Secção
Unidade
Estado
Último acesso
Acções

====================================================================
28. FILTROS
====================================================================

Implementar:

Pesquisa
Perfil
Estado
Direcção
Departamento
Secção
Unidade

Humanizar:

DIRECTOR
→ Director

ACTIVE
→ Activo

CHEFE_SECCAO
→ Chefe de Secção

Nunca mostrar enum técnico.

====================================================================
29. PESQUISA
====================================================================

Pesquisar por:

username
nome
email
perfil

Quando disponível:

person_number
employee_number

Utilizar debounce.

====================================================================
30. PAGINAÇÃO
====================================================================

A listagem deve ser server-side.

Não carregar todos os utilizadores para o browser.

Suportar:

page
page_size
sort
filters
search

====================================================================
31. USER DETAIL
====================================================================

Criar:

/administracao/utilizadores/[id]

Apresentar:

Resumo
Conta
Perfil
Contexto organizacional
Atribuições
Segurança
Actividade
Histórico
Auditoria

====================================================================
32. USER ACTIONS
====================================================================

Ações:

Editar
Activar
Desactivar
Bloquear
Desbloquear
Alterar perfil
Gerir atribuições
Consultar auditoria

Mostrar apenas ações autorizadas.

====================================================================
33. ESTADOS
====================================================================

Estados da conta:

ACTIVE
INACTIVE
BLOCKED
SUSPENDED

Labels:

Activo
Inactivo
Bloqueado
Suspenso

====================================================================
34. DESACTIVAÇÃO
====================================================================

Ao desactivar:

- impedir login;
- manter histórico;
- não apagar dados;
- registar auditoria;
- invalidar sessões conforme arquitectura existente.

====================================================================
35. BLOQUEIO
====================================================================

Bloqueio deve ser distinto de desactivação.

BLOCKED:

conta temporariamente impedida.

INACTIVE:

conta desactivada administrativamente.

====================================================================
36. PERFIL DO UTILIZADOR
====================================================================

Permitir alterar perfil somente quando o operador possuir a permissão
necessária.

Não permitir que utilizadores comuns alterem o próprio perfil.

====================================================================
37. GESTÃO DE PERMISSÕES
====================================================================

Nesta Sprint:

utilizar RBAC da SPRINT-01.

Não criar autorização espalhada pelo frontend.

Frontend:

esconde/mostra UI.

Backend:

valida autorização.

====================================================================
38. SIDEBAR
====================================================================

Actualizar Sidebar:

ADMINISTRAÇÃO
│
├── Utilizadores
├── Perfis e Permissões
└── Estrutura Organizacional

ATENÇÃO:

A Estrutura Organizacional completa será desenvolvida na SPRINT-03.

Nesta Sprint, se a rota ainda não possuir implementação completa,
não apresentar funcionalidades falsas.

====================================================================
39. API
====================================================================

Implementar:

GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{id}
PATCH  /api/v1/users/{id}

POST   /api/v1/users/{id}/activate
POST   /api/v1/users/{id}/deactivate

POST   /api/v1/users/{id}/block
POST   /api/v1/users/{id}/unblock

GET    /api/v1/users/{id}/assignments
POST   /api/v1/users/{id}/assignments
PATCH  /api/v1/users/{id}/assignments/{assignment_id}
POST   /api/v1/users/{id}/assignments/{assignment_id}/end

GET    /api/v1/me/context

Adaptar nomes às convenções existentes.

====================================================================
40. SCHEMAS
====================================================================

Criar Pydantic schemas apropriados:

UserCreate
UserUpdate
UserResponse
UserListItem

UserAssignmentCreate
UserAssignmentUpdate
UserAssignmentResponse

UserContextResponse

Não expor entidades SQLAlchemy directamente.

====================================================================
41. SERVICE LAYER
====================================================================

Criar serviços:

UserService
UserAssignmentService
UserContextService

Responsabilidades:

UserService
→ ciclo de vida do utilizador.

UserAssignmentService
→ contexto organizacional.

UserContextService
→ contexto efectivo.

====================================================================
42. REPOSITORIES
====================================================================

Se o padrão de repository já existir no projecto:

seguir o padrão.

Não introduzir repository pattern apenas por moda.

Manter consistência com a SPRINT-01.

====================================================================
43. TRANSACTIONS
====================================================================

Operações críticas devem ser transacionais.

Exemplo:

definir nova atribuição principal

deve garantir que:

não existem duas principais activas.

====================================================================
44. AUDITORIA
====================================================================

Registar:

USER_CREATED
USER_UPDATED
USER_ACTIVATED
USER_DEACTIVATED
USER_BLOCKED
USER_UNBLOCKED

USER_PROFILE_ASSIGNED
USER_PROFILE_CHANGED
USER_PROFILE_REMOVED

USER_ASSIGNMENT_CREATED
USER_ASSIGNMENT_UPDATED
USER_ASSIGNMENT_ENDED
USER_PRIMARY_ASSIGNMENT_CHANGED

Não guardar passwords ou tokens.

====================================================================
45. SEGURANÇA
====================================================================

Garantir:

RBAC
AuthorizationService
permission checks
object-level authorization

Não confiar no:

profile
user_id
organization_id

enviado pelo frontend.

O backend deve validar todos os relacionamentos.

====================================================================
46. PREVENÇÃO DE ESCALADA
====================================================================

Um utilizador não deve conseguir:

- atribuir-se a outra Direcção;
- atribuir-se perfil administrativo;
- alterar o próprio contexto privilegiado;
- atribuir outro utilizador a uma unidade fora do seu escopo;

sem permissão explícita.

====================================================================
47. FRONTEND
====================================================================

Stack:

Next.js
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
TanStack Query
TanStack Table

Seguir os padrões definidos na SPRINT-00.

====================================================================
48. UI
====================================================================

Criar interface de nível profissional.

Utilizar:

cards
tabs
badges
dropdown menus
command
combobox
dialogs
drawers
tooltips
skeletons
empty states

Evitar interface CRUD genérica.

====================================================================
49. RESPONSIVE
====================================================================

Desktop:

tabela completa.

Tablet:

colunas adaptadas.

Mobile:

cards/listagem adaptada.

Formulários:

layout adaptativo.

====================================================================
50. MODAIS
====================================================================

Os modais devem:

- adaptar tamanho;
- possuir scroll interno;
- possuir header;
- possuir footer;
- possuir estados loading;
- possuir validação;
- fechar correctamente;
- manter acessibilidade.

Para formulários complexos preferir Drawer ou Dialog adequado.

====================================================================
51. ACESSIBILIDADE
====================================================================

Garantir:

keyboard navigation
focus management
aria labels
contraste
screen reader support

====================================================================
52. TESTES UNITÁRIOS
====================================================================

Testar:

UserService
UserAssignmentService
UserContextService

Casos:

create user
update user
activate
deactivate
block
unblock
assign profile
create assignment
update assignment
end assignment
primary assignment
invalid hierarchy
duplicate primary

====================================================================
53. TESTES DE AUTORIZAÇÃO
====================================================================

Testar todos os perfis:

Administrador
Director
Secretaria Geral
Chefe de Departamento
Chefe de Secção
Instrutor Processual
Agente de Piquete
Editor Documental
Agente PGR

Verificar:

quem pode listar;
quem pode criar;
quem pode editar;
quem pode administrar;
quem pode atribuir contexto.

====================================================================
54. E2E
====================================================================

E2E-001

Administrador
→ Gestão de Utilizadores
→ Criar utilizador
→ atribuir perfil
→ atribuir Direcção
→ atribuir Departamento
→ atribuir Secção
→ atribuir Unidade
→ marcar principal
→ guardar.

Resultado:

utilizador criado correctamente.

------------------------------------------------------------

E2E-002

Administrador
→ abrir utilizador
→ adicionar segunda atribuição
→ definir como secundária.

Resultado:

duas atribuições válidas.

------------------------------------------------------------

E2E-003

Administrador
→ alterar atribuição principal.

Resultado:

atribuição anterior deixa de ser principal.

------------------------------------------------------------

E2E-004

Utilizador não autorizado
→ tentar alterar atribuição.

Resultado:

403 Forbidden.

------------------------------------------------------------

E2E-005

Utilizador
→ GET /me/context

Resultado:

contexto correcto.

====================================================================
55. TESTES DE INTEGRIDADE
====================================================================

Testar:

Direcção A
Departamento B pertencente à Direcção C

Resultado:

REJECT.

Secção A
Departamento B incompatível

Resultado:

REJECT.

Unidade A
Secção incompatível

Resultado:

REJECT.

Duas atribuições PRIMARY activas

Resultado:

REJECT.

====================================================================
56. PERFORMANCE
====================================================================

Não carregar toda a hierarquia em cada request.

Utilizar:

pagination
lazy loading
server-side filtering
indexes

Selects dependentes devem consultar apenas o nível necessário.

====================================================================
57. DATABASE
====================================================================

Utilizar:

PostgreSQL
SQLAlchemy
Alembic

Toda alteração deve possuir migration.

Não alterar schema manualmente.

====================================================================
58. INDEXES
====================================================================

Avaliar índices para:

username
email
status
profile_id
organizational_unit_id
start_date
end_date

Criar apenas os índices necessários.

====================================================================
59. OPENAPI
====================================================================

Documentar:

Users
Profiles
Assignments
Context

Swagger deve suportar JWT conforme definido na SPRINT-01.

====================================================================
60. DOCUMENTAÇÃO
====================================================================

Criar:

docs/sprints/SPRINT-02.md

docs/architecture/user-management.md

docs/architecture/user-organizational-context.md

Actualizar documentação existente.

====================================================================
61. TASKS
====================================================================

Criar:

prompts/tasks/sprint-02/

TASK-001-user-management-audit.md
TASK-002-user-list.md
TASK-003-user-create.md
TASK-004-user-update.md
TASK-005-user-status.md
TASK-006-user-profile-management.md
TASK-007-user-organizational-context.md
TASK-008-user-assignment-model.md
TASK-009-user-assignment-api.md
TASK-010-user-assignment-ui.md
TASK-011-user-detail.md
TASK-012-user-security.md
TASK-013-user-audit.md
TASK-014-user-tests.md
TASK-015-user-e2e.md
TASK-016-user-documentation.md
TASK-017-final-review.md

====================================================================
62. EXECUÇÃO DAS TASKS
====================================================================

Executar sequencialmente.

Para cada Task:

1. Ler Task.
2. Identificar dependências.
3. Seleccionar skills.
4. Planear.
5. Implementar.
6. Testar.
7. Rever.
8. Actualizar documentação.
9. Marcar Task DONE.
10. Criar commit.

Não avançar se a Task anterior estiver quebrada.

====================================================================
63. COMMITS
====================================================================

Utilizar Conventional Commits.

Exemplos:

feat(users): implement user management

feat(users): add user profile management

feat(users): add organizational context

feat(users): add user assignments

feat(users): add assignment validation

feat(users): add user administration UI

test(users): add authorization tests

test(users): add assignment tests

docs(users): document user management

====================================================================
64. CHECKPOINTS
====================================================================

CHECKPOINT A
User CRUD

CHECKPOINT B
Profile management

CHECKPOINT C
User status/security

CHECKPOINT D
Organizational context

CHECKPOINT E
Assignment

CHECKPOINT F
Frontend

CHECKPOINT G
Security

CHECKPOINT H
Tests

CHECKPOINT I
Documentation

Cada checkpoint deve terminar com:

lint
typecheck
tests
build

e commit.

====================================================================
65. DEFINITION OF DONE
====================================================================

[ ] User CRUD
[ ] User search
[ ] User filtering
[ ] User pagination
[ ] User detail
[ ] Profile management
[ ] Account status
[ ] Activate
[ ] Deactivate
[ ] Block
[ ] Unblock
[ ] Organizational context
[ ] Direcção
[ ] Departamento
[ ] Secção
[ ] Unidade
[ ] Dependent selectors
[ ] Primary assignment
[ ] Secondary assignment
[ ] Assignment history
[ ] Assignment validation
[ ] Access Context
[ ] Authorization
[ ] Audit
[ ] API
[ ] OpenAPI
[ ] Frontend
[ ] Sidebar
[ ] Responsive UI
[ ] Accessibility
[ ] Unit tests
[ ] Integration tests
[ ] Authorization tests
[ ] E2E
[ ] Documentation
[ ] Migrations
[ ] Seeds
[ ] Lint PASS
[ ] Typecheck PASS
[ ] Build PASS
[ ] Tests PASS
[ ] Todas as Tasks DONE

====================================================================
66. REGRA DE TRANSIÇÃO PARA SPRINT-03
====================================================================

Depois de terminar esta Sprint:

NÃO implementar a estrutura organizacional completa.

A SPRINT-03 deverá consolidar:

PERSON
ORGANIZATION
ORGANIZATIONAL UNIT
LOTACAO
FUNCTIONAL ROLE
RESPONSIBILITY
DELEGATION
SUBSTITUTION

A atribuição criada nesta Sprint deve ser compatível com esses modelos.

Se durante a implementação for necessário criar uma entidade temporária,
NÃO criar uma solução incompatível com a SPRINT-03.

Preferir contratos e modelos extensíveis.

====================================================================
67. NÃO IMPLEMENTAR
====================================================================

Nesta Sprint NÃO implementar:

Form Builder
Document Engine
PDF
DOCX
Participações
Denúncias
Autos
Processos
Instrução Processual
Piquete funcional
Mandados
BRP
PGR workflow
Dashboards
Relatórios funcionais

Esses módulos pertencem às Sprints posteriores.

====================================================================
68. FINALIZAÇÃO
====================================================================

Quando tudo estiver concluído:

1. executar testes;
2. executar lint;
3. executar typecheck;
4. executar build;
5. executar E2E;
6. executar security review;
7. rever migrations;
8. rever documentação;
9. rever tasks;
10. rever commits.

Actualizar:

docs/sprints/SPRINT-02.md

Status:

DONE

Criar commit final:

chore(sprint-02): complete user management

====================================================================
69. RELATÓRIO FINAL OBRIGATÓRIO
====================================================================

Apresentar:

1. resumo da implementação;
2. Tasks concluídas;
3. entidades criadas/alteradas;
4. migrations;
5. endpoints;
6. componentes frontend;
7. regras RBAC;
8. regras de atribuição;
9. regras de segurança;
10. auditoria;
11. testes;
12. E2E;
13. documentação;
14. commits;
15. problemas encontrados;
16. débitos técnicos;
17. dependências para SPRINT-03.

====================================================================
70. REGRA FINAL
====================================================================

NÃO iniciar automaticamente a SPRINT-03.

Após concluir esta Sprint:

PARAR.

Aguardar autorização explícita.

Próxima Sprint:

SPRINT-03 — Gestão de Pessoas, Estrutura Organizacional,
Lotação, Funções, Responsabilidades e Atribuições.

====================================================================
FIM DO PROMPT — SPRINT 02
====================================================================
```

### Uma alteração importante no roadmap

Com esta decisão, a sequência fica mais limpa:

```text
SPRINT 00
Bootstrap + Arquitetura
        ↓
SPRINT 01
Autenticação + RBAC + Autorização
        ↓
SPRINT 02
GESTÃO DE UTILIZADORES
        │
        ├── Perfis
        ├── Permissões
        ├── Estado da conta
        ├── Direcção
        ├── Departamento
        ├── Secção
        ├── Unidade
        └── Atribuição organizacional
        ↓
SPRINT 03
GESTÃO DE PESSOAS + ORGANIZAÇÃO
        │
        ├── Person
        ├── Dados funcionais
        ├── Estrutura organizacional completa
        ├── Lotação
        ├── Funções
        ├── Responsabilidades
        ├── Delegação
        └── Substituição
        ↓
SPRINT 04
NOTIFICAÇÕES + EVENTOS
        ↓
SPRINT 05
FORM BUILDER + MOTOR DOCUMENTAL
        ↓
SPRINT 06
ENTRADA DE PEÇAS
        │
        ├── Denúncias
        ├── Participações
        └── Autos
        ↓
SPRINT 07
PROCESSOS
```

**O ponto mais importante:** na tela de criação/edição do utilizador teremos efetivamente **Direcção → Departamento → Secção → Unidade**, mas isso será tratado como **contexto organizacional do utilizador**, não como se o utilizador fosse a própria estrutura organizacional. Isso deixa o modelo preparado para que, na SPRINT 03, possamos associar esse mesmo utilizador a uma `Person`, lotação, função e responsabilidades sem refazer a arquitetura.
