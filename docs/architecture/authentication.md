# Autenticação — SIP

## Visão Geral

O SIP utiliza autenticação baseada em JWT (JSON Web Tokens) com tokens de curta duração e cookies httpOnly para garantir a segurança das sessões.

## Fluxo de Autenticação

```
Utilizador
  ↓
POST /api/v1/auth/login (username + password)
  ↓
Validar credenciais (argon2id)
  ↓
Validar estado da conta (ACTIVE/INACTIVE/BLOCKED/PENDING)
  ↓
Criar sessão (user_sessions)
  ↓
Gerar JWT access token (HS256)
  ↓
Definir cookie httpOnly (sip_access_token)
  ↓
Registar evento de auditoria
  ↓
Retornar dados do utilizador
```

## JWT Configuration

| Campo | Valor |
|---|---|
| Algoritmo | HS256 |
| Issuer | sip-backend |
| Audience | sip-frontend |
| Expiração | 30 minutos (configurável) |
| Claims | sub (user_id), sid (session_id), iss, aud, iat, exp |

### Claims

```json
{
  "sub": "uuid-do-utilizador",
  "sid": "uuid-da-sessao",
  "iss": "sip-backend",
  "aud": "sip-frontend",
  "iat": 1700000000,
  "exp": 1700001800
}
```

## Segurança

### Password Hashing

- Algoritmo: argon2id (via argon2-cffi)
- Nunca armazenar passwords em texto puro
- Nunca devolver password_hash nas respostas da API
- Nunca registar passwords em logs

### Token Storage

- Access token armazenado em cookie httpOnly
- Nome do cookie: `sip_access_token`
- Cookie seguro, SameSite=Lax
- Não utilizarmos localStorage para tokens

### Anti-User-Enumeration

Em caso de credenciais inválidas, o sistema devolve sempre a mesma mensagem de erro, independentemente de:
- O utilizador existir ou não
- A password estar errada
- A conta estar bloqueada

## Endpoints

### POST /api/v1/auth/login

Autentica um utilizador e devolve um access token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@sip.local",
    "profiles": [
      {
        "id": "uuid",
        "code": "ADMINISTRADOR_SISTEMA",
        "name": "Administrador do Sistema",
        "label": "Administrador do Sistema"
      }
    ]
  }
}
```

**Error Response (401):**
```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Credenciais inválidas.",
  "details": []
}
```

### POST /api/v1/auth/logout

Termina a sessão do utilizador.

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

### GET /api/v1/auth/me

Devolve os dados do utilizador autenticado.

**Headers:** `Authorization: Bearer <token>` ou cookie `sip_access_token`

**Response (200):**
```json
{
  "id": "uuid",
  "username": "admin",
  "email": "admin@sip.local",
  "full_name": "Administrador",
  "employee_number": null,
  "status": "ACTIVE",
  "status_label": "Ativo",
  "profiles": [...],
  "permissions": ["system.admin", "process.read", ...],
  "organization_scope": []
}
```

## Rate Limiting

O endpoint de login possui rate limiting baseado em Redis:

| Configuração | Valor |
|---|---|
| Tentativas máxima | 10 |
| Janela | 900 segundos (15 min) |
| Algoritmo | Fixed window (INCR + EXPIRE) |
| Falha no Redis | Fail-open (permite acesso) |

## Auditoria

Eventos registados:
- `LOGIN_SUCCESS` — login bem-sucedido
- `LOGIN_FAILED` — tentativa de login com credenciais inválidas
- `LOGOUT` — logout do utilizador

Cada evento inclui: user_id, timestamp, ip_address, user_agent, resultado.

## Frontend

### AuthProvider

O frontend utiliza um React Context (`AuthProvider`) que:
1. Valida a sessão ao carregar a aplicação (chamada a `/api/v1/auth/me`)
2. Fornece `login()`, `logout()`, `user`, `isAuthenticated`, `isLoading`
3. Escuta o evento `auth:session-expired` para redirecionar para `/login`

### Route Protection

Todas as rotas protegidas são envolvidas com `<ProtectedRoute>` que:
1. Verifica se o utilizador está autenticado
2. Redireciona para `/login` se não estiver
3. Mostra um skeleton de loading durante a validação

### Cookie-Based Auth

O backend define o token num cookie httpOnly. O frontend envia automaticamente o cookie em todas as requisições via `credentials: "include"`.
