# AGENTS.md — Regras para Agentes IA no SIP

## Ciclo Obrigatório de Execução

Para cada Sprint:

1. Ler a Sprint (docs/sprints/).
2. Ler as Tasks (prompts/tasks/).
3. Ler este ficheiro (AGENTS.md).
4. Ler ADRs relevantes (docs/adr/).
5. Inspeccionar o código existente.
6. Criar plano.
7. Executar uma Task de cada vez.
8. Implementar.
9. Testar.
10. Corrigir.
11. Executar lint.
12. Executar typecheck.
13. Rever segurança.
14. Rever permissões.
15. Actualizar documentação.
16. Criar commit.
17. Actualizar estado da Task.
18. Só então passar para a próxima Task.

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
