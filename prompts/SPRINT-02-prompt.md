====================================================================
SIP — PROMPT 02
SPRINT 02 — ADMINISTRAÇÃO, GESTÃO DE PESSOAS,
ESTRUTURA ORGANIZACIONAL, LOTAÇÃO E ATRIBUIÇÕES
====================================================================

PROJECT:
SIP — Sistema de Instrução Processual

SPRINT:
SPRINT-02

STATUS INICIAL:
PLANNED

====================================================================
1. OBJETIVO
====================================================================

Implementar a fundação administrativa, organizacional e funcional
do SIP.

Esta Sprint deve criar a estrutura necessária para representar:

- pessoas;
- utilizadores;
- perfis;
- permissões;
- organização;
- direções;
- departamentos;
- secções;
- unidades;
- piquetes;
- lotações;
- funções;
- atribuições;
- responsabilidades;
- delegações;
- substituições;
- contexto organizacional;
- contexto de acesso;
- histórico;
- auditoria.

Esta Sprint será utilizada posteriormente por:

- módulo de documentos;
- Form Builder;
- entrada de peças;
- Piquete;
- processos;
- distribuição;
- despacho;
- instrução processual;
- mandados;
- BRP;
- PGR;
- notificações;
- relatórios.

====================================================================
2. REGRA ARQUITETURAL FUNDAMENTAL
====================================================================

NÃO misturar:

PERSON
USER
PROFILE
PERMISSION
ORGANIZATION
ORGANIZATIONAL UNIT
ASSIGNMENT
RESPONSIBILITY
SCOPE
OWNERSHIP

Cada conceito deve possuir responsabilidade própria.

A arquitetura deve evitar entidades gigantes e modelos excessivamente
acoplados.

====================================================================
3. CICLO OBRIGATÓRIO
====================================================================

Utilizar obrigatoriamente o lifecycle definido no AGENTS.md:

DEFINE
 ↓
PLAN
 ↓
BUILD
 ↓
VERIFY
 ↓
REVIEW
 ↓
SHIP

Antes de cada Task:

1. interpretar o objetivo;
2. consultar as Agent Skills;
3. selecionar as skills aplicáveis;
4. criar/actualizar a especificação;
5. criar plano;
6. implementar;
7. testar;
8. revisar;
9. documentar;
10. criar commit.

NÃO saltar directamente para implementação.

====================================================================
4. SKILLS
====================================================================

Utilizar as Agent Skills já instaladas no projecto.

Seleccionar automaticamente as skills relevantes.

Possíveis categorias:

- specification;
- planning;
- architecture;
- backend;
- frontend;
- database;
- testing;
- security;
- debugging;
- code review;
- documentation;
- shipping.

NÃO executar skills que não sejam necessárias.

====================================================================
5. PRÉ-CONDIÇÕES
====================================================================

Antes de iniciar:

LER:

AGENTS.md

README.md

docs/architecture/

docs/sprints/SPRINT-00.md

docs/sprints/SPRINT-01.md

prompts/tasks/

Verificar:

- arquitetura;
- stack;
- convenções;
- padrões;
- decisões anteriores;
- Agent Skills.

Executar:

backend tests
frontend tests
E2E
lint
typecheck
build

Se a SPRINT-01 estiver quebrada:

PARAR.

Corrigir primeiro.

====================================================================
6. STACK OBRIGATÓRIA
====================================================================

BACKEND:

Python
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL
Redis

FRONTEND:

Next.js
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
TanStack Query
TanStack Table

INFRAESTRUTURA:

PostgreSQL
Redis
MinIO quando necessário
RabbitMQ quando necessário

OBSERVABILIDADE:

Utilizar apenas a stack de observabilidade definida na
SPRINT-00.

NÃO adicionar ferramentas de observabilidade desnecessárias.

====================================================================
7. ARQUITETURA
====================================================================

Manter:

MODULAR MONOLITH

Não implementar microservices.

Separar claramente:

domain
application
infrastructure
presentation

quando isso estiver alinhado com a arquitetura existente.

Evitar overengineering.

====================================================================
8. SPRINT DOCUMENT
====================================================================

Criar:

docs/sprints/SPRINT-02.md

Conteúdo:

# SPRINT-02
# Administração, Gestão de Pessoas, Estrutura Organizacional,
# Lotação e Atribuições

Status:
IN_PROGRESS

Objetivo:
...

Tasks:
...

Dependencies:
...

Architecture:
...

Acceptance Criteria:
...

Definition of Done:
...

====================================================================
9. TASK DIRECTORY
====================================================================

Criar:

prompts/tasks/sprint-02/

====================================================================
10. TASKS
====================================================================

Criar:

TASK-001-person-domain.md
TASK-002-person-functional-data.md
TASK-003-user-person-association.md
TASK-004-profile-permission-integration.md
TASK-005-organization-domain.md
TASK-006-organizational-unit.md
TASK-007-organizational-hierarchy.md
TASK-008-organizational-unit-types.md
TASK-009-user-assignment.md
TASK-010-lotacao.md
TASK-011-functional-role.md
TASK-012-responsibility.md
TASK-013-delegation.md
TASK-014-substitution.md
TASK-015-access-context.md
TASK-016-scope-engine.md
TASK-017-organization-api.md
TASK-018-person-management-api.md
TASK-019-assignment-api.md
TASK-020-organization-ui.md
TASK-021-person-management-ui.md
TASK-022-assignment-ui.md
TASK-023-organization-tree.md
TASK-024-audit-integration.md
TASK-025-security-review.md
TASK-026-backend-tests.md
TASK-027-frontend-tests.md
TASK-028-e2e-tests.md
TASK-029-documentation.md
TASK-030-final-review.md

Cada Task deve conter:

Objective
Context
Dependencies
Skills
Scope
Out of Scope
Implementation
Acceptance Criteria
Tests
Definition of Done

====================================================================
11. PERSON
====================================================================

Criar entidade:

Person

Representa uma pessoa real conhecida pelo SIP.

Não assumir que toda Person possui User.

Campos mínimos:

id
person_number
full_name
preferred_name
birth_date
birth_place
nationality
gender quando necessário
bi_number quando aplicável
phone
email
address
status
created_at
updated_at

Adicionar apenas campos necessários.

====================================================================
12. PERSON NUMBER
====================================================================

Criar identificador interno:

person_number

Exemplo:

PES-000001

Não utilizar BI como chave primária.

O BI não deve ser utilizado como identificador técnico principal.

====================================================================
13. DADOS PESSOAIS
====================================================================

Separar conceptualmente:

dados pessoais
dados funcionais
dados de autenticação.

Nunca colocar password ou informação de autenticação em Person.

====================================================================
14. DADOS FUNCIONAIS
====================================================================

Preparar estrutura para:

employee_number
functional_category
job_title
admission_date
employment_status
professional_registration
notes

Não assumir uma estrutura de RH completa.

O SIP deve armazenar apenas dados funcionais necessários ao sistema.

====================================================================
15. PERSON STATUS
====================================================================

Utilizar estados apropriados.

Exemplo:

ACTIVE
INACTIVE
RETIRED
DECEASED
UNKNOWN

Não implementar estados que não tenham significado funcional.

====================================================================
16. USER ↔ PERSON
====================================================================

Um User pode estar associado a uma Person.

Modelo:

Person
  │
  └── User

Uma Person pode existir sem User.

Evitar:

User conter todos os dados da Person.

====================================================================
17. USER ASSOCIATION
====================================================================

Criar mecanismo para:

associate_user_to_person()
unlink_user_from_person()

Garantir integridade.

Uma conta SIP não deve estar associada simultaneamente a duas pessoas
sem regra explícita.

====================================================================
18. PERFIS
====================================================================

Reutilizar os perfis criados na SPRINT-01:

ADMINISTRADOR_SISTEMA
DIRECTOR
SECRETARIA_GERAL
CHEFE_DEPARTAMENTO
CHEFE_SECCAO
INSTRUTOR_PROCESSUAL
AGENTE_PIQUETE
EDITOR_DOCUMENTAL
AGENTE_PGR

Não duplicar Profile.

====================================================================
19. PERMISSIONS
====================================================================

Reutilizar Permission da SPRINT-01.

