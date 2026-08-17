====================================================================
PROMPT 01 — SIP | IDENTIDADE, AUTENTICAÇÃO E AUTORIZAÇÃO
====================================================================

PROJECT:
SIP — Sistema de Instrução Processual

SPRINT:
SPRINT-01

OBJECTIVE:
Implementar a fundação completa de identidade, autenticação,
autorização, perfis, permissões e controlo de acesso do SIP.

====================================================================
1. PRÉ-CONDIÇÕES
====================================================================

ANTES DE COMEÇAR:

1. Ler AGENTS.md.
2. Ler README.md.
3. Ler docs/architecture/system-architecture.md.
4. Ler todos os ADRs relacionados.
5. Ler docs/sprints/SPRINT-00.
6. Ler as Tasks concluídas da SPRINT-00.
7. Inspeccionar o código realmente existente.
8. Confirmar que a SPRINT-00 está funcional.
9. Executar os testes existentes.

NÃO assumir que algo foi implementado apenas porque está documentado.

Se alguma dependência da SPRINT-00 estiver quebrada:

- identificar;
- corrigir;
- testar;
- criar commit;
- só depois continuar.

====================================================================
2. PERFIS OFICIAIS
====================================================================

O SIP terá os seguintes perfis:

ADMINISTRADOR_SISTEMA
DIRECTOR
SECRETARIA_GERAL
CHEFE_DEPARTAMENTO
CHEFE_SECCAO
INSTRUTOR_PROCESSUAL
AGENTE_PIQUETE
EDITOR_DOCUMENTAL
AGENTE_PGR

Os códigos acima são identificadores técnicos.

Na interface devem ser apresentados de forma humanizada:

Administrador do Sistema
Director
Secretaria Geral
Chefe de Departamento
Chefe de Secção
Instrutor Processual
Agente de Piquete
Editor Documental
Agente PGR

Nunca mostrar enums técnicos directamente na interface.

====================================================================
3. PRINCÍPIO FUNDAMENTAL DE AUTORIZAÇÃO
====================================================================

NÃO implementar segurança apenas no frontend.

O frontend pode:

- ocultar menus;
- ocultar botões;
- proteger rotas;
- melhorar UX.

Mas a segurança real deve estar no backend.

Toda operação protegida deve ser validada no backend.

Fluxo:

USER
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
4. MODELO DE IDENTIDADE
====================================================================

Criar os conceitos:

User
Profile
Permission
Role/Profile Assignment
Organization Scope
User Session

O modelo deve permitir que um utilizador possa futuramente possuir
mais de um contexto/perfil quando o negócio exigir.

Não assumir que:

User → apenas um Profile

se isso limitar a evolução futura.

====================================================================
5. USER
====================================================================

Criar entidade User.

Campos mínimos:

id
username
email
password_hash
full_name
employee_number quando aplicável
status
is_active
created_at
updated_at
last_login_at

Não armazenar passwords em texto puro.

Nunca devolver password_hash nas respostas da API.

Utilizar UUID quando apropriado.

====================================================================
6. USER STATUS
====================================================================

Criar estados adequados.

Exemplo:

ACTIVE
INACTIVE
BLOCKED
PENDING

Não utilizar booleanos espalhados para representar estados complexos.

A interface deve humanizar os estados.

====================================================================
7. PASSWORD SECURITY
====================================================================

Utilizar algoritmo seguro de password hashing.

Nunca:

- guardar password em texto;
- devolver password;
- escrever password nos logs;
- incluir password em auditoria.

Criar política mínima de password.

Preparar arquitectura para futura alteração da política sem alterar
todo o sistema.

====================================================================
8. AUTENTICAÇÃO
====================================================================

Implementar autenticação baseada em JWT.

Criar:

Access Token

e preparar:

Refresh Token

A arquitectura deve permitir revogação de sessões quando necessário.

Não guardar tokens sensíveis de forma insegura.

Definir correctamente:

- expiração;
- issuer;
- audience quando aplicável;
- subject;
- claims mínimos.

Não colocar dados excessivos no JWT.

====================================================================
9. LOGIN
====================================================================

Criar endpoint:

POST /api/v1/auth/login

Fluxo:

credentials
 ↓
validate user
 ↓
validate password
 ↓
validate account status
 ↓
create session/token
 ↓
return authentication result

Em caso de credenciais inválidas:

não revelar se:

- username existe;
- email existe;
- password está errada.

Evitar user enumeration.

====================================================================
10. CURRENT USER
====================================================================

Criar:

