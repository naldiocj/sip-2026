# RBAC — Role-Based Access Control

## Visão Geral

O SIP utiliza RBAC (Role-Based Access Control) para gerir o acesso baseado em perfis. Cada utilizador possui um ou mais perfis, e cada perfil agrupa um conjunto de permissões.

## Perfis Oficiais

| Código | Nome Humanizado | Descrição |
|---|---|---|
| `ADMINISTRADOR_SISTEMA` | Administrador do Sistema | Acesso total à administração da plataforma |
| `DIRECTOR` | Director | Supervisão de todos os departamentos |
| `SECRETARIA_GERAL` | Secretaria Geral | Gestão administrativa geral |
| `CHEFE_DEPARTAMENTO` | Chefe de Departamento | Supervisão de departamento |
| `CHEFE_SECCAO` | Chefe de Secção | Supervisão de secção |
| `INSTRUTOR_PROCESSUAL` | Instrutor Processual | Instrução e análise processual |
| `AGENTE_PIQUETE` | Agente de Piquete | Funcionalidades do Piquete |
| `EDITOR_DOCUMENTAL` | Editor Documental | Form Builder, Templates, Documentos |
| `AGENTE_PGR` | Agente PGR | Contexto específico da PGR |

## Modelo de Dados

```
User ──M:N──> Profile ──M:N──> Permission
```

### Tabelas

| Tabela | Descrição |
|---|---|
| `users` | Utilizadores do sistema |
| `profiles` | Definição dos perfis |
| `permissions` | Definição das permissões |
| `user_profiles` | Associação User ↔ Profile |
| `profile_permissions` | Associação Profile ↔ Permission |
| `user_sessions` | Sessões ativas |

## Mapeamento Profile → Permissions

### ADMINISTRADOR_SISTEMA

Permissões de administração total:
- `system.admin`, `system.config`, `system.audit`
- `user.read`, `user.create`, `user.update`, `user.delete`
- `profile.read`, `profile.manage`
- `permission.read`, `permission.manage`
- `organization.read`, `organization.manage`

### DIRECTOR

Permissões de supervisão:
- `process.read`, `process.create`, `process.update`, `process.assign`
- `document.read`, `document.create`, `document.edit`
- `user.read`, `user.create`, `user.update`
- `report.read`, `report.create`, `report.export`
- `notification.read`, `notification.manage`

### INSTRUTOR_PROCESSUAL

Permissões de instrução processual:
- `process.read`, `process.create`, `process.update`
- `document.read`, `document.create`, `document.edit`
- `notification.read`

### EDITOR_DOCUMENTAL

Permissões de edição documental:
- `document.read`, `document.create`, `document.edit`, `document.publish`
- `template.read`, `template.create`, `template.edit`, `template.publish`

### AGENTE_PIQUETE

Permissões do Piquete:
- `piquete.read`, `piquete.create`, `piquete.update`

### AGENTE_PGR

Permissões da PGR:
- `pgr.read`, `pgr.manage`

## Seed de Desenvolvimento

O script `scripts/seed_dev.py` cria:
- 9 perfis oficiais
- 33 permissões
- 9 utilizadores (um por perfil)

**Credenciais DEV ONLY:**

| Utilizador | Password | Perfil |
|---|---|---|
| admin | admin123 | ADMINISTRADOR_SISTEMA |
| director | director123 | DIRECTOR |
| secretaria | secretaria123 | SECRETARIA_GERAL |
| chefe_departamento | chefe_dep123 | CHEFE_DEPARTAMENTO |
| chefe_seccao | chefe_sec123 | CHEFE_SECCAO |
| instrutor | instrutor123 | INSTRUTOR_PROCESSUAL |
| piquete | piquete123 | AGENTE_PIQUETE |
| editor | editor123 | EDITOR_DOCUMENTAL |
| pgr | pgr123 | AGENTE_PGR |

**IMPORTANTE:** Estas credenciais são apenas para desenvolvimento. Nunca utilizar em produção.

## Hierarquia de Perfis

```
ADMINISTRADOR_SISTEMA
  ↓ (administração total)
DIRECTOR
  ↓ (supervisão)
SECRETARIA_GERAL
  ↓ (administração)
CHEFE_DEPARTAMENTO
  ↓ (departamento)
CHEFE_SECCAO
  ↓ (secção)
INSTRUTOR_PROCESSUAL
  ↓ (instrução)
EDITOR_DOCUMENTAL (documentos)
AGENTE_PIQUETE (piquete)
AGENTE_PGR (pgr)
```

A hierarquia é implícita nas permissões — não existe herança automática de perfis.

## Humanização

Os códigos técnicos nunca são mostrados na interface:

| Técnico | Interface |
|---|---|
| `ADMINISTRADOR_SISTEMA` | Administrador do Sistema |
| `CHEFE_SECCAO` | Chefe de Secção |
| `process.read` | Consultar Processos |
| `system.audit` | Consultar Auditoria |

A humanização é feita via:
- Backend: `PROFILE_LABELS` em `domain/profile.py`
- Frontend: `humanizeProfile()`, `humanizePermission()`, `humanizeUserStatus()` em `lib/humanize.ts`
