# Autorização — SIP

## Visão Geral

O SIP implementa um sistema de autorização centralizado baseado em RBAC (Role-Based Access Control) com suporte a scopes organizacionais. A autorização é sempre validada no backend — o frontend apenas melhora a UX ocultando elementos inacessíveis.

## Princípio Fundamental

```
SEGURANÇA REAL = BACKEND

Frontend pode:
  - Ocultar menus
  - Ocultar botões
  - Proteger rotas
  - Melhorar UX

Mas a segurança real deve estar no backend.
Toda operação protegida deve ser validada no backend.
```

## Fluxo de Autorização

```
USER
  ↓
PROFILE (RBAC)
  ↓
PERMISSION (RESOURCE + ACTION)
  ↓
ORGANIZATIONAL SCOPE (SPRINT-02)
  ↓
RESOURCE
  ↓
ACTION
```

## Permission Model

As permissões seguem o padrão `RESOURCE.ACTION`:

```
process.read
process.create
process.update
process.assign
process.delete

document.read
document.create
document.edit
document.publish
document.delete

user.read
user.create
user.update
user.delete

profile.read
profile.manage
permission.read
permission.manage

notification.read
notification.manage
organization.read
organization.manage

system.admin
system.config
system.audit

report.read
report.create
report.export

template.read
template.create
template.edit
template.publish

piquete.read
piquete.create
piquete.update
pgr.read
pgr.manage
```

### Permission Constants

As permissões estão definidas como constantes em `backend/app/modules/auth/domain/permissions.py`:

```python
class PermissionConstants:
    PROCESS_READ = "process.read"
    PROCESS_CREATE = "process.create"
    # ... 33 permissões no total
```

Isto evita strings duplicadas espalhadas pelo código.

## Authorization Service

O serviço centralizado de autorização encontra-se em `backend/app/modules/auth/application/authorization.py`:

```python
class AuthorizationService:
    def get_user_permissions(user) -> set[str]:
        """Retorna a união de todas as permissões dos perfis do utilizador."""

    def check_permission(user, permission_code) -> bool:
        """Verifica se o utilizador possui uma permissão específica."""

    def check_profile(user, profile_code) -> bool:
        """Verifica se o utilizador possui um perfil específico."""
```

## FastAPI Dependencies

Dependências FastAPI para autorização em `backend/app/modules/auth/api/dependencies.py`:

```python
get_current_user()           # Extrai utilizador do token JWT
require_authenticated_user() # Garante utilizador autenticado
require_permission(code)     # Factory: verifica permissão específica
require_profile(code)        # Factory: verifica perfil específico
```

### Exemplo de Uso

```python
from app.modules.auth.api.dependencies import require_permission

@router.get("/processes")
async def list_processes(
    user = Depends(require_permission("process.read"))
):
    # Apenas acessível por utilizadores com process.read
    ...
```

## Resource Scope (Fundação)

O modelo prepara scopes organizacionais para SPRINT-02:

| Scope | Descrição |
|---|---|
| GLOBAL | Acesso a todos os recursos |
| ORGANIZATION | Acesso à organização atual |
| DIRECTION | Acesso à direcção |
| DEPARTMENT | Acesso ao departamento |
| SECTION | Acesso à secção |
| OWN | Apenas recursos próprios |
| ASSIGNED | Apenas recursos atribuídos |
| PGR | Contexto específico PGR |
| PIQUETE | Contexto específico Piquete |

### Own / Assigned

O sistema suporta regras como:
- Instrutor A vê apenas processos atribuídos ao Instrutor A
- Instrutor B não vê os processos do Instrutor A

Isto é implementado via scopes e ownership, não com `if user.username == ...`.

## Frontend Authorization

### Sidebar Dinâmico

O sidebar filtra itens de navegação baseado nas permissões do utilizador:

```typescript
const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pesquisa", url: "/search", icon: Search, requiredPermission: "process.read" },
  { title: "Segurança", url: "/security", icon: Shield, requiredPermission: "system.audit" },
];

const filteredItems = navigationItems.filter(
  item => !item.requiredPermission || user.permissions.includes(item.requiredPermission)
);
```

### Humanização

As permissões são apresentadas de forma humanizada na interface:
- `process.read` → "Consultar Processos"
- `system.audit` → "Consultar Auditoria"

Nunca mostrar códigos técnicos como `PROCESS_READ` ao utilizador.

## Auditoria de Autorização

Eventos de autorização são registados:
- `PERMISSION_DENIED` — tentativa de acesso sem permissão
- `SESSION_REVOKED` — sessão revogada