GET /api/v1/auth/me

Deve devolver dados seguros do utilizador autenticado.

Exemplo conceptual:

{
    "id": "...",
    "username": "...",
    "full_name": "...",
    "profiles": [],
    "permissions": [],
    "organization_scope": []
}

Nunca devolver:

password_hash
refresh secrets
internal security secrets

====================================================================
11. LOGOUT
====================================================================

Implementar logout de forma coerente com a estratégia de tokens.

Se Refresh Tokens forem utilizados:

- permitir revogação;
- invalidar sessão;
- limpar estado necessário.

Não assumir que simplesmente apagar o token do frontend é suficiente
para toda a arquitectura.

====================================================================
12. SESSÕES
====================================================================

Criar modelo de sessão quando necessário.

Registar:

- session id;
- user;
- created_at;
- expires_at;
- revoked_at;
- ip quando permitido;
- user_agent quando necessário.

Evitar armazenar dados desnecessários.

====================================================================
13. PROFILES
====================================================================

Criar entidade/enum para perfis.

Perfis:

ADMINISTRADOR_SISTEMA
DIRECTOR
SECRETARIA_GERAL
CHEFE_DEPARTAMENTO
CHEFE_SECCAO
INSTRUTOR_PROCESSUAL
AGENTE_PIQUETE
EDITOR_DOCUMENTAL
AGENTE_PGR

Os perfis devem possuir:

- código;
- nome humanizado;
- descrição;
- status.

====================================================================
14. PERMISSIONS
====================================================================

Não utilizar apenas permissões genéricas como:

ADMIN
USER
READ
WRITE

Criar um modelo preparado para permissões de negócio.

Estrutura conceptual:

RESOURCE
+
ACTION

Exemplo:

process.read
process.create
process.update
process.assign

document.read
document.create
document.edit
document.publish

user.read
user.create
user.update

notification.read
notification.manage

organization.read
organization.manage

As permissões devem ser extensíveis.

====================================================================
15. RBAC
====================================================================

Implementar:

Profile → Permissions

Um perfil poderá possuir várias permissões.

Uma permissão poderá estar associada a vários perfis.

Não espalhar regras de autorização directamente pelos controllers.

Criar mecanismo centralizado.

Exemplo conceptual:

AuthorizationService

ou equivalente adequado à arquitectura.

====================================================================
16. RESOURCE SCOPE
====================================================================

O SIP possui responsabilidade organizacional.

Portanto:

PERMISSION ≠ acesso universal.

Um utilizador pode possuir:

process.read

mas isso NÃO significa que possa ler todos os processos.

Preparar o modelo para:

GLOBAL
ORGANIZATION
DIRECTION
DEPARTMENT
SECTION
OWN
ASSIGNED
PGR
PIQUETE

A implementação completa dos scopes organizacionais será aprofundada
na SPRINT-02.

Nesta Sprint deve existir a fundação necessária.

====================================================================
17. OWN / ASSIGNED
====================================================================

Preparar suporte para regras como:

Instrutor A
→ vê apenas processos autorizados/atribuídos ao Instrutor A.

Instrutor B
→ não vê os processos do Instrutor A.

Não implementar isto com:

if current_user.username == ...

Criar uma arquitectura baseada em scopes e ownership.

====================================================================
18. ADMINISTRADOR
====================================================================

ADMINISTRADOR_SISTEMA possui privilégios elevados para administração
da plataforma.

Porém:

NÃO utilizar "if admin" espalhado pelo código.

As permissões devem continuar a ser avaliadas pelo mecanismo de
autorização.

====================================================================
19. EDITOR DOCUMENTAL
====================================================================

EDITOR_DOCUMENTAL terá posteriormente acesso ao:

- Form Builder;
- Templates;
- Componentes;
- Assets;
- Document Types;
- publicação de templates.

Nesta Sprint criar apenas o perfil e as permissões-base.

NÃO implementar ainda o Form Builder.

====================================================================
20. AGENTE PIQUETE
====================================================================

AGENTE_PIQUETE terá posteriormente acesso às funcionalidades do Piquete.

Nesta Sprint apenas preparar:

AGENTE_PIQUETE

Não implementar ainda:

- Entrada de Peças;
- Participações;
- Autos;
- Denúncias;
- Ocorrências;
- documentos do Piquete.

Isso será feito em Sprints posteriores.

====================================================================
21. AGENTE PGR
====================================================================

Criar o perfil:

AGENTE_PGR

Este perfil terá posteriormente um contexto específico de acesso à
informação disponibilizada para a PGR.

