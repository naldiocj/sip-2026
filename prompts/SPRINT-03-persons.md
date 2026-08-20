Perfeito. A **SPRINT 03** é onde devemos consolidar o domínio que ficará por trás da distribuição de responsabilidades no SIP. Ela não deve ser apenas um CRUD de pessoas: deve estabelecer **quem é a pessoa, onde está colocada, qual é a sua função, que responsabilidades possui e em que contexto pode atuar**.

Abaixo está o prompt pronto para colar no OpenCode.

```text
====================================================================
SIP — PROMPT 03
SPRINT 03 — GESTÃO DE PESSOAS, ESTRUTURA ORGANIZACIONAL,
LOTAÇÃO, FUNÇÕES, RESPONSABILIDADES E ATRIBUIÇÕES
====================================================================

PROJECT:
SIP — Sistema de Instrução Processual

SPRINT:
SPRINT-03

TITLE:
Gestão de Pessoas, Estrutura Organizacional, Lotação, Funções,
Responsabilidades e Atribuições

STATUS:
PLANNED

====================================================================
1. MISSÃO
====================================================================

Implementar o domínio institucional responsável por representar:

- pessoas;
- estrutura organizacional;
- unidades;
- direcções;
- departamentos;
- secções;
- lotações;
- funções;
- responsabilidades;
- atribuições;
- delegações;
- substituições.

Este módulo deve transformar o contexto organizacional criado na
SPRINT-02 num domínio institucional completo, consistente e reutilizável
por todos os módulos futuros do SIP.

O resultado deverá permitir ao sistema responder:

- Quem é esta pessoa?
- A que organização pertence?
- Em que Direcção está?
- Em que Departamento está?
- Em que Secção está?
- Em que Unidade está?
- Qual é a sua função?
- Qual é a sua responsabilidade?
- Que atribuições possui?
- Desde quando?
- Até quando?
- Quem pode substituí-la?
- Quem lhe delegou determinada responsabilidade?
- Que responsabilidades estão activas?

====================================================================
2. PRINCÍPIO FUNDAMENTAL
====================================================================

NÃO misturar:

USER
PERSON
ORGANIZATION
ORGANIZATIONAL_UNIT
POSITION
FUNCTIONAL_ROLE
ASSIGNMENT
RESPONSIBILITY
DELEGATION
SUBSTITUTION

Conceito:

USER
=
conta de acesso.

PERSON
=
pessoa física/funcional.

ORGANIZATION
=
estrutura institucional superior.

ORGANIZATIONAL_UNIT
=
unidade da estrutura.

POSITION
=
posição/função ocupacional.

FUNCTIONAL_ROLE
=
papel funcional.

ASSIGNMENT
=
colocação/lotação de uma pessoa.

RESPONSIBILITY
=
responsabilidade atribuída.

DELEGATION
=
responsabilidade delegada.

SUBSTITUTION
=
substituição temporária.

====================================================================
3. DEPENDÊNCIAS
====================================================================

SPRINT-00:
Arquitectura base.

SPRINT-01:
Autenticação + RBAC + autorização.

SPRINT-02:
Gestão de utilizadores.

A SPRINT-03 deve reutilizar os contratos existentes.

NÃO duplicar:

User
Profile
Permission
UserAssignment
AccessContext

Caso algum modelo da SPRINT-02 tenha sido criado como provisório,
avaliar e consolidar através de migration sem quebrar a compatibilidade.

====================================================================
4. OBJECTIVO ARQUITECTURAL
====================================================================

Criar um domínio organizacional reutilizável.

A estrutura deve suportar:

ORGANIZATION
    ↓
DIRECTION
    ↓
DEPARTMENT
    ↓
SECTION
    ↓
UNIT

Mas não assumir que todas as instituições terão exactamente estes níveis.

A arquitectura deve suportar uma hierarquia extensível.

Preferir:

OrganizationalUnit
    id
    parent_id
    type
    name
    code
    status

em vez de criar lógica rígida espalhada:

direction_id
department_id
section_id
unit_id

O sistema pode disponibilizar os tipos institucionais:

ORGANIZATION
DIRECTION
DEPARTMENT
SECTION
UNIT

====================================================================
5. ORGANIZAÇÃO
====================================================================

Criar:

Organization

Campos mínimos:

id
name
short_name
acronym
code
description
status
created_at
updated_at

Suportar:

Activo
Inactivo

Não eliminar fisicamente organizações utilizadas em histórico.

====================================================================
6. UNIDADES ORGANIZACIONAIS
====================================================================

Criar:

OrganizationalUnit

Campos:

id
organization_id
parent_id
type
name
code
acronym
description
status
created_at
updated_at

Tipos:

DIRECTION
DEPARTMENT
SECTION
UNIT

Labels:

Direcção
Departamento
Secção
Unidade

====================================================================
7. HIERARQUIA
====================================================================

Exemplo:

Serviço de Investigação Criminal
        │
        ├── Direcção A
        │       │
        │       ├── Departamento A
        │       │       │
        │       │       └── Secção A
        │       │               │
        │       │               └── Unidade A
        │       │
        │       └── Departamento B
        │
        └── Direcção B

A estrutura deve ser navegável.

====================================================================
8. REGRAS DA HIERARQUIA
====================================================================

Uma unidade só pode possuir um parent válido.

DIRECTION:
parent pode ser ORGANIZATION.

DEPARTMENT:
parent deve ser DIRECTION.

SECTION:
parent deve ser DEPARTMENT.

UNIT:
parent deve ser SECTION.

Preparar arquitectura para futuros tipos sem alterar o núcleo.

====================================================================
9. PREVENÇÃO DE CICLOS
====================================================================

Impedir:

A → B
B → C
C → A

Validar qualquer alteração de parent.

====================================================================
10. CÓDIGOS
====================================================================

Cada organização/unidade deve poder possuir:

code

Exemplo:

SIC
DIR-INV
DEP-ECON
SEC-01
UNIT-01

Validar unicidade dentro do contexto apropriado.

====================================================================
11. GESTÃO DE PESSOAS
====================================================================

Criar:

Person

A entidade deve representar a pessoa independentemente de possuir
ou não uma conta SIP.

Campos possíveis:

id
full_name
preferred_name
bi_number
birth_date
birth_place
nationality
gender
profession
phone
email
address
status
created_at
updated_at

Não adicionar campos sem necessidade funcional.

====================================================================
12. IDENTIFICAÇÃO
====================================================================

A pessoa deve possuir identificação interna.

Exemplo:

person_number

Formato configurável.

Exemplo:

P-000001

Não utilizar BI como chave primária.

====================================================================
13. DADOS SENSÍVEIS
====================================================================

Dados pessoais devem receber tratamento adequado.

Não expor dados desnecessários em listagens.

Não devolver informação sensível em endpoints que não necessitam dela.

Aplicar princípio do mínimo privilégio.

====================================================================
14. RELAÇÃO USER ↔ PERSON
====================================================================

Permitir:

USER → PERSON

Mas não assumir:

PERSON → USER obrigatório.

Uma pessoa pode existir sem conta SIP.

Uma conta SIP deve poder ser associada a uma pessoa.

Não criar automaticamente uma pessoa sem regra explícita.

====================================================================
15. ASSOCIAÇÃO
====================================================================

Criar operação:

associateUserWithPerson

e:

removeUserPersonAssociation

Validar:

- não associar duas pessoas ao mesmo User;
- não associar a mesma Person a múltiplos Users quando a regra
  institucional não permitir;
- manter histórico quando aplicável.

====================================================================
16. LOTAÇÃO
====================================================================

Criar:

PersonAssignment

Representa a colocação funcional da pessoa.

Campos conceptuais:

id
person_id
organizational_unit_id
position_id
functional_role_id
start_date
end_date
status
is_primary
notes

====================================================================
17. LOTAÇÃO ≠ RESPONSABILIDADE
====================================================================

Uma pessoa pode estar lotada numa unidade sem possuir determinada
responsabilidade.

Exemplo:

Pessoa:
João

Lotação:
Departamento X

Função:
Instrutor Processual

Responsabilidade:
Chefe de Secção

Não misturar os conceitos.

====================================================================
18. ATRIBUIÇÃO PRINCIPAL
====================================================================

Uma pessoa pode possuir múltiplas lotações ao longo do tempo.

Permitir:

is_primary

Somente uma lotação activa pode ser principal para o mesmo contexto
temporal.

====================================================================
19. HISTÓRICO DE LOTAÇÃO
====================================================================

Nunca apagar silenciosamente.

Exemplo:

01/01/2025
Direcção A

01/05/2026
Direcção B

O sistema deve manter ambos os registos.

====================================================================
20. FUNÇÕES
====================================================================

Criar:

Position

Exemplos:

Director
Chefe de Departamento
Chefe de Secção
Instrutor
Editor
Agente

A posição não deve ser confundida com Profile.

====================================================================
21. PROFILE ≠ POSITION
====================================================================

Exemplo:

User Profile:
INSTRUTOR_PROCESSUAL

Position:
Instrutor Processual

Mas:

Profile
=
permissões do sistema.

Position
=
posição funcional.

Não utilizar Profile para representar função institucional.

====================================================================
22. FUNCTIONAL ROLE
====================================================================

Criar:

FunctionalRole

Permitir representar papéis funcionais.

Exemplos:

Responsável de Departamento
Responsável de Secção
Instrutor
Secretário
Editor
Coordenador

Uma pessoa pode possuir mais de um papel funcional quando permitido.

====================================================================
23. RESPONSABILIDADES
====================================================================

Criar:

Responsibility

Campos:

id
name
code
description
scope
status

Exemplos:

GESTAO_DEPARTAMENTO
GESTAO_SECCAO
DISTRIBUICAO_PROCESSOS
INSTRUCAO_PROCESSUAL
GESTAO_DOCUMENTAL
VALIDACAO_DOCUMENTAL

====================================================================
24. ATRIBUIÇÃO DE RESPONSABILIDADE
====================================================================

Criar:

PersonResponsibility

Campos:

id
person_id
responsibility_id
organizational_unit_id
start_date
end_date
status
is_primary
assigned_by
notes

A responsabilidade deve poder ser limitada a uma unidade.

====================================================================
25. ESCOPO DA RESPONSABILIDADE
====================================================================

Uma responsabilidade pode ter escopo:

GLOBAL
ORGANIZATION
DIRECTION
DEPARTMENT
SECTION
UNIT

O sistema deve validar o contexto.

====================================================================
26. RESPONSABILIDADE TEMPORÁRIA
====================================================================

Suportar:

start_date
end_date

Exemplo:

Chefe de Secção substituto
01/08/2026 → 31/08/2026

Depois:

EXPIRED

Não apagar.

====================================================================
27. DELEGAÇÃO
====================================================================

Criar:

Delegation

Representa uma responsabilidade delegada.

Campos:

id
delegator_person_id
delegate_person_id
responsibility_id
organizational_unit_id
start_date
end_date
status
reason
created_at

====================================================================
28. REGRAS DE DELEGAÇÃO
====================================================================

Uma pessoa só pode delegar uma responsabilidade que possua ou para a qual
esteja autorizada.

Não permitir auto-delegação.

Não permitir delegação fora do escopo autorizado.

Registar auditoria.

====================================================================
29. SUBSTITUIÇÃO
====================================================================

Criar:

Substitution

Representa substituição temporária.

Campos:

id
principal_person_id
substitute_person_id
organizational_unit_id
functional_role_id
start_date
end_date
reason
status

====================================================================
30. REGRAS DE SUBSTITUIÇÃO
====================================================================

Não permitir:

pessoa substituindo a si própria.

Substituição sem período.

Substituição incompatível com o escopo.

Após end_date:

EXPIRED.

====================================================================
31. RESPONSABILIDADE EFECTIVA
====================================================================

Criar serviço:

EffectiveResponsibilityService

Deve calcular:

- responsabilidades directas;
- responsabilidades delegadas;
- responsabilidades por substituição;
- responsabilidades expiradas.

Não armazenar resultados calculados permanentemente se puderem ser
determinados dinamicamente.

====================================================================
32. ACCESS CONTEXT
====================================================================

Actualizar:

AccessContext

para incluir:

person
organization
primary_assignment
assignments
positions
functional_roles
responsibilities
delegations
substitutions

Estrutura:

AccessContext
├── User
├── Person
├── Profiles
├── Permissions
├── Organization
├── Assignments
├── Positions
├── Functional Roles
├── Responsibilities
├── Delegations
└── Substitutions

====================================================================
33. CONTEXTO EFECTIVO
====================================================================

Criar:

GET /api/v1/me/context

Retornar o contexto actual do utilizador.

O endpoint deve respeitar autorização.

====================================================================
34. ESTRUTURA ORGANIZACIONAL — FRONTEND
====================================================================

Criar:

/administracao/estrutura-organizacional

Interface em árvore.

Exemplo:

SIC
├── Direcção A
│   ├── Departamento A
│   │   ├── Secção A
│   │   │   ├── Unidade A
│   │   │   └── Unidade B
│   │   └── Secção B
│   └── Departamento B
└── Direcção B

====================================================================
35. AÇÕES DA ESTRUTURA
====================================================================

Permitir:

Criar
Editar
Desactivar
Consultar
Adicionar filho
Mover unidade
Consultar pessoas
Consultar responsáveis

Não permitir apagar estruturas que possuam histórico.

====================================================================
36. MOVE UNIT
====================================================================

Permitir mover uma unidade para outro parent apenas se:

- tipo compatível;
- não criar ciclo;
- não quebrar atribuições;
- operador autorizado.

Confirmar operações de impacto elevado.

====================================================================
37. GESTÃO DE PESSOAS — FRONTEND
====================================================================

Criar:

/administracao/pessoas

Tabela:

Pessoa
Número
Documento
Função
Organização
Direcção
Departamento
Secção
Unidade
Estado

Filtros:

Nome
Número
BI
Organização
Direcção
Departamento
Secção
Unidade
Função
Estado

====================================================================
38. DETALHE DA PESSOA
====================================================================

Criar:

/administracao/pessoas/[id]

Tabs:

Resumo
Dados pessoais
Conta SIP
Lotação
Funções
Papéis funcionais
Responsabilidades
Delegações
Substituições
Histórico
Auditoria

====================================================================
39. LOTAÇÃO UI
====================================================================

Permitir:

Adicionar lotação
Editar lotação
Terminar lotação
Definir principal

Campos:

Organização
Direcção
Departamento
Secção
Unidade
Posição
Função
Data início
Data fim

====================================================================
40. RESPONSABILIDADES UI
====================================================================

Permitir:

Adicionar responsabilidade
Alterar
Terminar
Delegar
Consultar histórico

Mostrar:

Responsabilidade
Escopo
Unidade
Início
Fim
Estado

====================================================================
41. DELEGAÇÕES UI
====================================================================

Mostrar:

Delegante
Delegado
Responsabilidade
Unidade
Início
Fim
Estado

====================================================================
42. SUBSTITUIÇÕES UI
====================================================================

Mostrar:

Titular
Substituto
Função
Unidade
Período
Motivo
Estado

====================================================================
43. API — ORGANIZAÇÃO
====================================================================

Implementar endpoints equivalentes a:

GET    /api/v1/organizations
POST   /api/v1/organizations
GET    /api/v1/organizations/{id}
PATCH  /api/v1/organizations/{id}

====================================================================
44. API — UNIDADES
====================================================================

GET    /api/v1/organizational-units
POST   /api/v1/organizational-units
GET    /api/v1/organizational-units/{id}
PATCH  /api/v1/organizational-units/{id}

POST   /api/v1/organizational-units/{id}/move
POST   /api/v1/organizational-units/{id}/activate
POST   /api/v1/organizational-units/{id}/deactivate

====================================================================
45. API — PESSOAS
====================================================================

GET    /api/v1/persons
POST   /api/v1/persons
GET    /api/v1/persons/{id}
PATCH  /api/v1/persons/{id}

====================================================================
46. API — USER/PERSON
====================================================================

POST   /api/v1/users/{id}/person
DELETE /api/v1/users/{id}/person

====================================================================
47. API — LOTAÇÃO
====================================================================

GET    /api/v1/persons/{id}/assignments
POST   /api/v1/persons/{id}/assignments
PATCH  /api/v1/persons/{id}/assignments/{assignment_id}
POST   /api/v1/persons/{id}/assignments/{assignment_id}/end

====================================================================
48. API — FUNÇÕES
====================================================================

GET    /api/v1/positions
POST   /api/v1/positions
PATCH  /api/v1/positions/{id}

====================================================================
49. API — PAPÉIS FUNCIONAIS
====================================================================

GET    /api/v1/functional-roles
POST   /api/v1/functional-roles
PATCH  /api/v1/functional-roles/{id}

====================================================================
50. API — RESPONSABILIDADES
====================================================================

GET    /api/v1/responsibilities
POST   /api/v1/responsibilities
PATCH  /api/v1/responsibilities/{id}

GET    /api/v1/persons/{id}/responsibilities
POST   /api/v1/persons/{id}/responsibilities

POST   /api/v1/persons/{id}/responsibilities/{responsibility_id}/end

====================================================================
51. API — DELEGAÇÕES
====================================================================

GET  /api/v1/delegations
POST /api/v1/delegations
POST /api/v1/delegations/{id}/end

====================================================================
52. API — SUBSTITUIÇÕES
====================================================================

GET  /api/v1/substitutions
POST /api/v1/substitutions
POST /api/v1/substitutions/{id}/end

====================================================================
53. PYTHON / FASTAPI
====================================================================

Utilizar:

Python
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL

Seguir arquitectura existente da SPRINT-00/01/02.

Não introduzir frameworks desnecessários.

====================================================================
54. FRONTEND
====================================================================

Utilizar:

Next.js
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
TanStack Query
TanStack Table

Não utilizar SVG manual.

====================================================================
55. REACT QUERY
====================================================================

Utilizar TanStack Query para:

organizations
organizational units
persons
assignments
positions
functional roles
responsibilities
delegations
substitutions

Invalidar queries adequadamente após mutations.

====================================================================
56. TABELAS
====================================================================

Utilizar TanStack Table.

Suportar:

sorting
filtering
pagination
column visibility
row actions

Não carregar datasets completos desnecessariamente.

====================================================================
57. FORMULÁRIOS
====================================================================

Utilizar componentes shadcn/ui.

Formulários devem possuir:

loading
validation
error state
success state
dirty state
confirmation

====================================================================
58. VALIDAÇÕES
====================================================================

Validar no frontend.

Validar novamente no backend.

Frontend não é camada de segurança.

====================================================================
59. SEGURANÇA
====================================================================

Implementar:

RBAC
permission checks
scope validation
object-level authorization

Nunca confiar em:

organization_id
unit_id
person_id

fornecidos pelo frontend.

====================================================================
60. REGRAS DE ACESSO
====================================================================

Administrador:

acesso administrativo global.

Director:

acesso conforme o escopo institucional autorizado.

Chefe de Departamento:

acesso ao respectivo departamento.

Chefe de Secção:

acesso à respectiva secção.

Instrutor:

acesso conforme responsabilidades e atribuições.

Editor:

acesso ao domínio documental autorizado.

Agente PGR:

acesso ao contexto PGR autorizado.

Estas regras devem ser implementadas através de autorização e escopo,
não através de ifs espalhados pelo frontend.

====================================================================
61. AUDITORIA
====================================================================

Registar:

ORGANIZATION_CREATED
ORGANIZATION_UPDATED
ORGANIZATION_ACTIVATED
ORGANIZATION_DEACTIVATED

UNIT_CREATED
UNIT_UPDATED
UNIT_MOVED
UNIT_ACTIVATED
UNIT_DEACTIVATED

PERSON_CREATED
PERSON_UPDATED

USER_PERSON_LINKED
USER_PERSON_UNLINKED

ASSIGNMENT_CREATED
ASSIGNMENT_UPDATED
ASSIGNMENT_ENDED
PRIMARY_ASSIGNMENT_CHANGED

RESPONSIBILITY_ASSIGNED
RESPONSIBILITY_UPDATED
RESPONSIBILITY_ENDED

DELEGATION_CREATED
DELEGATION_ENDED

SUBSTITUTION_CREATED
SUBSTITUTION_ENDED

====================================================================
62. AUDITORIA NÃO DEVE GUARDAR
====================================================================

Não guardar:

password
JWT
refresh token
segredos
credenciais

====================================================================
63. DATABASE
====================================================================

Criar migrations Alembic.

Avaliar tabelas:

organizations
organizational_units
persons
positions
functional_roles
person_assignments
responsibilities
person_responsibilities
delegations
substitutions

Adaptar nomes à convenção existente.

====================================================================
64. CONSTRAINTS
====================================================================

Implementar constraints quando apropriado.

Exemplos:

unique organization code

unique organizational unit code dentro do contexto

foreign keys

indexes

valid status

====================================================================
65. ÍNDICES
====================================================================

Avaliar índices para:

organization_id
parent_id
unit_type
person_id
position_id
functional_role_id
responsibility_id
status
start_date
end_date

Não criar índices indiscriminadamente.

====================================================================
66. HISTÓRICO
====================================================================

Nenhum registo institucional utilizado em processos deve ser apagado
fisicamente.

Preferir:

inactive
ended
expired

conforme o caso.

====================================================================
67. DADOS DE SEED
====================================================================

Criar seeds somente para dados estruturais realmente necessários.

Não inventar estrutura institucional real.

Utilizar dados claramente marcados como DEMO quando necessários.

====================================================================
68. TESTES UNITÁRIOS
====================================================================

Testar:

OrganizationService
OrganizationalUnitService
PersonService
AssignmentService
ResponsibilityService
DelegationService
SubstitutionService
EffectiveResponsibilityService

====================================================================
69. TESTES DE HIERARQUIA
====================================================================

Testar:

Organization → Direction

Direction → Department

Department → Section

Section → Unit

Também testar:

parent inválido
ciclo
movimentação inválida
unidade inactiva

====================================================================
70. TESTES DE LOTAÇÃO
====================================================================

Testar:

criação;
edição;
término;
principal;
períodos sobrepostos;
contexto inválido.

====================================================================
71. TESTES DE RESPONSABILIDADE
====================================================================

Testar:

atribuição;
término;
escopo;
delegação;
expiração;
substituição.

====================================================================
72. TESTES DE AUTORIZAÇÃO
====================================================================

Testar todos os perfis existentes.

Nenhum utilizador deve conseguir consultar ou modificar dados fora do
seu escopo sem autorização.

====================================================================
73. TESTES E2E
====================================================================

E2E-001

Criar organização.

Criar Direcção.

Criar Departamento.

Criar Secção.

Criar Unidade.

Resultado:
árvore institucional correcta.

------------------------------------------------------------

E2E-002

Criar Pessoa.

Associar User.

Criar lotação.

Definir função.

Resultado:
contexto funcional correcto.

------------------------------------------------------------

E2E-003

Criar responsabilidade.

Atribuir à Pessoa.

Definir escopo.

Resultado:
responsabilidade activa.

------------------------------------------------------------

E2E-004

Delegar responsabilidade.

Resultado:
delegação activa e auditada.

------------------------------------------------------------

E2E-005

Criar substituição.

Resultado:
substituição activa durante o período.

------------------------------------------------------------

E2E-006

Consultar:

GET /api/v1/me/context

Resultado:

User
Person
Organization
Assignment
Position
Responsibilities

correctamente resolvidos.

====================================================================
74. FRONTEND — UX
====================================================================

Criar interface profissional.

Evitar CRUDs genéricos.

Utilizar:

Tree
DataTable
Cards
Tabs
Badges
Command
Combobox
Dialog
Drawer
Dropdown
Tooltip
Skeleton
EmptyState
Alert

====================================================================
75. HUMANIZAÇÃO
====================================================================

Nunca mostrar:

CHEFE_DEPARTAMENTO
ORGANIZATIONAL_UNIT
INACTIVE
PRIMARY_ASSIGNMENT

Mostrar:

Chefe de Departamento
Unidade Organizacional
Inactivo
Atribuição Principal

Todos os labels devem ser humanizados.

====================================================================
76. SIDEBAR
====================================================================

Actualizar:

ADMINISTRAÇÃO
│
├── Utilizadores
├── Pessoas
├── Estrutura Organizacional
├── Funções
├── Papéis Funcionais
├── Responsabilidades
└── Atribuições

Mostrar somente itens autorizados.

Não mostrar módulos vazios ou ainda não implementados.

====================================================================
77. RESPONSIVE
====================================================================

Desktop:

árvore + detalhes.

Tablet:

layout adaptado.

Mobile:

navegação por cards/drawers.

====================================================================
78. ACCESSIBILITY
====================================================================

Garantir:

keyboard navigation
focus management
aria-label
aria-expanded
aria-selected
contraste adequado

====================================================================
79. TASKS
====================================================================

Criar:

prompts/tasks/sprint-03/

TASK-001-domain-audit.md
TASK-002-organization.md
TASK-003-organizational-units.md
TASK-004-hierarchy.md
TASK-005-person.md
TASK-006-user-person-association.md
TASK-007-position.md
TASK-008-functional-role.md
TASK-009-person-assignment.md
TASK-010-responsibilities.md
TASK-011-person-responsibilities.md
TASK-012-delegation.md
TASK-013-substitution.md
TASK-014-effective-responsibility.md
TASK-015-access-context.md
TASK-016-api.md
TASK-017-frontend-organization.md
TASK-018-frontend-persons.md
TASK-019-frontend-assignments.md
TASK-020-frontend-responsibilities.md
TASK-021-authorization.md
TASK-022-audit.md
TASK-023-tests.md
TASK-024-e2e.md
TASK-025-documentation.md
TASK-026-final-review.md

====================================================================
80. EXECUÇÃO
====================================================================

Executar Tasks sequencialmente.

Para cada Task:

1. Ler Task.
2. Verificar dependências.
3. Consultar skills relevantes.
4. Criar plano.
5. Implementar.
6. Testar.
7. Fazer revisão.
8. Actualizar documentação.
9. Marcar DONE.
10. Criar commit.

Não avançar com uma Task quebrada.

====================================================================
81. CHECKPOINTS
====================================================================

CHECKPOINT A
Organization

CHECKPOINT B
Organizational hierarchy

CHECKPOINT C
Person

CHECKPOINT D
User ↔ Person

CHECKPOINT E
Assignments

CHECKPOINT F
Positions + Functional Roles

CHECKPOINT G
Responsibilities

CHECKPOINT H
Delegations + Substitutions

CHECKPOINT I
Access Context

CHECKPOINT J
Frontend

CHECKPOINT K
Authorization

CHECKPOINT L
Tests

CHECKPOINT M
Documentation

Cada checkpoint:

lint
typecheck
tests
build

Depois:

commit.

====================================================================
82. COMMITS
====================================================================

Utilizar Conventional Commits.

Exemplos:

feat(org): implement organization management

feat(org): implement organizational hierarchy

feat(person): implement person management

feat(person): link users with persons

feat(person): implement assignments

feat(person): implement functional roles

feat(person): implement responsibilities

feat(person): implement delegations

feat(person): implement substitutions

feat(auth): extend access context

test(org): add hierarchy tests

test(person): add assignment tests

test(auth): add scope authorization tests

docs(person): document organizational domain

====================================================================
83. DOCUMENTAÇÃO
====================================================================

Criar:

docs/sprints/SPRINT-03.md

docs/architecture/organizational-domain.md

docs/architecture/person-domain.md

docs/architecture/responsibility-domain.md

Actualizar documentação existente.

====================================================================
84. DEFINITION OF DONE
====================================================================

[ ] Organization
[ ] OrganizationalUnit
[ ] Hierarquia
[ ] Prevenção de ciclos
[ ] Pessoas
[ ] Person Number
[ ] User ↔ Person
[ ] Positions
[ ] Functional Roles
[ ] Person Assignment
[ ] Histórico
[ ] Responsabilidades
[ ] Escopos
[ ] Delegações
[ ] Substituições
[ ] Effective Responsibility
[ ] Access Context
[ ] APIs
[ ] OpenAPI
[ ] Frontend
[ ] Tree
[ ] DataTables
[ ] Sidebar
[ ] RBAC
[ ] Scope Authorization
[ ] Auditoria
[ ] Migrations
[ ] Seeds
[ ] Unit Tests
[ ] Integration Tests
[ ] Authorization Tests
[ ] E2E
[ ] Documentation
[ ] Lint PASS
[ ] Typecheck PASS
[ ] Build PASS
[ ] Tests PASS
[ ] Todas as Tasks DONE

====================================================================
85. REGRA DE NÃO ANTECIPAÇÃO
====================================================================

NÃO implementar nesta Sprint:

Form Builder
Document Engine
PDF
DOCX
Participações
Denúncias
Autos
Processos
Piquete
Mandados
BRP
PGR Workflow
Dashboards
Relatórios

Esses domínios pertencem às Sprints seguintes.

====================================================================
86. PREPARAÇÃO PARA PROCESSOS
====================================================================

Apesar de não implementar Processos nesta Sprint, o domínio deve ficar
preparado para responder futuramente:

Quem é o instrutor?

Em que unidade está?

Qual é a sua responsabilidade?

Pode receber este processo?

Pode consultar este processo?

É titular?

É substituto?

Recebeu delegação?

Qual é o seu escopo?

Não implementar estas regras ainda.

Apenas garantir que os modelos fornecem os dados necessários.

====================================================================
87. PREPARAÇÃO PARA DOCUMENTOS
====================================================================

O domínio deve fornecer bindings futuros como:

{{pessoa.nome}}

{{pessoa.bi}}

{{pessoa.profissao}}

{{organizacao.nome}}

{{organizacao.sigla}}

{{direcao.nome}}

{{departamento.nome}}

{{secao.nome}}

{{unidade.nome}}

{{pessoa.funcao}}

{{pessoa.responsabilidades}}

Não implementar o Form Builder.

Apenas garantir que o domínio seja consumível pelo futuro
Document Data Provider.

====================================================================
88. PREPARAÇÃO PARA DISTRIBUIÇÃO
====================================================================

No futuro o SIP deverá conseguir:

obter instrutores elegíveis;

filtrar por unidade;

filtrar por departamento;

filtrar por responsabilidade;

verificar disponibilidade;

verificar substituição;

verificar delegação.

Nesta Sprint apenas preparar os modelos e serviços necessários.

====================================================================
89. FINALIZAÇÃO
====================================================================

Executar:

lint
typecheck
unit tests
integration tests
authorization tests
E2E
build

Rever:

migrations
security
authorization
audit
documentation
tasks
commits

Actualizar:

docs/sprints/SPRINT-03.md

Status:

DONE

Criar:

chore(sprint-03): complete people and organizational management

====================================================================
90. RELATÓRIO FINAL
====================================================================

Apresentar obrigatoriamente:

1. resumo;
2. Tasks;
3. entidades;
4. migrations;
5. APIs;
6. frontend;
7. regras de hierarquia;
8. regras de lotação;
9. responsabilidades;
10. delegações;
11. substituições;
12. AccessContext;
13. RBAC;
14. autorização por escopo;
15. auditoria;
16. testes;
17. E2E;
18. documentação;
19. commits;
20. débitos técnicos;
21. preparação para SPRINT-04.

====================================================================
91. REGRA FINAL
====================================================================

NÃO iniciar automaticamente a SPRINT-04.

Após concluir esta Sprint:

PARAR.

Aguardar autorização explícita.

Próxima Sprint:

SPRINT-04 — NOTIFICAÇÕES E EVENTOS.

====================================================================
FIM DO PROMPT — SPRINT 03
====================================================================
```

### Resultado esperado da Sprint 03

No final, a fundação do SIP ficará essencialmente assim:

```text
                         USER
                          │
                          │
                       PERSON
                          │
             ┌────────────┼─────────────┐
             │            │             │
          LOTAÇÃO       FUNÇÃO      PAPEL FUNCIONAL
             │            │             │
             └────────────┼─────────────┘
                          │
                   UNIDADE ORGANIZACIONAL
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    Direcção         Departamento        Secção
                                           │
                                         Unidade


PERSON
  │
  ├── RESPONSABILIDADES
  │
  ├── DELEGAÇÕES
  │
  └── SUBSTITUIÇÕES
```

E isso prepara uma parte **muito importante do SIP**: quando chegarmos à distribuição de processos, não teremos simplesmente um campo `instrutor_id`. Poderemos determinar o **instrutor elegível com base em pessoa + lotação + unidade + função + responsabilidade + delegação/substituição + permissões**, sem contaminar o domínio de processos com regras administrativas.

**Próximo no roadmap: SPRINT 04 — Notificações e Eventos.**