Adicionar somente permissões necessárias para Administração.

Exemplos:

person.read
person.create
person.update
person.deactivate

organization.read
organization.create
organization.update
organization.manage

assignment.read
assignment.create
assignment.update
assignment.end

responsibility.read
responsibility.manage

delegation.read
delegation.manage

Não criar centenas de permissões desnecessárias.

====================================================================
20. ORGANIZATION
====================================================================

Criar:

Organization

Representa uma organização institucional.

Campos:

id
code
name
short_name
description
organization_type
status
created_at
updated_at

====================================================================
21. ORGANIZATION TYPE
====================================================================

Preparar:

INTERNAL
EXTERNAL

Isso permitirá posteriormente representar:

SIC
PGR
outras entidades.

Não implementar interoperabilidade PGR agora.

====================================================================
22. ORGANIZATIONAL UNIT
====================================================================

Criar:

OrganizationalUnit

Campos:

id
organization_id
parent_id
type_id
code
name
short_name
description
status
created_at
updated_at

====================================================================
23. UNIT TYPES
====================================================================

Criar:

ORGANIZATION
DIRECTION
DEPARTMENT
SECTION
UNIT
PIQUETE
OTHER

Humanização:

Organização
Direcção
Departamento
Secção
Unidade
Piquete
Outra Unidade

====================================================================
24. HIERARQUIA
====================================================================

Utilizar parent_id ou solução equivalente.

Exemplo:

SIC
│
├── Direcção A
│   ├── Departamento A1
│   │   ├── Secção A1.1
│   │   └── Secção A1.2
│   │
│   └── Departamento A2
│
└── Direcção B

Não assumir que todas as unidades precisam possuir pai.

====================================================================
25. HIERARCHY SERVICE
====================================================================

Implementar operações:

get_parent()
get_children()
get_ancestors()
get_descendants()
get_root()
get_path()

Criar serviço central.

Não duplicar lógica nos endpoints.

====================================================================
26. INTEGRIDADE HIERÁRQUICA
====================================================================

Impedir:

- unidade ser pai de si própria;
- ciclos;
- parent inexistente;
- parent de organização diferente;
- hierarquia inconsistente.

Testar obrigatoriamente.

====================================================================
27. USER ASSIGNMENT
====================================================================

Criar:

UserAssignment

Relaciona:

User
+
OrganizationalUnit

Campos:

id
user_id
organizational_unit_id
assignment_type
is_primary
start_date
end_date
status
created_at
updated_at

====================================================================
28. ASSIGNMENT TYPE
====================================================================

Suportar:

PRIMARY
SECONDARY
TEMPORARY
ACTING
DELEGATED

Humanização:

Principal
Secundária
Temporária
Em substituição
Delegada

====================================================================
29. LOTAÇÃO
====================================================================

A lotação representa a colocação organizacional da pessoa/utilizador.

Não confundir lotação com perfil.

Exemplo:

Pessoa:
João

Perfil:
Instrutor Processual

Lotação:
Direcção X
→ Departamento Y
→ Secção Z

====================================================================
30. HISTÓRICO DE LOTAÇÃO
====================================================================

Não apagar alterações de lotação.

Manter:

start_date
end_date

Isso permitirá saber:

onde a pessoa estava;
quando esteve;
quando saiu.

====================================================================
31. PRIMARY ASSIGNMENT
====================================================================

Permitir uma unidade principal.

Regra:

Um User não deve possuir duas atribuições PRIMARY activas
simultaneamente.

Criar validação.

====================================================================
32. MULTIPLE ASSIGNMENTS
====================================================================

Permitir:

User
→ Unidade A
→ Unidade B

quando autorizado.

A unidade principal será usada como contexto padrão.

====================================================================
33. FUNCTIONAL ROLE
====================================================================

Não confundir:

Profile

com:

Functional Role.

Profile:

define permissões dentro do SIP.

Functional Role:

define função exercida na estrutura institucional.

Criar conceito:

FunctionalRole

Exemplos:

Director
Chefe de Departamento
Chefe de Secção
Instrutor
Editor
Agente de Piquete

O sistema deve permitir futuramente que uma pessoa possua função
diferente do profile técnico.