NÃO conceder acesso global aos processos.

A autorização específica PGR será implementada posteriormente.

====================================================================
22. API AUTH
====================================================================

Criar endpoints adequados.

Mínimo:

POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me

Preparar arquitectura para:

POST /api/v1/auth/refresh

quando Refresh Token estiver implementado.

====================================================================
23. AUTH DEPENDENCY
====================================================================

Criar dependência FastAPI para obter utilizador autenticado.

Exemplo conceptual:

get_current_user()

Criar mecanismos:

require_authenticated_user()
require_permission()
require_profile()

Evitar duplicação nos endpoints.

====================================================================
24. AUTHORIZATION DECORATORS / DEPENDENCIES
====================================================================

Permitir algo conceptual como:

require_permission("process.read")

ou equivalente idiomático para FastAPI.

Não implementar autorização com strings duplicadas espalhadas pelo
código.

Criar constantes ou registry central quando apropriado.

====================================================================
25. FRONTEND AUTH
====================================================================

Implementar arquitectura de autenticação no Next.js.

Criar:

AuthProvider
AuthContext ou equivalente
ProtectedRoute quando necessário
auth client
API client

A solução deve funcionar correctamente com Server Components e
Client Components do Next.js.

Não transformar toda a aplicação em Client Components apenas por causa
da autenticação.

====================================================================
26. API CLIENT
====================================================================

Criar cliente HTTP centralizado.

Responsabilidades:

- base URL;
- headers;
- authentication;
- tratamento de erros;
- correlation ID;
- refresh quando aplicável.

Não criar fetch duplicado em cada página.

====================================================================
27. ROUTE PROTECTION
====================================================================

Proteger áreas autenticadas.

Exemplo conceptual:

/login

/app
/app/dashboard
/app/profile

Não depender apenas da protecção frontend.

O backend continuará sendo a autoridade.

====================================================================
28. SIDEBAR
====================================================================

Nesta Sprint criar a base dinâmica do Sidebar.

O Sidebar deverá futuramente receber:

user
+
profiles
+
permissions
+
scope

e construir o menu.

Exemplo conceptual:

navigationItems.filter(canAccess)

NÃO duplicar regras de autorização.

Não permitir que o Sidebar seja a fonte de verdade de segurança.

====================================================================
29. HUMANIZAÇÃO
====================================================================

Criar mecanismo central para humanização de:

- perfis;
- permissões;
- estados;
- labels;
- enums.

Nunca mostrar:

CHEFE_SECCAO

ao utilizador.

Mostrar:

Chefe de Secção

Nunca mostrar:

PROCESS_READ

Mostrar:

Consultar Processos

Evitar também textos como:

MEU_PROCESSO_STATUS

ou:

DOCUMENT_TYPE_AUTO_APREENSAO

na interface.

====================================================================
30. AUDITORIA
====================================================================

Criar fundação para auditoria de segurança.

Registar eventos importantes:

LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
ACCOUNT_BLOCKED
PASSWORD_CHANGED
PERMISSION_DENIED
SESSION_REVOKED

A auditoria deve permitir futuramente:

quem;
quando;
o quê;
origem;
resultado.

Não guardar passwords ou tokens.

====================================================================
31. RATE LIMITING
====================================================================

Preparar rate limiting para endpoints sensíveis.

Especialmente:

login;
refresh;
password operations.

Utilizar Redis quando apropriado.

Não criar uma solução complexa nesta Sprint.

====================================================================
32. SECURITY HEADERS
====================================================================

Configurar headers de segurança adequados.

Rever:

CORS
Content-Type
X-Content-Type-Options
Content-Security-Policy quando aplicável
Referrer-Policy
Frame protections

Não introduzir configurações que quebrem o Next.js sem validação.

====================================================================
33. DATABASE
====================================================================

Criar migrations para as entidades desta Sprint.

As migrations devem ser:

- versionadas;
- reversíveis quando possível;
- testáveis.

Nunca alterar schema manualmente sem migration.

====================================================================
34. SEED
====================================================================

Criar seed de desenvolvimento.

Criar:

1 Administrador
1 Director
1 Secretaria Geral
1 Chefe de Departamento
1 Chefe de Secção
1 Instrutor Processual
1 Agente de Piquete
1 Editor Documental
1 Agente PGR

IMPORTANTE:

Credenciais de desenvolvimento devem estar claramente identificadas
como DEV ONLY.

Não utilizar credenciais reais.

====================================================================
35. TESTES BACKEND
====================================================================

Criar testes para:

