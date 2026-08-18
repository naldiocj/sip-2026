# SPRINT-04 — Advanced Components

## Objetivo

Criar os componentes avançados transversais: Modal Engine, Form Engine, Command Palette, Notification Center.

## Estado

**PLANNED**

## Capabilities

| Module id | Responsibility | Depends on |
|-----------|---------------|------------|
| modal-engine | Enterprise dialogs, drawers, responsive modals | SPRINT-03 core-components |
| form-engine | Smart inputs, AdvancedSelect, EntityPickers | SPRINT-03 core-components |
| command-palette | Global search, navigation, actions | SPRINT-03 navigation-system |
| notification-center | Notifications, badges, indicators | data-layer |

## Tasks

| ID | Task | Estado |
|----|------|--------|
| TASK-015 | Enterprise Dialog Engine | TODO |
| TASK-016 | Dialog variants (Confirm, Form, Details, FullScreen) | TODO |
| TASK-017 | Drawer Engine | TODO |
| TASK-018 | AdvancedSelect | TODO |
| TASK-019 | AdvancedMultiSelect | TODO |
| TASK-020 | EntityPickers | TODO |
| TASK-021 | SmartInput system | TODO |
| TASK-022 | Form Engine | TODO |
| TASK-023 | Command Palette | TODO |
| TASK-024 | Notification Center | TODO |
| TASK-025 | Context Menu system | TODO |
| TASK-026 | Tests + Lint + Typecheck | TODO |

## Critérios de Conclusão

- [ ] Modal Engine com sizes (xs → full), responsive, animations, sticky header/footer
- [ ] ConfirmDialog, FormDialog, DetailsDialog, FullScreenDialog
- [ ] Drawer Engine (right, bottom, responsive, mobile)
- [ ] AdvancedSelect com autocomplete, keyboard, grouping, async, fuzzy search
- [ ] AdvancedMultiSelect com chips, virtualization, remote search
- [ ] EntityPickers (UserPicker, ProcessPicker, etc.)
- [ ] SmartInput system completo
- [ ] Form Engine com validação, dirty state, unsaved changes
- [ ] Command Palette (Ctrl+K)
- [ ] Notification Center
- [ ] Context Menu system
- [ ] Todos os testes passam
- [ ] Lint PASS
- [ ] Typecheck PASS
- [ ] Build PASS

## Referências

- `prompts/PROMPT-MESTRE-FRONTEND-REENGENHARIA.md` — Secções 21-58
