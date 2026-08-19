# AGENTS.md — Regras para Agentes IA no SIP

## Uso Obrigatório de Skills

As skills estão em `skills/<skill-name>/SKILL.md` e são carregadas via a ferramenta `skill`.

- Se uma skill se aplicar à tarefa (mesmo com 1% de probabilidade), **MUST** invocá-la com a ferramenta `skill` antes de agir.
- Seguir a skill exactamente, nunca parcialmente.
- **NUNCA** implementar directamente se uma skill se aplica.
- Mapeamento automático de intenção → skill:
  - Feature / nova funcionalidade → `spec-driven-development`, depois `incremental-implementation` + `test-driven-development`
  - Planeamento / breakdown → `planning-and-task-breakdown`
  - Bug / falha inesperada → `debugging-and-error-recovery`
  - Code review → `code-review-and-quality`
  - Refactoring / simplificação → `code-simplification`
  - API ou design de interfaces → `api-and-interface-design`
  - Trabalho de UI → `frontend-ui-engineering`
  - Segurança → `security-and-hardening`
  - Documentação / ADRs → `documentation-and-adrs`
- Ciclo de vida implícito: DEFINE → `spec-driven-development`; PLAN → `planning-and-task-breakdown`; BUILD → `incremental-implementation` + `test-driven-development`; VERIFY → `debugging-and-error-recovery`; REVIEW → `code-review-and-quality`; SHIP → `shipping-and-launch`.

## Ciclo Obrigatório de Execução

Para cada Sprint:

1. Ler a Sprint (docs/sprints/).
2. Ler as Tasks (prompts/tasks/).
3. Ler este ficheiro (AGENTS.md).
4. Ler ADRs relevantes (docs/adr/).
5. Consultar o graphify (ver secção "graphify" abaixo) para contexto do codebase.
6. Inspeccionar o código existente.
7. Criar plano.
8. Executar uma Task de cada vez.
9. Implementar.
10. Testar.
11. Corrigir.
12. Executar lint.
13. Executar typecheck.
14. Rever segurança.
15. Rever permissões.
16. Actualizar documentação.
17. Criar commit.
18. Actualizar estado da Task.
19. Só então passar para a próxima Task.

## Regras

- **NUNCA** saltar directamente para a próxima Sprint.
- Uma Sprint só pode ser considerada concluída quando todas as suas Tasks estiverem concluídas e validadas.
- **NUNCA** marcar uma Task como DONE sem validação completa.
- **NUNCA** implementar módulos funcionais antes da fase correspondente.
- **NUNCA** confiar em segurança no frontend (hidden buttons, sidebar, route guards).
- **NUNCA** armazenar secrets no Git.
- **NUNCA** fazer um único commit gigantesco no final da Sprint.

## Prioridades

1. Correctness
2. Security
3. Maintainability
4. Testability
5. Performance
6. Developer Experience

## Formato de Commits

```
feat(scope): description
fix(scope): description
test(scope): description
docs(scope): description
refactor(scope): description
```

## Quando Encontrar Problemas

- Problemas arquitecturais: documentar, não esconder.
- Decisões importantes: criar ADR.
- Dúvidas: não inventar requisito. Consultar documentação, código existente, ADRs, Tasks.

## Comentários de Código (Backend e Frontend): 
- Serão redigidos exclusivamente em português.

## Componentes Genéricos (app/components/ui/): 
- Os arquivos manterão seus nomes originais em inglês (ex.: button.tsx, dialog.tsx, select.tsx).

# Componentes de Domínio/Negócio (Fora de ui/): 
Os nomes dos arquivos e componentes deverão utilizar a terminologia em português para manter a consistência do projeto.

## graphify (USO OBRIGATÓRIO)

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

O graphify é a **fonte primária de contexto do codebase** e deve ser utilizado **SEMPRE**, em todas as sessões e tarefas — nunca iniciar trabalho sem consultar o graphify.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules (MUST):
- **SEMPRE**: antes de qualquer tarefa (feature, bug, refactoring, review, documentação), executar primeiro `graphify query "<questão>"` — nunca saltar directamente para grep ou leitura raw de ficheiros.
- **SEMPRE**: usar `graphify path "<A>" "<B>"` para relações entre componentes e `graphify explain "<concept>"` para conceitos focados. Retornam um subgrafo scoped, normalmente muito menor que GRAPH_REPORT.md ou output raw de grep.
- **SEMPRE**: após modificar código, executar `graphify update .` para manter o grafo actualizado (AST-only, sem custo de API).
- Dirty graphify-out/ files são esperados após hooks ou updates incrementais; dirty graph files **não** são motivo para saltar o graphify. Só saltar se a tarefa for sobre output do grafo stale/incorrecto, ou se o utilizador disser explicitamente para não usar.
- Se graphify-out/wiki/index.md existir, usar para navegação ampla em vez de browsing raw de source.
- Ler graphify-out/GRAPH_REPORT.md apenas para revisão ampla de arquitectura ou quando query/path/explain não fornecerem contexto suficiente.
- Se o grafo não existir ou estiver incompleto (ex.: falta graphify-out/graph.json), **reconstruir** com `graphify update .` antes de prosseguir.
