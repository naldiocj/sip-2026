====================================================================
SIP — SPRINT 01
IDENTIDADE, AUTENTICAÇÃO, AUTORIZAÇÃO E RBAC
====================================================================

PROJECT:
SIP — Sistema de Instrução Processual

SPRINT:
SPRINT-01

OBJECTIVE:

Implementar a fundação de identidade e controlo de acesso do SIP.

Esta Sprint deverá estabelecer a base sobre a qual todos os módulos
posteriores irão funcionar.

IMPORTANTE:

O agente deve utilizar obrigatoriamente o sistema Agent Skills já
integrado no projecto.

Antes de executar qualquer tarefa:

1. analisar a intenção;
2. verificar as skills disponíveis;
3. seleccionar automaticamente as skills aplicáveis;
4. invocar a skill apropriada;
5. seguir o lifecycle definido no AGENTS.md;
6. testar;
7. rever;
8. criar commit.

NÃO saltar directamente para implementação.

====================================================================
1. CICLO OBRIGATÓRIO
====================================================================

Para esta Sprint utilizar o ciclo:

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

Skills esperadas quando aplicáveis:

DEFINE:
spec-driven-development

PLAN:
planning-and-task-breakdown

BUILD:
incremental-implementation
test-driven-development

VERIFY:
debugging-and-error-recovery

REVIEW:
code-review-and-quality

SECURITY:
security-and-hardening

SHIP:
shipping-and-launch

Utilizar apenas as skills realmente aplicáveis.

Não executar skills artificialmente apenas para cumprir uma lista.

====================================================================
2. PRÉ-CONDIÇÕES
====================================================================

Antes de começar:

LER:

AGENTS.md

README.md

docs/architecture/system-architecture.md

docs/architecture/agent-skills.md

docs/architecture/agent-skills.md

ADRs existentes

docs/sprints/

prompts/tasks/

Verificar a SPRINT-00.

Executar:

- testes;
- lint;
- typecheck;
- build.

Se a SPRINT-00 estiver quebrada:

PARAR.

Corrigir primeiro a fundação quebrada.

Não construir funcionalidades sobre uma base instável.

====================================================================
3. CRIAR SPRINT
====================================================================

Criar:

docs/sprints/SPRINT-01.md

Conteúdo mínimo:

# SPRINT-01
## Identidade, Autenticação, Autorização e RBAC

Status:
IN_PROGRESS

Objetivo:
...

Tasks:
...

Skills:
...

Acceptance Criteria:
...

Definition of Done:
...

====================================================================
4. TASKS
====================================================================

Criar:

prompts/tasks/sprint-01/

Criar inicialmente:

TASK-001-user-domain.md
TASK-002-profile-domain.md
TASK-003-permission-domain.md
TASK-004-rbac.md
TASK-005-authentication.md
TASK-006-session-management.md
TASK-007-authorization-engine.md
TASK-008-frontend-auth.md
TASK-009-protected-routes.md
TASK-010-authorized-navigation.md
TASK-011-security-audit.md
TASK-012-tests.md
TASK-013-documentation.md

Cada Task deve possuir:

Objective
Context
Scope
Dependencies
Skills
Implementation
Acceptance Criteria
Tests
Definition of Done

====================================================================
5. PRINCÍPIO FUNDAMENTAL
====================================================================

NÃO confundir:

AUTENTICAÇÃO

com:

AUTORIZAÇÃO.

Autenticação responde:

"Quem é este utilizador?"

Autorização responde:

"O que este utilizador pode fazer?"

E o SIP necessita ainda de:

"Em que contexto organizacional ele pode fazer isso?"

Portanto:

IDENTITY
 ↓
PROFILE
 ↓
PERMISSION
 ↓
ORGANIZATIONAL SCOPE
 ↓
RESOURCE
 ↓
ACTION

====================================================================
6. PERFIS OFICIAIS
====================================================================

Criar os seguintes perfis:

ADMINISTRADOR_SISTEMA
DIRECTOR
SECRETARIA_GERAL
CHEFE_DEPARTAMENTO
CHEFE_SECCAO
INSTRUTOR_PROCESSUAL
AGENTE_PIQUETE
EDITOR_DOCUMENTAL
AGENTE_PGR

