# ADR-002 — Person ≠ User

## Estado

Aceite

## Contexto

O SIP precisa de representar pessoas reais (agentes, instrutores, secretários)
que podem ou não ter conta no sistema. Surge a questão: a pessoa é o mesmo
conceito que o utilizador de autenticação, ou são entidades separadas?

Um BI (bilhete de identidade) poderia servir de identificador estável, mas
pessoas podem não ter BI, podem ter números antigos, e o BI é dado pessoal
sensível que não deve ser chave primária.

## Decisão

Separar **Person** (identidade pessoal) de **User** (identidade de autenticação).

### Razões

1. **Pessoas sem conta** — o SIP conhece pessoas que nunca autenticam
   (ex.: intervenientes em processos); não devem exigir um User.
2. **Dados distintos** — dados pessoais (BI, morada, data de nascimento) não
   pertencem à entidade de autenticação (password, tokens, MFA).
3. **Número interno estável** — `person_number` (ex.: PES-000001) é a chave
   estável interna; o BI é opcional e nunca chave.
4. **Privacidade** — separar reduz o risco de expor dados pessoais em contextos
   de autenticação (logs, tokens).

### Alternativas consideradas

- **Person = User** — rejeitado: mistura dados pessoais com autenticação e
  obriga a criar conta para toda a gente.
- **BI como chave primária** — rejeitado: dado sensível, pode faltar ou mudar.

## Consequências

- `User` referencia `Person` opcionalmente (`users.person_id`).
- `Person` nunca contém password ou dados de autenticação.
- A associação User→Person é feita por administrador, não por self-registo.
- Dados funcionais (emprego, categoria) vivem em `Person`, separados dos
  pessoais e dos de autenticação.