- login válido;
- login inválido;
- utilizador inactivo;
- utilizador bloqueado;
- password incorrecta;
- token inválido;
- token expirado;
- endpoint protegido;
- endpoint sem autenticação;
- permission denied;
- permission allowed;
- profile validation;
- /auth/me;
- logout;
- sessão.

====================================================================
36. TESTES DE AUTORIZAÇÃO
====================================================================

Testar explicitamente:

ADMINISTRADOR_SISTEMA

DIRECTOR

SECRETARIA_GERAL

CHEFE_DEPARTAMENTO

CHEFE_SECCAO

INSTRUTOR_PROCESSUAL

AGENTE_PIQUETE

EDITOR_DOCUMENTAL

AGENTE_PGR

Verificar que:

um perfil não recebe permissões de outro sem configuração.

====================================================================
37. TESTES FRONTEND
====================================================================

Testar:

- login;
- logout;
- estado autenticado;
- estado não autenticado;
- route protection;
- rendering do utilizador;
- rendering dos perfis;
- Sidebar baseado em permissões;
- tratamento de sessão expirada.

====================================================================
38. TESTES E2E
====================================================================

Criar pelo menos um fluxo:

Login
 ↓
Dashboard
 ↓
Utilizador autenticado
 ↓

E um fluxo de acesso negado.

====================================================================
39. DOCUMENTAÇÃO
====================================================================

Criar/actualizar:

docs/architecture/authentication.md

docs/architecture/authorization.md

docs/architecture/rbac.md

Criar ADR se houver decisão arquitectural relevante.

Actualizar README quando necessário.

====================================================================
40. TASKS
====================================================================

Criar:

prompts/tasks/sprint-01/

Com Tasks:

TASK-001-auth-domain
TASK-002-user-model
TASK-003-profile-model
TASK-004-permission-model
TASK-005-rbac
TASK-006-jwt-authentication
TASK-007-session-management
TASK-008-authorization-engine
TASK-009-frontend-auth
TASK-010-sidebar-authorization
TASK-011-security-audit
TASK-012-tests
TASK-013-documentation

As Tasks podem ser subdivididas se necessário.

Cada Task deve possuir:

Objective
Scope
Dependencies
Implementation
Acceptance Criteria
Tests
Definition of Done

====================================================================
41. EXECUÇÃO
====================================================================

Executar uma Task por vez.

Para cada Task:

1. Ler Task.
2. Analisar código.
3. Implementar.
4. Testar.
5. Corrigir.
6. Lint.
7. Typecheck.
8. Rever segurança.
9. Actualizar documentação.
10. Marcar DONE.
11. Commit.

Não acumular várias Tasks num único commit quando forem
independentemente concluíveis.

====================================================================
42. COMMITS
====================================================================

Utilizar Conventional Commits.

Exemplos:

feat(auth): add user identity model

feat(auth): implement JWT authentication

feat(auth): add RBAC authorization

feat(frontend): add authenticated application shell

test(auth): add authorization tests

docs(auth): document authorization architecture

====================================================================
43. DEFINITION OF DONE
====================================================================

SPRINT-01 somente estará concluída quando:

[ ] User model
[ ] Profile model
[ ] Permission model
[ ] RBAC
[ ] JWT
[ ] Login
[ ] Logout
[ ] Current user
[ ] Session foundation
[ ] Authorization engine
[ ] Permission checks
[ ] Profile checks
[ ] Frontend authentication
[ ] Protected routes
[ ] Dynamic Sidebar foundation
[ ] Humanized labels
[ ] Security audit foundation
[ ] Rate limiting foundation
[ ] Database migrations
[ ] Development seed
[ ] Backend tests
[ ] Frontend tests
[ ] E2E tests
[ ] Documentation
[ ] All Tasks DONE
[ ] All tests passing
[ ] Lint passing
[ ] Typecheck passing
[ ] Build passing
[ ] Commits created

====================================================================
44. REGRA FINAL
====================================================================

NÃO iniciar SPRINT-02 automaticamente.

Quando esta Sprint terminar:

1. Executar todos os testes.
2. Executar build.
3. Rever segurança.
4. Rever permissões.
5. Rever migrations.
6. Rever documentação.
7. Confirmar Tasks.
8. Criar commit final da Sprint.
9. Apresentar relatório final.

PARAR.

Aguardar autorização explícita para iniciar:

SPRINT-02 — ESTRUTURA ORGANIZACIONAL E UTILIZADORES.

====================================================================
FIM DO PROMPT 01
====================================================================
