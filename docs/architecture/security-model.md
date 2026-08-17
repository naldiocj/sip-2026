# Security Model

## Overview

SIP utiliza um modelo de segurança em camadas para proteger dados e controlo de acesso.

## Camadas de Segurança

### 1. Autenticação

- **Mecanismo:** JWT Access Tokens (HTTP-only cookies)
- **Password Hashing:** Argon2id (memory-hard, resistente a GPU/ASIC attacks)
- **Anti-enumeration:** Login retorna 401 genérico para credenciais inválidas, utilizador inexistente, conta bloqueada ou inactiva
- **Timing-safe:** verify_password é sempre executado (mesmo com hash dummy) para prevenir side-channels

### 2. Autorização

- **Mecanismo:** RBAC (Role-Based Access Control) centralizado via `AuthorizationService`
- **Níveis:** Profile → Permission → Resource.Action
- **Organizational Scope:** Fundação para futuras políticas de acesso por alcance organizacional
- **Ownership:** Fundação para políticas de acesso por ownership (OWN, ASSIGNED)

### 3. Sessões

- **Armazenamento:** Base de dados (UserSession)
- **Revogação:** Logout revoga sessão activa
- **Expiração:** TTL configurável (default 7 dias)
- **Cookies:** httpOnly, secure (em produção), sameSite=lax

### 4. Rate Limiting

- **Mecanismo:** Redis com Lua script (atomic INCR+EXPIRE)
- **Endpoints protegidos:** Login, Refresh, Password operations
- **Falha:** Open quando Redis indisponível (documentado como risco aceite)

### 5. Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: default-src 'none'; frame-ancestors 'none'

### 6. Auditoria de Segurança

- **Eventos:** LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, SESSION_REVOKED, PERMISSION_DENIED, ACCOUNT_BLOCKED, PASSWORD_CHANGED
- **Dados registados:** actor, timestamp, action, resource, result, correlation_id
- **NUNCA registado:** passwords, access tokens, refresh tokens
- **Filtro automático:** campos com marcadores sensíveis são removidos antes de persistir

## Decisões de Segurança

### JWT Claims Mínimos

Os claims do JWT contêm apenas:
- `sub` (user ID)
- `sid` (session ID)
- `iss` (issuer)
- `aud` (audience)
- `iat` (issued at)
- `exp` (expiration)

**NÃO** são incluídas permissões completas no JWT. As permissões são consultadas
da base de dados via AuthorizationService para garantir consistência e permitir
invalidação imediata.

### Cookie vs Response Body

O access_token é transmitido APENAS via cookie httpOnly. Nunca é retornado
no body da resposta HTTP. Isto previne que JavaScript (em caso de XSS) aceda
ao token.

### Status Codes Uniformes

Todos os erros de login retornam 401 (não 403 para blocked/inactive). Isto
previne que atacantes identifiquem o estado de uma conta através do código
de status HTTP.

### JWT Secret Validation

Em produção, o `jwt_secret` DEVE ser maior que 32 caracteres e NÃO pode ser
o valor de desenvolvimento padrão. Validação é feita no startup via Pydantic
model_validator.

## Dependências de Segurança

- **argon2-cffi:** Password hashing (memory-hard)
- **PyJWT:** Token creation/validation
- **Redis:** Rate limiting (com Lua scripts para atomicidade)
- **Cryptography:** Secret generation para tokens

## Riscos Conhecidos

1. **Rate limiter fail-open:** Quando Redis está indisponível, o rate limiting
   é desactivado. Documentado e aceite para disponibilidade do serviço.

2. **SameSite=lax:** CSRF protection parcial. Logout (POST) é protegido por
   SameSite, mas não para todos os cenários cross-origin. A considerar
   CSRF tokens para endpoints state-changing em futuras sprints.
