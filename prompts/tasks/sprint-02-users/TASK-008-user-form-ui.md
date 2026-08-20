# TASK-008 — user-form-ui

## Objective

Formulário de criação/edição de utilizador (drawer/dialog): dados da conta, perfil, contexto organizacional com selects dependentes (Direcção → Departamento → Secção → Unidade), atribuição principal e estado.

## Context

Dependent selects precisam de `GET /units?parent_id=&type_id=` (TASK-005). Combobox shadcn disponível. Padrão de formulário: `person-form.tsx` (react-hook-form + zod).

## Dependencies

- TASK-005 (units por parent/type)
- TASK-006 (data layer)

## Skills

- frontend-ui-engineering
- api-and-interface-design

## Scope

- Componente `user-form.tsx` (drawer) com secções: DADOS DA CONTA, PERFIL, CONTEXTO ORGANIZACIONAL, SEGURANÇA.
- Comboboxes dependentes com pesquisa, loading, empty/error state, clear e keyboard navigation.
- Ao mudar nível superior, limpar selecções inferiores incompatíveis.
- Apresentar caminho hierárquico (Direcção / Departamento / Secção / Unidade).
- Marcação "Atribuição principal".
- Guardar / Cancelar; validação zod; mensagens de erro.
- Responsivo e acessível.

## Out of Scope

- Atribuições múltiplas (TASK-010).

## Implementation

1. Hook para carregar unidades por nível (com cache TanStack).
2. Componente de combobox hierárquico reutilizável.
3. user-form.tsx ligado a create/update.

## Acceptance Criteria

- [ ] Selects dependentes correctos (reset ao mudar parent).
- [ ] Caminho hierárquico visível.
- [ ] Validação de campos obrigatórios.
- [ ] Estados loading/error/empty nos comboboxes.
- [ ] A11y e responsividade.

## Tests

- [ ] validação do formulário
- [ ] reset de selects dependentes

## Definition of Done

- [ ] Implementado
- [ ] Lint + typecheck passam
- [ ] Commit: `feat(users): add user form with organizational context`