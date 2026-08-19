# ADR-005 — Delegation vs Substitution

## Estado

Aceite

## Contexto

Quando um utilizador está ausente, o SIP precisa de representar quem actua
em seu lugar. Existem duas noções próximas mas distintas:

- **Delegação** — alguém transfere uma responsabilidade a outro (ex.: o
  chefe delega a gestão de processos a um subordinado).
- **Substituição** — alguém passa temporariamente a exercer a função de
  outro (ex.: o chefe de secção está de férias e outro assume a função).

A questão: modelar como uma entidade única com tipo, ou como duas entidades
separadas?

## Decisão

Manter **duas entidades separadas**: `Delegation` e `Substitution`.

### Razões

1. **Semântica diferente** — a delegação transfere uma **responsabilidade**
   (scope); a substituição transfere uma **função** (functional role) e a
   colocação do substituído.
2. **Regras de negócio diferentes**:
   - Delegação: proíbe auto-delegação e sobreposição de scope+unidade.
   - Substituição: proíbe auto-substituição; tem período obrigatório e
     função opcional.
3. **Efeitos de autorização diferentes** — uma delegação soma `scope` ao
   contexto do delegado (`delegate_scopes` → `effective_scopes`); uma
   substituição permite agir **em nome de** outra pessoa (lista de
   `substitutions` no contexto).
4. **Evolução independente** — cada entidade pode ganhar campos sem
   afectar a outra.

### Alternativas consideradas

- **Entidade única `Transfer` com tipo** — economiza uma tabela mas obriga
  a campos nulos consoante o tipo e a lógica condicional em todos os pontos
  de uso; rejeitada.

## Consequências

- `AccessContext` expõe `delegator_scopes`, `delegate_scopes` e
  `substitutions` separadamente.
- A API expõe rotas distintas: `/delegations` e `/substitutions`.
- Auditoria registra eventos distintos (`DELEGATION_*` e `SUBSTITUTION_*`).