====================================================================
34. RESPONSIBILITY
====================================================================

Criar:

Responsibility

Representa responsabilidade funcional.

Campos conceptuais:

id
user_id
type
organizational_unit_id
resource_type quando aplicável
start_date
end_date
status

====================================================================
35. RESPONSIBILITY TYPES
====================================================================

Preparar:

GLOBAL
ORGANIZATION
DIRECTION
DEPARTMENT
SECTION
OWN
ASSIGNED
PIQUETE
PGR

Não implementar regras específicas de processos ainda.

====================================================================
36. DELEGATION
====================================================================

Criar suporte a delegações.

Exemplo:

Director A
delegou responsabilidade
ao Director B

Campos:

id
delegator_user_id
delegate_user_id
scope
organizational_unit_id
start_date
end_date
reason
status

====================================================================
37. SUBSTITUTION
====================================================================

Preparar suporte para substituição temporária.

Exemplo:

Chefe de Secção A
substituído por
Chefe de Secção B

Não criar lógica de RH.

Apenas a capacidade necessária para o contexto SIP.

====================================================================
38. DELEGATION ≠ SUBSTITUTION
====================================================================

Não tratar como a mesma coisa.

Delegação:

alguém transfere determinada responsabilidade.

Substituição:

alguém passa temporariamente a exercer determinada função.

Manter conceitos separados.

====================================================================
39. ACCESS SCOPE
====================================================================

Integrar com o AuthorizationService da SPRINT-01.

O acesso futuro deverá poder considerar:

Permission
+
Profile
+
Organization
+
Assignment
+
Responsibility
+
Ownership
+
Delegation

====================================================================
40. ACCESS CONTEXT
====================================================================

Criar:

AccessContext

Deve disponibilizar:

user
person
profiles
permissions
organization
primary_assignment
assignments
responsibilities
delegations
effective_scopes

Não colocar toda a lógica de negócio dentro deste objeto.

====================================================================
41. CONTEXTO ATUAL
====================================================================

Criar:

GET /api/v1/me/context

Retornar contexto autenticado.

Exemplo conceptual:

{
  "user": {},
  "person": {},
  "profiles": [],
  "organization": {},
  "primary_assignment": {},
  "assignments": [],
  "responsibilities": [],
  "effective_scopes": []
}

Não retornar dados sensíveis desnecessários.

====================================================================
42. ORGANIZATION API
====================================================================

Implementar conforme necessário:

GET
POST
GET /{id}
PATCH
DELETE ou deactivate quando apropriado

para:

Organizations
Organizational Units

Utilizar desactivação quando o histórico precisar ser preservado.

====================================================================
43. PERSON API
====================================================================

Implementar:

GET /api/v1/persons
POST /api/v1/persons
GET /api/v1/persons/{id}
PATCH /api/v1/persons/{id}

Desactivação quando apropriado.

====================================================================
44. USER ASSIGNMENT API
====================================================================

Implementar:

GET /api/v1/users/{id}/assignments

POST /api/v1/users/{id}/assignments

PATCH /api/v1/users/{id}/assignments/{assignment_id}

DELETE somente quando não destruir histórico.

Preferir end assignment quando necessário.

====================================================================
45. RESPONSIBILITY API
====================================================================

Implementar endpoints administrativos necessários.

Respeitar RBAC.

Não permitir que um utilizador altere a própria responsabilidade
sem permissão administrativa apropriada.

====================================================================
46. DELEGATION API
====================================================================

Implementar:

criação
consulta
revogação
expiração automática quando aplicável

Toda operação deve ser auditável.

====================================================================
47. FRONTEND — ADMINISTRAÇÃO
====================================================================

Criar área:

/administracao

Rotas humanizadas em português.

Exemplo:

/administracao/pessoas
/administracao/utilizadores
/administracao/organizacao
/administracao/atribuicoes
/administracao/responsabilidades

Não utilizar URLs técnicas desnecessárias.

====================================================================
48. GESTÃO DE PESSOAS
====================================================================

Criar interface profissional.

Deve permitir:

- pesquisar;
- filtrar;
- visualizar;
- criar;
- editar;
- consultar situação;
- consultar lotação;
- consultar atribuições;
- consultar histórico.

