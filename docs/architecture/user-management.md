# Gestão de Utilizadores — Arquitectura

## Visão geral

A gestão de utilizadores cobre o ciclo de vida da conta, o estado, os
perfis (RBAC) e a auditoria. Vive no módulo `auth`:

- **Domínio**: `User`, `UserStatus`, `UserProfile` (M2M `user_profiles`).
- **Aplicação**: `UserService` (`auth/application/user_service.py`).
- **API**: `auth/api/users.py` (CRUD + estado + perfis), `auth/api/profiles.py`
  (listagem para pickers), `auth/api/audit.py` (histórico de auditoria).

O contexto organizacional do utilizador (atribuições a unidades) é tratado
pelo modelo `UserAssignment` — ver `user-organizational-context.md`.

## Ciclo de vida da conta

| Estado | Descrição |
|--------|-----------|
| `PENDING` | Conta recém-criada; **não pode iniciar sessão** |
| `ACTIVE` | Conta activa; pode iniciar sessão |
| `INACTIVE` | Desactivada (saída temporária); sessões revogadas |
| `BLOCKED` | Bloqueada (segurança); sessões revogadas |
| `SUSPENDED` | Suspensa (decisão administrativa); sessões revogadas |

Transições:

- `create` → `PENDING`
- `activate` → `ACTIVE` (a partir de qualquer estado não-activo)
- `deactivate` → `INACTIVE`
- `block` → `BLOCKED`
- `unblock` → `ACTIVE`

**Regras**:

- `deactivate`, `block`, `unblock` e `activate` **revogam sessões activas**
  do utilizador (pattern existente de revogação de sessão).
- A desactivação do próprio administrador é rejeitada (evita lock-out).
- Passwords são armazenadas com Argon2 (nunca em claro; nunca devolvidas
  pela API).

## Perfis

- Listagem pública de perfis: `GET /api/v1/profiles` (permissão
  `profile.read`), devolve `code`, `name`, `label` humanizado.
- Atribuição/remoção por utilizador: `POST/DELETE
  /api/v1/users/{id}/profiles[/{profile_id}]` (permissão `profile.manage`).
- Duplicados rejeitados (422). Sem `is_primary` no perfil — a regra
  "principal" aplica-se à **atribuição organizacional** (ver
  `user-organizational-context.md`).

## Auditoria

Eventos novos (módulo `auth/domain/audit.py`):

| Evento | Quando |
|--------|--------|
| `USER_CREATED` | Criação de conta |
| `USER_UPDATED` | Alteração de dados da conta |
| `USER_ACTIVATED` | Activação |
| `USER_DEACTIVATED` | Desactivação |
| `USER_BLOCKED` | Bloqueio |
| `USER_UNBLOCKED` | Desbloqueio |
| `USER_PROFILE_ASSIGNED` | Perfil atribuído |
| `USER_PROFILE_REMOVED` | Perfil removido |
| `USER_PRIMARY_ASSIGNMENT_CHANGED` | Atribuição principal alterada |

Consulta: `GET /api/v1/audit?user_id=&event_type=&page=&page_size=`
(permissão `system.audit`, exclusiva do administrador).

## API

```
GET    /api/v1/users                      (listagem paginada + pesquisa + filtros status/perfil/unidade)
POST   /api/v1/users                      (permissão user.create)
GET    /api/v1/users/{id}                 (permissão user.read; inclui perfis + atribuição principal)
PATCH  /api/v1/users/{id}                 (permissão user.update)
POST   /api/v1/users/{id}/activate|deactivate|block|unblock
POST   /api/v1/users/{id}/profiles        (permissão profile.manage)
DELETE /api/v1/users/{id}/profiles/{profile_id}
GET    /api/v1/profiles                   (permissão profile.read)
GET    /api/v1/audit                      (permissão system.audit)
```

Matriz de autorização (9 perfis) coberta em
`backend/tests/modules/auth/test_user_authorization.py`: `user.read` é
concedido ao administrador e ao director; `user.create`/`user.update` e
`profile.*`/`system.audit` são exclusivos do administrador.

## Humanização de enums

- Backend: `humanize_user_status` (PENDING → "Pendente", ACTIVE → "Ativo",
  INACTIVE → "Inativo", BLOCKED → "Bloqueado", SUSPENDED → "Suspenso").
- Frontend: `frontend/src/lib/humanize.ts` (mesmos labels, usados nas
  tabelas, badges e formulários).

## Frontend

- **Data layer**: `frontend/src/lib/users-api.ts` + `hooks/use-users.ts`
  (listagem, detalhe, mutações de estado/perfis, auditoria).
- **UI**: lista (`user-data-table.tsx`, `/administracao/utilizadores`),
  formulário (`user-form.tsx`), detalhe com tabs (`user-detail.tsx` —
  Resumo/Perfil/Atribuições/Segurança/Actividade/Auditoria), gestão de
  perfis (`user-profiles.tsx`), acções de estado (`user-security.tsx`).

## Segurança

- Nenhuma acção depende de "esconder" UI — o backend valida sempre a
  permissão (403 sem permissão; testes de matriz por perfil).
- Prevenção de escalada: o utilizador-alvo vem do **path** (nunca do body);
  o cliente não pode auto-atribuir perfis sem `profile.manage`.
- `GET /api/v1/audit` não expõe passwords/tokens; eventos guardam apenas
  metadados (IP, user-agent, detalhes).