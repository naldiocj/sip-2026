# ADR-003 — Organizational Unit Hierarchy

## Estado

Aceite

## Contexto

O SIP modela a hierarquia institucional (Direcção → Departamento → Secção →
Unidade → Piquete). As estruturas reais variam: nem toda a Direcção tem
Departamentos, e novas unidades surgem sem alterações de schema. A questão é:
como representar a hierarquia?

Modelos considerados: lista de adjacência (`parent_id`), nested set
(`left/right`), closure table e path enumeration.

## Decisão

Usar **adjacency list** (`organizational_units.parent_id`) com validação
rigorosa no serviço.

### Razões

1. **Flexível** — qualquer estrutura (profunda ou plana) sem schema fixo.
2. **Simples** — uma coluna, sem manutenção de índices de nested set nem
   triggers de closure table.
3. **Leitura adequada** — a árvore é pequena (dezenas de unidades); consultas
   recursivas em memória são suficientes; o custo de nested set não compensa.
4. **Integridade por validação** — `HierarchyService.validate_parent` impede
   ciclos, auto-parent e cross-organization.

### Alternativas consideradas

- **Nested set** — rejeitado: escrita complexa (re-indexação), benefício de
  leitura irrelevante à escala.
- **Closure table** — rejeitado: duplicação de dados e escrita transaccional
  mais complexa sem ganho prático.

## Consequências

- `OrganizationalUnit.parent_id` auto-referencia a tabela; `organization_id`
  garante que a árvore não cruza organizações.
- Consultas de sub-árvore usam travessia recursiva no serviço
  (`get_descendants`, `get_ancestors`).
- Unidades são **desactivadas**, nunca apagadas, preservando histórico.
- `UnitType` é um enum extensível (ORGANIZATION, DIRECTION, DEPARTMENT,
  SECTION, UNIT, PIQUETE, OTHER) para rotular os nós.