Humanização:

Administrador do Sistema
Director
Secretaria Geral
Chefe de Departamento
Chefe de Secção
Instrutor Processual
Agente de Piquete
Editor Documental
Agente PGR

Nunca apresentar os identificadores técnicos na interface.

====================================================================
7. USER
====================================================================

Criar entidade User.

Campos mínimos:

id
username
email
password_hash
full_name
employee_number
status
is_active
created_at
updated_at
last_login_at

Adicionar apenas campos que façam sentido arquitecturalmente.

Não criar campos fictícios sem utilização prevista.

====================================================================
8. USER STATUS
====================================================================

Utilizar estados:

ACTIVE
INACTIVE
BLOCKED
PENDING

Humanizar na interface.

Não utilizar múltiplos booleanos para representar estados complexos.

====================================================================
9. PASSWORD
====================================================================

Implementar password hashing seguro.

NUNCA:

- guardar password em texto;
- devolver password;
- escrever password em logs;
- guardar password em auditoria;
- colocar password em seeds de produção.

====================================================================
10. AUTHENTICATION
====================================================================

Implementar:

JWT Access Token

Preparar arquitectura para:

Refresh Token

sem introduzir complexidade desnecessária.

Claims devem ser mínimos.

Não colocar permissões completas dentro do JWT se isso criar problemas
de invalidação ou consistência.

====================================================================
11. LOGIN
====================================================================

Criar:

POST /api/v1/auth/login

Fluxo:

credentials
 ↓
find user
 ↓
validate status
 ↓
verify password
 ↓
create authentication session
 ↓
issue token
 ↓
return authenticated user context

Não revelar se o username/email existe.

====================================================================
12. CURRENT USER
====================================================================

Criar:

GET /api/v1/auth/me

Retornar:

id
username
full_name
profiles
permissions relevantes
status
contexto necessário

Nunca retornar:

password_hash
secrets
tokens internos

====================================================================
13. LOGOUT
====================================================================

Criar:

POST /api/v1/auth/logout

Implementar de acordo com a estratégia de sessão/token escolhida.

Documentar a decisão arquitectural.

====================================================================
14. SESSION
====================================================================

Criar fundação para sessões.

Registrar, quando apropriado:

session_id
user_id
created_at
expires_at
revoked_at
ip
user_agent

Evitar armazenamento de informação desnecessária.

====================================================================
15. PROFILE
====================================================================

Criar Profile.

Cada profile deve possuir:

id
code
name
description
is_active

Garantir unicidade do code.

====================================================================
16. PERMISSION
====================================================================

Criar modelo:

Permission

Formato conceptual:

resource.action

Exemplos:

user.read
user.create
user.update

profile.read
profile.manage

permission.read
permission.manage

document.read
document.create
document.edit
document.publish

process.read
process.create
process.update
process.assign

notification.read
notification.manage

organization.read
organization.manage

Não implementar ainda todas as permissões dos módulos futuros.

Criar apenas a estrutura extensível.

====================================================================
17. RBAC
====================================================================

Criar:

Profile
    ↓
ProfilePermission
    ↓
Permission

Não espalhar regras:

if user.profile == ...

por todo o código.

Criar um mecanismo centralizado.

====================================================================
18. AUTHORIZATION SERVICE
====================================================================

Criar serviço central de autorização.

Exemplo conceptual:

AuthorizationService

Deve permitir:

has_permission()
require_permission()
has_profile()
require_profile()

A implementação concreta pode utilizar outro nome caso seja
arquitecturalmente melhor.

====================================================================
19. ORGANIZATIONAL SCOPE
====================================================================

Preparar suporte para:

GLOBAL
DIRECTION
DEPARTMENT
SECTION
OWN
ASSIGNED
PIQUETE
PGR

IMPORTANTE:

Nesta Sprint não implementar toda a estrutura organizacional.

Apenas criar a fundação necessária.

A SPRINT-02 irá implementar:

Direção
Departamento
Secção
Unidade
Lotação
Responsabilidade
Hierarquia organizacional.

====================================================================
20. OWNERSHIP
====================================================================

