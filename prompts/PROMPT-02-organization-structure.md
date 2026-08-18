====================================================================
PROMPT 02 — SIP | ESTRUTURA ORGANIZACIONAL E CONTEXTO DE RESPONSABILIDADE
====================================================================

PROJECT:
SIP — Sistema de Instrução Processual

SPRINT:
SPRINT-02

OBJECTIVE:

Implementar a estrutura organizacional do SIP e o contexto de
responsabilidade dos utilizadores.

Esta Sprint deve estabelecer a base necessária para determinar:

- onde o utilizador está colocado;
- qual é a sua unidade;
- qual é a sua hierarquia;
- qual é o seu âmbito de responsabilidade;
- quais os dados organizacionais que pode consultar;
- quais os dados que pode operar.

IMPORTANTE:

Esta Sprint NÃO implementa ainda:

- Processos;
- Participações;
- Denúncias;
- Autos;
- Piquete;
- Form Builder;
- Documentos;
- Instrução Processual;
- Mandados;
- BRP;
- PGR;
- Relatórios funcionais.

====================================================================
1. CICLO OBRIGATÓRIO
====================================================================

Utilizar o lifecycle definido no AGENTS.md:

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

Seleccionar automaticamente as Agent Skills aplicáveis.

Quando necessário utilizar:

spec-driven-development
planning-and-task-breakdown
incremental-implementation
test-driven-development
debugging-and-error-recovery
code-review-and-quality
security-and-hardening
shipping-and-launch

Não utilizar skills artificialmente.

====================================================================
2. PRÉ-CONDIÇÕES
====================================================================

LER:

AGENTS.md

README.md

docs/architecture/system-architecture.md

docs/architecture/authentication.md

docs/architecture/authorization.md

docs/architecture/rbac.md

docs/architecture/security-model.md

docs/architecture/agent-skills.md

ADRs existentes.

Verificar SPRINT-01.

Executar:

- backend tests;
- frontend tests;
- E2E;
- lint;
- typecheck;
- build.

Se existir qualquer problema estrutural:

corrigir antes de continuar.

====================================================================
3. CONCEITO ORGANIZACIONAL
====================================================================

O SIP não deve tratar organização apenas como um campo textual.

A organização deve ser representada como uma estrutura hierárquica.

Modelo conceptual:

ORGANIZAÇÃO
    │
    ├── DIREÇÃO
    │       │
    │       ├── DEPARTAMENTO
    │       │       │
    │       │       └── SECÇÃO
    │       │
    │       └── SECÇÃO
    │
    └── OUTRAS UNIDADES

A estrutura real deve ser flexível.

Não assumir que todas as Direções possuem exactamente:

Departamento → Secção.

====================================================================
4. ENTIDADES
====================================================================

Criar a fundação para:

Organization
OrganizationalUnit
OrganizationalUnitType
OrganizationalRelationship
UserAssignment
ResponsibilityScope

Os nomes podem ser adaptados à arquitectura do projecto.

Evitar criar entidades redundantes.

====================================================================
5. ORGANIZATION
====================================================================

Criar entidade:

Organization

Representa a organização institucional principal.

Campos mínimos:

id
code
name
short_name
description
status
created_at
updated_at

Exemplo:

SIC
Serviço de Investigação Criminal

Não hardcodar o SIC como única organização na arquitectura.

====================================================================
6. ORGANIZATIONAL UNIT
====================================================================

Criar:

OrganizationalUnit

Representa uma unidade dentro da organização.

Exemplos:

Direção
Departamento
Secção
Unidade
Piquete
ou outras unidades institucionais.

Campos conceptuais:

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
7. HIERARQUIA
====================================================================

Utilizar:

parent_id

ou mecanismo equivalente.

Permitir:

Organization
 ↓
Direction
 ↓
Department
 ↓
Section

Mas também permitir estruturas diferentes.

Não criar tabelas rígidas:

directions
departments
sections

se isso impedir extensibilidade.

====================================================================
8. UNIT TYPE
====================================================================

Criar tipos organizacionais.

Exemplos:

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
9. CÓDIGOS
====================================================================

Cada unidade deve possuir código quando aplicável.

Exemplo:

DIR-001
DEP-001
SEC-001

O código deve possuir regras de unicidade adequadas.

Não assumir que o nome é único.

====================================================================
10. USER ASSIGNMENT
====================================================================

Um utilizador deve poder estar associado a uma unidade organizacional.

Criar:

UserAssignment

ou equivalente.

Campos conceptuais:

