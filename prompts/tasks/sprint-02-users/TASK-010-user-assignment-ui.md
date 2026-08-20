# TASK-010 — user-assignment-ui

## Objective

Gestão de atribuições no detalhe do utilizador: tabela (contexto, tipo, principal, início, fim, estado, acções), criar/editar atribuição em modal/drawer, terminar atribuição com confirmação, definir principal.

## Context

APIs existem: GET/POST /users/{id}/assignments, PATCH e /end. AssignmentService valida (PRIMARY única, períodos, unidade inactiva). Referência de UI: `assignments-section.tsx` (administração).

## Dependencies

- TASK-005 (API)
- TASK-008 (comboboxes hierárquicos reutilizáveis)
- TASK-009 (tab Atribuições)

## Skills

- frontend-ui-engineering
- test-driven-development

## Scope

- Tabela de atribuições com caminho hierárquico humanizado (Direcção / Departamento / Secção / Unidade).
- Colunas: Contexto, Tipo, Principal, Início, Fim, Estado, Acções.
- Modal/drawer "Adicionar atribuição": selects dependentes + datas + principal; botões Cancelar/Adicionar.
- Editar: alterar unidade/contexto/período/principal.
- Terminar: confirmação; NUNCA apagar (chama /end).
- Estados humanizados: Activa, Inactiva, Agendada, Expirada.
- Erros de validação (409/422) apresentados.

## Out of Scope

- Responsabilidades/delegações (já existentes).

## Implementation

1. `user-assignments-section.tsx`.
2. `user-assignment-form.tsx` (modal/drawer) reutilizando combobox hierárquico.
3. Testes de componente.

## Acceptance Criteria

- [ ] Criar atribuição com validação de hierarquia.
- [ ] Editar atribuição com confirmação em alterações críticas.
- [ ] Terminar atribuição preserva histórico (end).
- [ ] Duas principais activas → erro visível.
- [ ] Responsivo e acessível.

## Tests

- [ ] render tabela
- [ ] terminar com confirmação
- [ ] erro de principal duplicada

## Definition of Done

- [ ] Implementado
- [ ] Lint + typecheck passam
- [ ] Commit: `feat(users): add user assignments UI`