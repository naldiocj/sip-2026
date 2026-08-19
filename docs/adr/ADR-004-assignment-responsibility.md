# ADR-004 — Assignment vs Responsibility

## Estado

Aceite

## Contexto

O domínio organizacional precisa de representar onde um utilizador trabalha
e o que lhe é permitido fazer. Sem modelação explícita, estes dois conceitos
tendem a fundir-se numa única tabela genérica de "funções", o que confunde
autorização com colocação.

A questão: modelar **atribuição** (placement) e **responsabilidade** (scope)
como conceitos separados ou como um só?

## Decisão

Manter **dois conceitos separados**:

| Conceito | Pergunta | Entidade |
|----------|----------|----------|
| Assignment | Onde trabalha o utilizador? | `UserAssignment` |
| Responsibility | Que âmbito de responsabilidade exerce? | `Responsibility` |

### Razões

1. **Autorização correcta** — um utilizador pode estar colocado numa
   unidade (assignment) sem exercer qualquer responsabilidade (scope), e
   vice-versa. Fundir os dois cria falsos positivos de autorização.
2. **Ciclos de vida independentes** — a colocação muda com a lotação; as
   responsabilidades mudam com delegações e promoções.
3. **Testabilidade** — cada serviço (`AssignmentService`,
   `ResponsibilityService`) valida as suas regras isoladamente
   (primary único, scope exige unidade quando aplicável).
4. **Legibilidade** — `is_primary` só existe em atribuições; `scope` só
   existe em responsabilidades. Nenhum campo é "emprestado".

### Alternativas consideradas

- **Entidade única com tipo (assignment_type)** — económica mas mistura
  semânticas; rejeitada.
- **Responsibility embutida em UserAssignment** — acopla colocação a
  permissões; rejeitada.

## Consequências

- `AccessContext` carrega ambos: `assignments` e `responsibilities`.
- O `ScopeEngine` decide autorização a partir de `responsibility_scopes` e
  `effective_scopes`; a colocação alimenta o contexto (`unit_ids`).
- Novos tipos de responsabilidade só tocam `ResponsibilityScope` e o
  ScopeEngine, nunca o modelo de colocação.