id
user_id
organizational_unit_id
assignment_type
is_primary
start_date
end_date
status

====================================================================
11. ASSIGNMENT TYPE
====================================================================

Preparar tipos como:

PRIMARY
SECONDARY
TEMPORARY
ACTING
DELEGATED

A arquitectura deve permitir futuras situações de substituição ou
delegação.

====================================================================
12. PRIMARY UNIT
====================================================================

Um utilizador pode possuir uma unidade principal.

Exemplo:

João
→ Direcção X
→ Departamento Y
→ Secção Z

A unidade principal será utilizada como contexto padrão.

====================================================================
13. MÚLTIPLAS UNIDADES
====================================================================

Não assumir:

User → 1 Unit

O sistema deve permitir futuramente:

User
→ Unit A
→ Unit B

Mas deve existir uma unidade principal quando necessário.

====================================================================
14. PROFILE + ORGANIZATION
====================================================================

Não confundir:

PERFIL

com:

UNIDADE ORGANIZACIONAL.

Exemplo:

Um utilizador pode ser:

INSTRUTOR_PROCESSUAL

e estar colocado em:

Direcção X
Departamento Y
Secção Z.

Outro utilizador pode ter o mesmo perfil:

INSTRUTOR_PROCESSUAL

mas estar noutra Direcção.

O perfil define capacidades.

A organização define contexto.

====================================================================
15. RESPONSIBILITY SCOPE
====================================================================

Criar conceito:

ResponsibilityScope

ou equivalente.

O scope deve representar o alcance de responsabilidade do utilizador.

Exemplos:

GLOBAL
ORGANIZATION
DIRECTION
DEPARTMENT
SECTION
OWN
ASSIGNED
PIQUETE
PGR

====================================================================
16. ACCESS CONTEXT
====================================================================

Criar conceito:

AccessContext

ou equivalente.

O contexto deve permitir determinar:

user
profile
organization
primary_unit
units
responsibility_scope

Não colocar esta lógica directamente em cada endpoint.

====================================================================
17. AUTHORIZATION + ORGANIZATION
====================================================================

A autorização futura deve poder avaliar:

Permission
+
Profile
+
Organizational Scope
+
Ownership
+
Assignment

Exemplo:

INSTRUTOR_PROCESSUAL
+
process.read
+
OWN/ASSIGNED

≠

acesso a todos os processos.

====================================================================
18. EXEMPLO — INSTRUTOR
====================================================================

Utilizador:

João

Perfil:

INSTRUTOR_PROCESSUAL

Unidade:

Direcção de Investigação X
→ Departamento Y
→ Secção Z

Responsabilidade:

OWN / ASSIGNED

Resultado futuro:

João vê apenas processos/documentos que estejam dentro do seu
âmbito de responsabilidade.

NÃO implementar esta regra directamente nos Processos nesta Sprint.

Apenas construir a infraestrutura.

====================================================================
19. EXEMPLO — CHEFE DE SECÇÃO
====================================================================

Utilizador:

Maria

Perfil:

CHEFE_SECCAO

Unidade:

Direcção X
→ Departamento Y
→ Secção Z

Responsabilidade futura:

SECTION

Isso poderá permitir consultar dados da sua Secção, de acordo com
as permissões.

====================================================================
20. EXEMPLO — CHEFE DE DEPARTAMENTO
====================================================================

Utilizador:

Carlos

Perfil:

CHEFE_DEPARTAMENTO

Unidade:

Direcção X
→ Departamento Y

Responsabilidade:

DEPARTMENT

Deve futuramente poder consultar dados dentro do âmbito autorizado
do Departamento.

====================================================================
21. EXEMPLO — DIRECTOR
====================================================================

Utilizador:

Director X

Perfil:

DIRECTOR

Unidade:

Direcção X

Responsabilidade:

DIRECTION

O sistema deverá posteriormente restringir os dados ao âmbito da
Direcção, salvo permissões superiores.

====================================================================
22. SECRETARIA GERAL
====================================================================

SECRETARIA_GERAL deve ser suportada como perfil organizacional
especial.

Não assumir que Secretaria Geral está obrigatoriamente dentro de uma
Direcção comum.

A arquitectura deve permitir uma unidade própria.

====================================================================
23. PIQUETE
====================================================================

O Piquete deverá ser representado como unidade organizacional ou
unidade funcional própria.

Preparar:

PIQUETE

Não implementar ainda o módulo funcional do Piquete.

Posteriormente poderá existir:

Piquete da Direcção A
Piquete da Direcção B