Utilizar:

TanStack Table
TanStack Query
shadcn/ui

====================================================================
49. TABELA DE PESSOAS
====================================================================

A tabela deve suportar:

- pesquisa;
- filtros;
- ordenação;
- paginação;
- colunas configuráveis;
- estados;
- ações.

Não criar tabela visualmente simples.

Filtros devem ser humanizados.

Nunca mostrar:

ACTIVE
INACTIVE
CHEFE_SECCAO

sem tradução.

====================================================================
50. PERFIL DA PESSOA
====================================================================

Criar página detalhada.

Estrutura:

Dados pessoais
Dados funcionais
Conta SIP
Perfis
Lotação
Atribuições
Responsabilidades
Delegações
Histórico
Auditoria quando permitido

Utilizar tabs/sections adequadas.

====================================================================
51. FORMULÁRIOS
====================================================================

Os formulários devem utilizar:

shadcn/ui
React Hook Form quando já definido na arquitetura
Zod quando já definido na arquitetura

Campos devem possuir:

- labels claros;
- validação;
- mensagens de erro;
- estados loading;
- estados disabled;
- feedback de sucesso/erro.

Não utilizar inputs HTML básicos quando existir componente
adequado no design system.

====================================================================
52. SELECTS
====================================================================

Não utilizar selects simples para grandes listas.

Para:

Pessoa
Utilizador
Direcção
Departamento
Secção
Unidade

utilizar:

combobox
autocomplete
command palette

quando apropriado.

====================================================================
53. ORGANIZATION TREE
====================================================================

Criar:

OrganizationTree

Funcionalidades:

- expandir;
- recolher;
- seleccionar;
- criar;
- editar;
- mover quando autorizado;
- visualizar filhos;
- visualizar responsáveis.

Não permitir operações não autorizadas.

====================================================================
54. ORGANIZATION DETAIL
====================================================================

Ao seleccionar uma unidade mostrar:

Nome
Código
Tipo
Unidade superior
Subunidades
Responsáveis
Utilizadores atribuídos
Estado

====================================================================
55. ATRIBUIÇÕES
====================================================================

Criar módulo:

Gestão de Atribuições

Permitir:

Pessoa/Utilizador
→ Unidade
→ Tipo de atribuição
→ Função
→ Período
→ Principal/Não principal

====================================================================
56. RESPONSABILIDADES
====================================================================

Criar interface para:

- consultar;
- atribuir;
- alterar;
- terminar;
- delegar;
- substituir.

Todas as operações devem possuir confirmação quando forem críticas.

====================================================================
57. DELEGAÇÃO
====================================================================

Interface deve apresentar:

Delegante
Delegado
Responsabilidade
Unidade
Início
Fim
Motivo
Estado

Não permitir delegações sobrepostas inválidas.

====================================================================
58. HISTÓRICO
====================================================================

Mostrar timeline ou tabela histórica.

Exemplo:

2026-01-10
→ atribuído à Direcção X

2026-03-05
→ transferido para Departamento Y

2026-06-01
→ assumiu função de Instrutor

Não apagar histórico.

====================================================================
59. SIDEBAR
====================================================================

Actualizar Sidebar do SIP.

Adicionar:

ADMINISTRAÇÃO

Com:

Gestão de Pessoas
Utilizadores
Perfis e Permissões
Estrutura Organizacional
Atribuições
Responsabilidades

O Sidebar deve respeitar:

permissions
profiles

O Sidebar NÃO é mecanismo de segurança.

O backend deve validar todas as operações.

====================================================================
60. AUDITORIA
====================================================================

Auditar:

PERSON_CREATED
PERSON_UPDATED
PERSON_DEACTIVATED

USER_PERSON_LINKED
USER_PERSON_UNLINKED

ORGANIZATION_CREATED
ORGANIZATION_UPDATED

UNIT_CREATED
UNIT_UPDATED
UNIT_MOVED
UNIT_DEACTIVATED

ASSIGNMENT_CREATED
ASSIGNMENT_UPDATED
ASSIGNMENT_ENDED