A arquitectura deve permitir futuramente:

Instrutor A
→ processos atribuídos/autorizados ao Instrutor A.

Instrutor B
→ não vê os processos do Instrutor A.

NÃO implementar:

if user.id == ...

espalhado pelos endpoints.

Criar fundação para políticas de acesso por ownership.

====================================================================
21. ADMINISTRADOR
====================================================================

ADMINISTRADOR_SISTEMA terá permissões administrativas elevadas.

Porém:

NÃO criar:

if admin:

em todos os endpoints.

Usar o AuthorizationService.

====================================================================
22. EDITOR DOCUMENTAL
====================================================================

Criar o perfil:

EDITOR_DOCUMENTAL

Preparar permissões relacionadas com:

document templates
document types
components
assets

NÃO implementar o Form Builder nesta Sprint.

====================================================================
23. AGENTE PIQUETE
====================================================================

Criar:

AGENTE_PIQUETE

Não implementar ainda:

- participação;
- denúncia;
- auto;
- peça;
- piquete;
- processo.

Isso será feito posteriormente.

====================================================================
24. AGENTE PGR
====================================================================

Criar:

AGENTE_PGR

Não conceder acesso global.

O acesso específico da PGR será baseado em:

permissions
+
organizational scope
+
process/document rules

====================================================================
25. FASTAPI DEPENDENCIES
====================================================================

Criar mecanismo equivalente a:

get_current_user()

require_authenticated_user()

require_permission()

require_profile()

Não duplicar lógica de autenticação nos routers.

====================================================================
26. FRONTEND
====================================================================

Implementar arquitectura de autenticação no Next.js.

Criar:

auth client
session handling
authenticated application shell
protected areas

Manter compatibilidade com:

Next.js App Router
Server Components
Client Components

Não transformar toda a aplicação em Client Components.

====================================================================
27. API CLIENT
====================================================================

Criar cliente HTTP central.

Responsável por:

- base URL;
- authentication;
- correlation ID;
- error handling;
- session handling.

Não duplicar fetch logic em todas as páginas.

====================================================================
28. PROTECTED ROUTES
====================================================================

Criar protecção para:

/app

e futuras áreas autenticadas.

A protecção do frontend é apenas UX.

A segurança real permanece no backend.

====================================================================
29. SIDEBAR
====================================================================

Implementar a arquitectura dinâmica do Sidebar.

O Sidebar deverá posteriormente considerar:

User
Profile
Permission
Scope

Não hardcodar:

"se perfil X mostrar menu Y"

sem uma camada de autorização/navegação bem definida.

Separar:

Navigation metadata

de:

Security authorization.

O Sidebar nunca é mecanismo de segurança.

====================================================================
30. HUMANIZATION
====================================================================

Criar mecanismo central para humanização.

Exemplos:

CHEFE_SECCAO
→ Chefe de Secção

AGENTE_PGR
→ Agente PGR

DOCUMENT_PUBLISH
→ Publicar documento

PROCESS_READ
→ Consultar processos

Nunca exibir enums técnicos.

====================================================================
31. SECURITY AUDIT
====================================================================

Preparar auditoria para:

LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
SESSION_REVOKED
PERMISSION_DENIED
ACCOUNT_BLOCKED
PASSWORD_CHANGED

A auditoria deve registrar:

actor
timestamp
action
resource quando aplicável
result
request/correlation id quando aplicável

Nunca registrar:

password
access token
refresh token

====================================================================
32. RATE LIMITING
====================================================================

Preparar rate limiting para:

login
refresh
password operations

Utilizar Redis quando necessário.

Não criar uma arquitectura excessivamente complexa.

====================================================================
33. DATABASE
====================================================================

Criar migrations com Alembic.

Não modificar PostgreSQL manualmente.

Toda alteração estrutural deve possuir migration.

====================================================================
34. DEVELOPMENT SEED
====================================================================

Criar seed de desenvolvimento.

Criar um utilizador de desenvolvimento para cada perfil:

Administrador
Director
Secretaria Geral
Chefe de Departamento
Chefe de Secção
Instrutor
Agente Piquete
Editor Documental
Agente PGR