O sistema deve conseguir separar esses contextos.

====================================================================
24. PGR
====================================================================

Preparar o contexto:

AGENTE_PGR

A PGR pode possuir contexto organizacional próprio.

Não assumir que AGENTE_PGR pertence à estrutura interna do SIC.

O modelo deve permitir representar uma organização externa ou
interoperável.

====================================================================
25. ORGANIZAÇÕES EXTERNAS
====================================================================

Preparar arquitectura para organizações externas.

Exemplo:

SIC
PGR
outras entidades institucionais.

Não implementar interoperabilidade PGR nesta Sprint.

Apenas garantir que o modelo não impeça isso.

====================================================================
26. HIERARCHY SERVICE
====================================================================

Criar serviço para operações como:

get_parent()
get_children()
get_ancestors()
get_descendants()
get_root()
get_unit_path()

Os nomes podem ser adaptados.

Não duplicar queries hierárquicas pelos módulos.

====================================================================
27. ORGANIZATION SERVICE
====================================================================

Criar serviço central para:

- obter unidade;
- obter hierarquia;
- validar relação;
- obter contexto;
- obter unidades do utilizador.

====================================================================
28. API
====================================================================

Criar endpoints administrativos necessários.

Exemplos:

GET    /api/v1/organizations
POST   /api/v1/organizations

GET    /api/v1/organizational-units
POST   /api/v1/organizational-units
GET    /api/v1/organizational-units/{id}
PATCH  /api/v1/organizational-units/{id}

GET    /api/v1/users/{id}/assignments
POST   /api/v1/users/{id}/assignments

GET    /api/v1/me/organization-context

Os endpoints devem respeitar RBAC.

Não criar endpoints apenas porque são teoricamente possíveis.

====================================================================
29. CURRENT ORGANIZATION CONTEXT
====================================================================

Criar:

GET /api/v1/me/organization-context

Deve retornar o contexto organizacional do utilizador autenticado.

Exemplo conceptual:

{
    "organization": {},
    "primary_unit": {},
    "units": [],
    "profile": {},
    "responsibility_scopes": []
}

====================================================================
30. FRONTEND
====================================================================

Criar interfaces administrativas para:

- organização;
- unidades;
- hierarquia;
- atribuições de utilizadores.

Não criar um CMS genérico.

A interface deve ser adequada a administração institucional.

====================================================================
31. ORGANIZATION TREE
====================================================================

Criar componente:

OrganizationTree

Deve permitir:

- expandir;
- recolher;
- seleccionar;
- visualizar hierarquia;
- navegar.

Utilizar shadcn/ui quando aplicável.

Utilizar Lucide React para ícones.

====================================================================
32. USER ASSIGNMENT UI
====================================================================

Criar interface para associar utilizadores a unidades.

Permitir:

- seleccionar utilizador;
- seleccionar unidade;
- definir tipo;
- definir principal;
- definir período;
- activar/desactivar.

====================================================================
33. HUMANIZAÇÃO
====================================================================

Nunca mostrar:

ORGANIZATIONAL_UNIT
PRIMARY_ASSIGNMENT
CHEFE_SECCAO

de forma técnica.

Humanizar todos os valores.

====================================================================
34. AUDITORIA
====================================================================

Auditar operações relevantes:

ORGANIZATION_CREATED
ORGANIZATION_UPDATED

UNIT_CREATED
UNIT_UPDATED
UNIT_MOVED
UNIT_DEACTIVATED

USER_ASSIGNED
USER_UNASSIGNED

SCOPE_CHANGED

Não registar dados desnecessários.

====================================================================
35. REGRAS DE INTEGRIDADE
====================================================================

Impedir:

- unidade ser filha de si própria;
- ciclos hierárquicos;
- parent inexistente;
- organização inconsistente;
- atribuição inválida;
- múltiplas unidades primárias simultâneas sem regra explícita.

Criar validações no domínio e banco quando apropriado.

====================================================================
36. MOVIMENTAÇÃO
====================================================================

Preparar possibilidade de mover uma unidade:

Departamento A
→ Departamento B

Sem quebrar a integridade hierárquica.

Se a operação exigir regras especiais:

validar antes.

====================================================================
37. DESACTIVAÇÃO
====================================================================

Uma unidade não deve necessariamente ser apagada fisicamente.

Preferir:

ACTIVE
INACTIVE

quando existir histórico.

Não destruir dados históricos desnecessariamente.

====================================================================
38. HISTÓRICO
====================================================================

Preparar arquitectura para histórico de:

- alterações organizacionais;
- movimentações;
- atribuições;
- alterações de contexto.

Não criar um sistema de auditoria gigantesco.

Utilizar a infraestrutura de auditoria já existente.

====================================================================
39. TESTES
====================================================================

Testar:

Organization

- criação;
- edição;
- desactivação.

OrganizationalUnit

- criação;
- hierarquia;
- parent;
- children;
- ancestors;
- descendants.

Integrity:

- self-parent;
- cycle;
- invalid parent;
- cross-organization invalid relation.

UserAssignment:

- assignment;
- primary assignment;
- multiple assignments;
- assignment removal;
- invalid assignment.

====================================================================
40. AUTHORIZATION TESTS
====================================================================

Verificar que:

ADMINISTRADOR_SISTEMA
→ pode administrar organização conforme permissões.

DIRECTOR
→ não pode administrar globalmente sem permissão.

CHEFE_DEPARTAMENTO
→ não recebe automaticamente acesso global.

CHEFE_SECCAO
→ não recebe automaticamente acesso ao Departamento inteiro.

INSTRUTOR_PROCESSUAL
→ não recebe acesso global.

AGENTE_PIQUETE
→ não recebe acesso a todas as Direcções.

AGENTE_PGR
→ não recebe automaticamente acesso à estrutura interna completa
do SIC.

====================================================================
41. FRONTEND TESTS
====================================================================

Testar:

- Organization Tree;
- criação de unidade;
- edição;
- movimentação;
- atribuição de utilizador;
- contexto actual;
- permissões.

====================================================================
42. E2E
====================================================================

Criar fluxo:

Login Administrador
 ↓
Organização
 ↓
Criar Direcção
 ↓
Criar Departamento
 ↓
Criar Secção
 ↓
Atribuir utilizador
 ↓
Consultar contexto

Criar também fluxo negativo:

utilizador sem permissão
 ↓
tentativa de administração
 ↓
403

====================================================================
43. TASKS
====================================================================

Criar:

TASK-001-organization-domain.md
TASK-002-organizational-unit.md
TASK-003-hierarchy.md
TASK-004-user-assignment.md
TASK-005-responsibility-scope.md
TASK-006-access-context.md
TASK-007-organization-api.md
TASK-008-organization-ui.md
TASK-009-authorization-integration.md
TASK-010-audit.md
TASK-011-tests.md
TASK-012-documentation.md

Cada Task deve declarar:

Skills aplicáveis.

====================================================================
44. COMMITS
====================================================================

Cada Task concluída deve gerar commit.

Exemplos:

feat(org): add organization domain

feat(org): add organizational hierarchy

feat(org): add user assignments

feat(org): add responsibility scopes

feat(org): add organization context

test(org): add hierarchy validation

docs(org): document organizational model

====================================================================
45. DOCUMENTAÇÃO
====================================================================

Criar:

docs/architecture/organization-model.md

docs/architecture/access-context.md

docs/architecture/responsibility-scopes.md

Documentar claramente:

Profile ≠ Organization

Permission ≠ Scope

Scope ≠ Ownership

====================================================================
46. DEFINITION OF DONE
====================================================================

SPRINT-02 somente estará concluída quando:

[ ] Organization
[ ] OrganizationalUnit
[ ] OrganizationalUnitType
[ ] Hierarchy
[ ] UserAssignment
[ ] ResponsibilityScope
[ ] AccessContext
[ ] Organization Service
[ ] Hierarchy Service
[ ] APIs
[ ] Organization UI
[ ] Organization Tree
[ ] User Assignment UI
[ ] Authorization integration
[ ] Audit
[ ] Integrity validation
[ ] Backend tests
[ ] Frontend tests
[ ] E2E
[ ] Documentation
[ ] Migrations
[ ] Seeds actualizados
[ ] Lint PASS
[ ] Typecheck PASS
[ ] Tests PASS
[ ] Build PASS
[ ] Tasks DONE
[ ] Commits realizados

====================================================================
47. REGRA ABSOLUTA
====================================================================

NÃO iniciar SPRINT-03 automaticamente.

NÃO implementar ainda:

- notificações;
- documentos;
- Form Builder;
- Piquete;
- participações;
- denúncias;
- autos;
- processos.

Depois de concluir:

PARAR.

Apresentar relatório completo da Sprint.

Aguardar autorização explícita para:

SPRINT-03 — NOTIFICAÇÕES E EVENTOS DO SIP.

====================================================================
FIM DO PROMPT 02
====================================================================