RESPONSIBILITY_CREATED
RESPONSIBILITY_UPDATED
RESPONSIBILITY_ENDED

DELEGATION_CREATED
DELEGATION_REVOKED

SUBSTITUTION_CREATED
SUBSTITUTION_ENDED

Não registrar:

password
access token
refresh token
segredos.

====================================================================
61. SEGURANÇA
====================================================================

Validar:

- autorização;
- ownership;
- escopo;
- tenant/organization quando aplicável;
- permissões;
- integridade hierárquica.

Não confiar no frontend.

====================================================================
62. DATABASE
====================================================================

Utilizar:

PostgreSQL
SQLAlchemy
Alembic

Toda alteração de schema:

migration.

Nunca editar produção manualmente.

====================================================================
63. CONSTRAINTS
====================================================================

Criar constraints adequadas.

Exemplos:

unique organization code

unique unit code dentro do contexto apropriado

unique person_number

unique employee_number quando aplicável

integridade User ↔ Person

uma primary assignment activa por utilizador

integridade parent/organization

====================================================================
64. SOFT DELETE
====================================================================

Não utilizar soft delete cegamente em tudo.

Utilizar status/active state quando o histórico deve ser preservado.

Dados históricos não devem desaparecer.

====================================================================
65. SEEDS
====================================================================

Actualizar seeds de desenvolvimento.

Criar:

Organização principal.

Algumas Direções.

Alguns Departamentos.

Algumas Secções.

Piquete de exemplo.

Pessoas de exemplo.

Utilizadores associados.

Atribuições.

Responsabilidades.

Delegações de exemplo apenas se necessárias para testes.

Não utilizar dados reais.

====================================================================
66. API DOCUMENTATION
====================================================================

Swagger/OpenAPI deve possuir:

- autenticação JWT;
- endpoints documentados;
- schemas;
- responses;
- erros;
- autorização.

Não criar documentação manual inconsistente com a API.

====================================================================
67. TESTES DE DOMÍNIO
====================================================================

Testar:

Person
User-Person association
Organization
OrganizationalUnit
Hierarchy
Assignment
Responsibility
Delegation
Substitution
AccessContext

====================================================================
68. TESTES DE INTEGRIDADE
====================================================================

Testar:

self-parent
cycle
invalid organization parent
duplicate primary assignment
invalid assignment period
invalid delegation
overlapping delegation
inactive unit assignment
invalid responsibility scope

====================================================================
69. TESTES DE AUTORIZAÇÃO
====================================================================

Testar pelo menos:

ADMINISTRADOR_SISTEMA

DIRECTOR

SECRETARIA_GERAL

CHEFE_DEPARTAMENTO

CHEFE_SECCAO

INSTRUTOR_PROCESSUAL

AGENTE_PIQUETE

EDITOR_DOCUMENTAL

AGENTE_PGR

Cada perfil deve possuir somente as permissões necessárias.

Não assumir que perfil implica acesso global.

====================================================================
70. CENÁRIOS
====================================================================

CENÁRIO 1:

Administrador cria Direcção.

CENÁRIO 2:

Administrador cria Departamento dentro da Direcção.

CENÁRIO 3:

Administrador cria Secção.

CENÁRIO 4:

Administrador cria Pessoa.

CENÁRIO 5:

Pessoa recebe User.

CENÁRIO 6:

User recebe perfil Instrutor.

CENÁRIO 7:

User é atribuído à Secção.

CENÁRIO 8:

User recebe responsabilidade.

CENÁRIO 9:

Responsabilidade é delegada temporariamente.

CENÁRIO 10:

Delegação termina.

CENÁRIO 11:

User consulta contexto.

CENÁRIO 12:

User tenta executar operação fora do escopo.

Resultado esperado:

403 Forbidden.

====================================================================
71. FRONTEND TESTS
====================================================================

Testar:

- listagem de pessoas;
- criação;
- edição;
- detalhe;
- pesquisa;
- filtros;
- organização;
- árvore;
- atribuições;
- responsabilidades;
- delegação;
- histórico;
- permissões.

====================================================================
72. E2E
====================================================================

E2E-001

