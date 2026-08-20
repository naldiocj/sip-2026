# Contexto Organizacional do Utilizador — Arquitectura

## Visão geral

O contexto organizacional do utilizador responde a: **em que unidade
trabalha?** A entidade é `UserAssignment` (existente desde a SPRINT-02) —
**não foi criada uma entidade nova** para a gestão de utilizadores.

- Domínio: `organization/domain/user_assignment.py` (`UserAssignment`,
  `AssignmentType`, `AssignmentStatus`).
- Aplicação: `AssignmentService` (`organization/application/assignment_service.py`).
- API: `organization/api/router.py` (atribuições do utilizador) e
  `organization/api/management.py` (actualização suave).

## Regras de integridade (documentadas)

- **PRIMARY única activa** — um utilizador só pode ter uma atribuição
  principal activa; criar outra devolve **409**.
- **Períodos válidos** — `end_date >= start_date`; período inválido devolve
  **422** (criação e actualização).
- **Histórico preservado** — terminar é suave (`ACTIVE` → `INACTIVE`); nunca
  se apagam linhas.
- Unidade inexistente/inactiva e utilizador-alvo inexistente devolvem **404**.

> **Gap conhecido (decisão registada no sprint doc):** a validação
> **hierárquica** da atribuição (ex.: atribuir um Departamento da Direcção C
> a um utilizador já colocado na Direcção A) **não está implementada**. A
> regra exacta de compatibilidade depende de decisão do dono do produto.

## Endpoints

| Método | Endpoint | Permissão |
|--------|----------|-----------|
| GET | `/api/v1/users/{user_id}/assignments` | `assignment.read` |
| POST | `/api/v1/users/{user_id}/assignments` | `assignment.create` |
| PATCH | `/api/v1/users/{user_id}/assignments/{assignment_id}` | `assignment.update` |
| POST | `/api/v1/users/{user_id}/assignments/{assignment_id}/end` | `assignment.end` |

O utilizador-alvo vem sempre do **path** (prevenção de escalada — o body só
transporta unidade/tipo/período/`is_primary`).

## Selects dependentes

Para montar o contexto organizacional (Direcção → Departamento → Secção →
Unidade) sem carregar toda a árvore, o endpoint de unidades é filtrável:

```
GET /api/v1/units?organization_id={org}&parent_id={id}&type_id={TYPE}
```

- `parent_id` — filhos directos da unidade indicada.
- `type_id` — filtra por tipo (`DIRECTION`, `DEPARTMENT`, `SECTION`, `UNIT`).
- Permissão: `organization.read`.

No frontend, o hook `useUnitsByParent(organizationId, parentId, typeId)`
encadeia os selects dependentes (formulário de utilizador e diálogo de nova
atribuição).

## Atribuição principal

- `is_primary` marca a atribuição principal (apenas uma activa).
- `GET /api/v1/users/{id}` devolve `primary_assignment` com o **caminho
  hierárquico** (`unit_path`: Organização → Direcção → ... → Unidade) para
  exibição directa na UI.
- Alterar a principal (despromover a antiga + promover a nova) regista o
  evento de auditoria `USER_PRIMARY_ASSIGNMENT_CHANGED`.

## Integração com AccessContext

`GET /api/v1/me/context` devolve, para o utilizador autenticado:
`primary_unit_id`, `primary_unit_name`, `assignments` (com
`organizational_unit_id`, `is_primary`, períodos, estado) e os âmbitos
efectivos. A colocação alimenta o contexto (`unit_ids`) usado pelo
`ScopeEngine` para autorização (ver `access-context.md` e ADR-004).

## Frontend

- **Data layer**: `frontend/src/lib/management-api.ts` +
  `hooks/use-management.ts` (`useUserAssignments`, `useEndAssignment`).
- **UI**: `components/user/user-assignments.tsx` (tabela + diálogo de nova
  atribuição com selects dependentes + confirmação de terminar) e tab
  "Atribuições" em `user-detail.tsx`.

## Auditoria

| Evento | Quando |
|--------|--------|
| `ASSIGNMENT_CREATED` | Atribuição criada |
| `ASSIGNMENT_UPDATED` | Atribuição actualizada (períodos/tipo) |
| `ASSIGNMENT_ENDED` | Atribuição terminada (suave) |
| `USER_PRIMARY_ASSIGNMENT_CHANGED` | A principal foi alterada |

Consulta pelo histórico: `GET /api/v1/audit?user_id={id}` (permissão
`system.audit`).