Credenciais DEV devem:

- estar documentadas;
- não ser credenciais reais;
- nunca ser utilizadas em produção.

====================================================================
35. TESTES
====================================================================

Implementar TDD quando aplicável.

Testar:

AUTHENTICATION

- login válido;
- password inválida;
- utilizador inexistente;
- utilizador inactivo;
- utilizador bloqueado;
- token inválido;
- token expirado.

AUTHORIZATION

- permission granted;
- permission denied;
- profile granted;
- profile denied.

SESSION

- login;
- logout;
- revoked session;
- expired session.

API

- /auth/login;
- /auth/me;
- /auth/logout;
- endpoint protegido.

====================================================================
36. FRONTEND TESTS
====================================================================

Testar:

- login;
- logout;
- sessão;
- utilizador autenticado;
- utilizador não autenticado;
- route protection;
- sidebar;
- permission-based navigation.

====================================================================
37. E2E
====================================================================

Criar:

E2E-001

Login
 ↓
Dashboard
 ↓
/auth/me
 ↓
Logout

Criar também:

E2E-002

Login
 ↓
Acesso a recurso permitido
 ↓
Acesso a recurso proibido
 ↓
403

====================================================================
38. DOCUMENTAÇÃO
====================================================================

Criar:

docs/architecture/authentication.md

docs/architecture/authorization.md

docs/architecture/rbac.md

docs/architecture/security-model.md

Criar ADRs para decisões relevantes.

====================================================================
39. TASK EXECUTION
====================================================================

Para cada Task:

DEFINE
→ seleccionar skills aplicáveis

PLAN
→ decompor

BUILD
→ implementar incrementalmente

VERIFY
→ executar testes

REVIEW
→ revisão técnica e segurança

SHIP
→ commit

Uma Task só pode ser marcada:

DONE

quando:

- implementação concluída;
- testes passam;
- lint passa;
- typecheck passa;
- documentação actualizada;
- review concluído;
- commit criado.

====================================================================
40. COMMITS
====================================================================

Utilizar Conventional Commits.

Exemplos:

feat(auth): add user domain

feat(auth): implement jwt authentication

feat(auth): add permission model

feat(auth): implement authorization service

feat(frontend): add authenticated shell

test(auth): add authentication tests

test(auth): add authorization tests

docs(auth): document security model

====================================================================
41. DEFINITION OF DONE
====================================================================

SPRINT-01 só pode ser concluída quando:

[ ] User
[ ] Profile
[ ] Permission
[ ] RBAC
[ ] Authentication
[ ] JWT
[ ] Session
[ ] Authorization Service
[ ] Permission dependencies
[ ] Frontend authentication
[ ] Protected routes
[ ] Dynamic navigation foundation
[ ] Humanized permissions/profiles
[ ] Security audit foundation
[ ] Rate limiting foundation
[ ] Migrations
[ ] DEV seed
[ ] Backend tests
[ ] Frontend tests
[ ] E2E tests
[ ] Documentation
[ ] Skills utilizadas correctamente
[ ] Todas Tasks DONE
[ ] Lint PASS
[ ] Typecheck PASS
[ ] Tests PASS
[ ] Build PASS
[ ] Commits realizados

====================================================================
42. REGRA ABSOLUTA
====================================================================

NÃO iniciar SPRINT-02 automaticamente.

NÃO implementar:

- estrutura organizacional completa;
- processos;
- piquete;
- documentos;
- Form Builder;
- notificações;
- PGR.

Esses módulos pertencem a Sprints posteriores.

====================================================================
43. RELATÓRIO FINAL
====================================================================

Ao terminar:

Apresentar:

1. Tasks concluídas.
2. Skills utilizadas por Task.
3. Arquitectura criada.
4. Endpoints.
5. Models.
6. Migrations.
7. Testes.
8. E2E.
9. Problemas encontrados.
10. ADRs.
11. Commits.
12. Estado da Sprint.

Depois:

PARAR.

Aguardar autorização para:

SPRINT-02 — ESTRUTURA ORGANIZACIONAL E CONTEXTO DE RESPONSABILIDADE.

====================================================================
FIM DO PROMPT 01
====================================================================