Login Administrador
→ Administração
→ Criar pessoa
→ Criar unidade
→ Atribuir pessoa
→ Consultar contexto.

E2E-002

Login Director
→ consultar estrutura autorizada
→ tentar alterar estrutura global
→ acesso negado.

E2E-003

Login Instrutor
→ consultar contexto
→ não conseguir administração organizacional.

E2E-004

Login Agente PGR
→ consultar apenas contexto autorizado.

====================================================================
73. PERFORMANCE
====================================================================

Evitar N+1 queries.

Utilizar:

pagination
selectinload/joinedload quando apropriado
indexes

Não carregar toda a organização em cada request.

Organization Tree deve suportar carregamento eficiente.

====================================================================
74. INDEXES
====================================================================

Criar índices adequados para:

person_number
employee_number
user_id
organization_id
organizational_unit_id
parent_id
status
start_date
end_date

Avaliar índices compostos conforme queries reais.

Não criar índices indiscriminadamente.

====================================================================
75. RESPONSIBILITY ENGINE
====================================================================

Criar a fundação de um serviço que futuramente permita:

can_access_scope()
resolve_effective_scope()
get_effective_responsibilities()

Não implementar ainda regras específicas de:

Processos
Documentos
Piquete
Mandados
BRP

Apenas criar infraestrutura.

====================================================================
76. NÃO DUPLICAR REGRAS
====================================================================

É proibido espalhar lógica como:

if user.profile == "DIRECTOR"

ou:

if user.department_id == ...

por todos os módulos.

Utilizar serviços/policies centralizados.

====================================================================
77. HUMANIZAÇÃO
====================================================================

Nunca exibir enums técnicos.

Exemplos:

CHEFE_SECCAO
→ Chefe de Secção

AGENTE_PGR
→ Agente PGR

PRIMARY
→ Principal

SECONDARY
→ Secundária

ACTIVE
→ Activo

INACTIVE
→ Inactivo

DIRECTOR
→ Director

====================================================================
78. RESPONSIVE DESIGN
====================================================================

A área administrativa deve funcionar em:

desktop
tablet
resoluções menores.

Não sacrificar a experiência desktop.

O SIP é uma aplicação profissional de uso administrativo.

====================================================================
79. MODAIS
====================================================================

Modais administrativos devem ser:

- responsivos;
- adaptativos;
- acessíveis;
- com animações discretas;
- com tamanho adequado ao conteúdo;
- preparados para formulários longos.

Não criar modais gigantes sem necessidade.

Utilizar componentes shadcn/ui.

====================================================================
80. UX
====================================================================

Todos os estados devem existir:

Loading
Empty
Error
Success
Disabled
Unauthorized

Mensagens devem ser claras.

Exemplo:

"Não possui permissão para alterar esta unidade."

e não:

"403 Forbidden".

====================================================================
81. DOCUMENTAÇÃO
====================================================================

Criar:

docs/architecture/person-model.md

docs/architecture/organization-model.md

docs/architecture/assignment-model.md

docs/architecture/responsibility-model.md

docs/architecture/delegation-model.md

docs/architecture/access-context.md

Actualizar:

README.md

AGENTS.md quando necessário.

====================================================================
82. ADRS
====================================================================

Criar ADR quando existir decisão arquitectural relevante.

Exemplos:

ADR:
Person ≠ User

ADR:
Organizational Unit Hierarchy

ADR:
Assignment vs Responsibility

ADR:
Delegation vs Substitution

====================================================================
83. GIT
====================================================================

Cada Task concluída:

testar
review
commit

Utilizar Conventional Commits.

Exemplos:

feat(person): add person domain

feat(org): add organization hierarchy

feat(org): add user assignments

feat(org): add responsibility model

feat(org): add delegation support

feat(admin): add people management

feat(admin): add organization management

test(org): add hierarchy validation

docs(org): document organizational model

====================================================================
84. SPRINT CHECKPOINTS
====================================================================

Após cada grupo funcional:

CHECKPOINT A:
Person + User

CHECKPOINT B:
Organization + Units

CHECKPOINT C:
Hierarchy

CHECKPOINT D:
Assignments

CHECKPOINT E:
Responsibilities

CHECKPOINT F:
Delegations

