# Agent Skills Integration

## Problem Statement

Como integrar o sistema Agent Skills (addyosmani/agent-skills) no ciclo de desenvolvimento do SIP, de forma que se torne o mecanismo operacional obrigatório do agente — reprodutível, auditável e provado — sem duplicar mecanismos que o OpenCode já oferece e sem introduzir complexidade frágil?

## Recommended Direction

**A+B: Provenance verificada + Prova Auto-Referencial.**

A integração está ~85% implementada mas não commitada (`skills/`, `AGENTS.md`, `opencode.json` untracked/modified). O trabalho restante:

1. **Verificar proveniência por diff**: clonar `addyosmani/agent-skills` em `/tmp`, pinar o commit, e confirmar que as 24 skills presentes são byte-idênticas às oficiais. Se alguma foi editada silenciosamente, re-vendorizar do commit pinado. Sem esta verificação, a promessa de "reprodutível" é cosmética.
2. **Prova auto-referencial**: TASK-SKILLS-001 tem como entregável o `docs/architecture/agent-skills.md`, produzido pelas próprias skills (`spec-driven-development` + `documentation-and-adrs`). A prova do mecanismo é o mecanismo a produzir a sua própria documentação. Zero funcionalidade do SIP tocada.
3. **Gate de skills nos commits**: cada commit referencia as skills invocadas (`feat(scope): desc (skills: tdd, security-and-hardening)`). O git log torna-se a prova auditável de adopção — a política do AGENTS.md deixa de ser texto morto.
4. **Três commits lógicos** (nunca um commit gigante): `feat(skills): vendor agent skills`, `feat(opencode): enable skill discovery`, `docs(agent-skills): integration architecture + provenance`.

## Key Assumptions to Validate

- [ ] **As 24 skills são pristinas** — nunca editadas silenciosamente. *Teste: diff contra o commit pinado do repo oficial (passo 1 obrigatório).*
- [ ] **A política "1% de probabilidade → MUST invocar" não queima contexto** — 24 SKILL.md por sessão. *Mitigação: regra "não adicionar skills artificialmente" nas Tasks.*
- [ ] **O `skill` tool + `skills.paths` do opencode.json funciona** — já confirmado: as skills aparecem como available skills na sessão.
- [ ] **Sync manual por Task/ADR é suficiente** — se o upstream reorganizar skills, o docs deriva. Risco baixo, aceite.

## MVP Scope

- [ ] Verificar diff das 24 skills contra o commit pinado do repo oficial
- [ ] Criar `docs/architecture/agent-skills.md` (origem, commit, data, método, subset curado, lifecycle, relação Sprints/Tasks/commits)
- [ ] Criar `prompts/tasks/skills-integration/TASK-SKILLS-001.md` (entregável: o próprio docs, produzido via skills)
- [ ] Executar TASK-SKILLS-001 seguindo o lifecycle (DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP)
- [ ] Executar testes/lint/typecheck existentes (nada deve regredir — nenhuma funcionalidade é alterada)
- [ ] Commits: `feat(skills)`, `feat(opencode)`, `docs(agent-skills)` + commit de TASK-SKILLS-001 com skills referenciadas
- [ ] Actualizar SPRINT bookkeeping (SPRINT-00 fica DONE; a integração é pós-sprint)

## Not Doing (and Why)

- **Submodule git** — rejeitado: complexidade de clone/CI sem ganho real quando diff contra commit pinado + docs bastam.
- **Clone total (~40 skills)** — rejeitado: subset curado de 24 evita ruído e desperdício de contexto; as restantes entram quando necessárias.
- **Dogfood no trabalho de auth não commitado (V3)** — rejeitado: mistura a validação com Sprint-01 e viola "não modificar funcionalidades do SIP durante o teste".
- **Automação de sync** — rejeitado: sync manual por Task/ADR, registado no docs.
- **Skills SIP paralelas** — rejeitado: nunca criar `skills/sip-tdd/` quando `skills/test-driven-development/` existe; regras SIP ficam no AGENTS.md e Tasks.

## Open Questions

- **`browser-testing-with-devtools` está órfã**: presente nas 24 skills, mas o `opencode.json` não tem secção MCP — a skill é inutilizável sem o chrome-devtools MCP. Configurar o MCP ou documentar a limitação?
- **SPRINT-00 foi marcado DONE sem a integração** — a TASK-SKILLS-001 vive num directório próprio (`prompts/tasks/skills-integration/`) ou é adicionada retroactivamente ao SPRINT-00?
- Qual o commit exacto do upstream a pinar (último HEAD verificado pelo diff)?