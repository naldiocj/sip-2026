# Arquitectura Documental do SIP

## Princípio

O SIP possui um **Motor Documental** próprio que gera e controla
documentos oficiais e processuais. O Form Builder **não é** um editor
HTML genérico.

## Fluxo

```
Template
  ↓
Template Schema
  ↓
Data Binding
  ↓
Validation
  ↓
Document Rendering Engine
  ↓
┌──────────────┐
│              │
PDF Renderer   DOCX Renderer
│              │
PDF            DOCX
```

Não criar dois designers. Não criar dois templates.

## Entidades

| Entidade | Descrição |
|---|---|
| DocumentType | Tipo de documento (Participação, Auto, Despacho, etc.) |
| DocumentTemplate | Template com schema e layout |
| DocumentTemplateVersion | Versionamento de templates |
| DocumentInstance | Instância preenchida com dados |
| DocumentAsset | Assets visuais (logotipos, assinaturas) |
| DocumentAudit | Rastreabilidade de operações |

## Separation of Concerns

O motor documental está separado do módulo Processos.

Uma peça processual (ProcessPiece) referencia uma DocumentInstance.

```
Process
  └── ProcessPiece
        └── DocumentInstance (referência)
```

Nunca duplicar o motor documental dentro de módulos de negócio.