CHECKPOINT G:
Frontend

CHECKPOINT H:
Security + Tests

Em cada checkpoint:

lint
typecheck
tests
review
commit

====================================================================
85. DEFINITION OF DONE
====================================================================

A SPRINT-02 só pode ser marcada como DONE quando:

[ ] Person
[ ] Dados funcionais
[ ] User ↔ Person
[ ] Profiles integration
[ ] Permissions integration
[ ] Organization
[ ] Organizational Unit
[ ] Unit Types
[ ] Hierarchy
[ ] Hierarchy Service
[ ] User Assignment
[ ] Lotação
[ ] Assignment History
[ ] Functional Role
[ ] Responsibility
[ ] Responsibility Scope
[ ] Delegation
[ ] Substitution foundation
[ ] Access Context
[ ] Scope Engine foundation
[ ] Backend APIs
[ ] Frontend Administração
[ ] Gestão de Pessoas
[ ] Gestão Organizacional
[ ] Organization Tree
[ ] Gestão de Atribuições
[ ] Gestão de Responsabilidades
[ ] Histórico
[ ] Sidebar actualizado
[ ] Humanização
[ ] Audit integration
[ ] Security review
[ ] Database migrations
[ ] Development seeds
[ ] Backend tests
[ ] Frontend tests
[ ] E2E tests
[ ] Swagger/OpenAPI
[ ] Documentation
[ ] ADRs
[ ] Lint PASS
[ ] Typecheck PASS
[ ] Tests PASS
[ ] Build PASS
[ ] Todas as Tasks DONE
[ ] Todos os checkpoints concluídos
[ ] Commits realizados

====================================================================
86. CRITÉRIO DE ACEITAÇÃO FINAL
====================================================================

Deve ser possível realizar:

Pessoa
 ↓
Conta SIP
 ↓
Perfil
 ↓
Organização
 ↓
Direcção
 ↓
Departamento
 ↓
Secção
 ↓
Lotação
 ↓
Função
 ↓
Responsabilidade
 ↓
Delegação/Substituição
 ↓
Contexto de acesso

E o sistema deve conseguir responder:

1. Quem é o utilizador?
2. Que pessoa representa?
3. Que perfil possui?
4. Onde está lotado?
5. Qual é a sua função?
6. Qual é a sua responsabilidade?
7. Qual é o seu âmbito?
8. Existe delegação?
9. Existe substituição?
10. Qual é o seu contexto organizacional efectivo?

====================================================================
87. PROIBIÇÕES
====================================================================

NÃO implementar nesta Sprint:

- Form Builder;
- Document Engine;
- PDF;
- DOCX;
- Participação;
- Denúncia;
- Autos;
- Processo;
- Instrução;
- Piquete funcional;
- Mandados;
- BRP;
- PGR workflow;
- dashboards funcionais;
- notificações funcionais.

Apenas criar fundações necessárias.

====================================================================
88. FINAL DA SPRINT
====================================================================

Quando todas as Tasks estiverem concluídas:

1. executar todos os testes;
2. executar lint;
3. executar typecheck;
4. executar build;
5. executar E2E;
6. executar revisão de segurança;
7. rever migrations;
8. rever documentação;
9. rever commits;
10. actualizar SPRINT-02.md para DONE.

Criar commit final:

chore(sprint-02): complete administration and organizational foundation

====================================================================
89. RELATÓRIO FINAL
====================================================================

Apresentar:

1. resumo;
2. Tasks concluídas;
3. Skills utilizadas;
4. arquitetura;
5. entidades;
6. migrations;
7. endpoints;
8. frontend;
9. regras de autorização;
10. testes;
11. E2E;
12. segurança;
13. ADRs;
14. documentação;
15. commits;
16. problemas encontrados;
17. débitos técnicos;
18. estado final.

====================================================================
90. REGRA FINAL
====================================================================

NÃO iniciar a SPRINT-03 automaticamente.

Depois de concluir completamente esta Sprint:

PARAR.

Aguardar autorização explícita para:

SPRINT-03 — NOTIFICAÇÕES E EVENTOS DO SIP.

====================================================================
FIM DO PROMPT 02
====================================================================