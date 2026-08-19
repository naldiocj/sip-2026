# TASK-007 — organizational-hierarchy

## Objective

Garantir o serviço de hierarquia central com todas as operações e integridade.

## Context

HierarchyService já implementa get_parent, get_children, get_ancestors, get_descendants, get_root, get_unit_path, validate_parent. Verificar cobertura de integridade: self-parent, ciclos, parent inexistente, parent de outra organização, parent inactivo.

## Dependencies

- TASK-006 (Unit)

## Skills

- test-driven-development
- debugging-and-error-recovery

## Scope

- Revisão do HierarchyService existente.
- Testes obrigatórios de todos os cenários de integridade.
- Correcção de bugs encontrados.
- `get_path()` conforme prompt (existe como get_unit_path — manter naming consistente).

## Out of Scope

- Árvore UI (TASK-023).

## Implementation

1. Revisar hierarchy_service.py.
2. Escrever testes: self-parent, cycle, invalid parent, cross-organization parent, inactive parent, descendentes, caminho raiz→unidade.
3. Corrigir conforme necessário.

## Acceptance Criteria

- [ ] Todas as operações de hierarquia funcionam.
- [ ] Todos os cenários de integridade testados.
- [ ] Lógica não duplicada em endpoints.

## Tests

- [ ] get_parent/children/ancestors/descendants/root/path
- [ ] self-parent → erro
- [ ] cycle → erro
- [ ] parent inexistente → erro
- [ ] parent cross-organization → erro
- [ ] parent inactivo → erro

## Definition of Done

- [ ] Implementado
- [ ] Testes passam
- [ ] Commit: `feat(org): validate hierarchy integrity`