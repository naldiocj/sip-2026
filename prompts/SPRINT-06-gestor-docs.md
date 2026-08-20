O próximo é a **SPRINT 05 — Form Builder + Biblioteca Profissional de Componentes Documentais do SIP**.

Esta é uma Sprint crítica, porque será a base para **Participações, Denúncias, Autos, Declarações, Termos, Ofícios, Despachos, documentos de Piquete, documentos de Instrução e documentos destinados à PGR**.

Vou manter como regra que o Form Builder **não é um editor genérico**, mas um **motor especializado de documentos oficiais**, exatamente com a especificação que definiste.

# PROMPT 05 — FORM BUILDER + BIBLIOTECA DOCUMENTAL

```text
====================================================================
SIP — PROMPT 05
SPRINT 05 — FORM BUILDER + BIBLIOTECA PROFISSIONAL DE
COMPONENTES DOCUMENTAIS
====================================================================

PROJECT:
SIP — Sistema de Instrução Processual

SPRINT:
SPRINT-05

TITLE:
Form Builder e Biblioteca Profissional de Componentes Documentais do SIP

STATUS:
PLANNED

====================================================================
1. MISSÃO
====================================================================

Implementar o Form Builder oficial do SIP.

O Form Builder NÃO deve ser um editor genérico de páginas.

Deve ser um editor visual especializado em:

- documentos oficiais;
- documentos administrativos;
- documentos processuais;
- peças processuais;
- documentos institucionais;
- documentos de Piquete;
- documentos de Instrução;
- documentos destinados à PGR.

O utilizador deve conseguir:

ARRASTAR
→ SOLTAR
→ CONFIGURAR
→ ASSOCIAR DADOS
→ VALIDAR
→ PRÉ-VISUALIZAR
→ PUBLICAR

sem programação.

====================================================================
2. PRINCÍPIO FUNDAMENTAL
====================================================================

O documento será representado por:

Template Schema

e não por HTML arbitrário.

O mesmo Template Schema deve alimentar:

Canvas
PDF Renderer
DOCX Renderer

Fluxo:

FORM BUILDER
      ↓
TEMPLATE SCHEMA
      ↓
VALIDATION
      ↓
DATA BINDING
      ↓
DOCUMENT ENGINE
      ↓
┌──────────────┐
│              │
PDF           DOCX

Não criar dois designers.

Não criar dois templates.

Não permitir que o utilizador desenhe o documento duas vezes.

====================================================================
3. ARQUITECTURA
====================================================================

Implementar:

Component Registry
Component Definition
Component Schema
Component Properties
Component Editor
Component Validator
Component Preview Renderer
Component PDF Renderer
Component DOCX Renderer

Também criar:

Field Registry
Binding Engine
Template Validator
Layout Engine
Pagination Engine
Asset Registry
Document Renderer

====================================================================
4. COMPONENT DEFINITION
====================================================================

Cada componente deve possuir:

id
type
name
category
version
defaultProps
schema
validation
renderer
editor
capabilities

Exemplo:

ComponentDefinition {
    type
    label
    category
    icon
    defaultProps
    propertySchema
    dataBinding
    validation
    previewRenderer
    pdfRenderer
    docxRenderer
}

Adicionar novos componentes não deve exigir alteração do núcleo.

====================================================================
5. TEMPLATE
====================================================================

Criar:

DocumentTemplate

Campos:

id
name
code
description
category
version
status
page_format
schema
created_by
updated_by
published_at
created_at
updated_at

Estados:

DRAFT
PUBLISHED
ARCHIVED

====================================================================
6. VERSIONAMENTO
====================================================================

Templates devem ser versionáveis.

Exemplo:

Participação
v1
v2
v3

Nunca alterar silenciosamente um template publicado.

Quando editar um template publicado:

criar nova versão.

====================================================================
7. TEMPLATE VERSION
====================================================================

Criar:

DocumentTemplateVersion

Campos:

id
template_id
version
schema
status
created_by
created_at
published_at

Permitir:

draft
publish
archive

====================================================================
8. SNAPSHOT
====================================================================

Quando um documento for futuramente gerado a partir de um template:

guardar referência à versão exacta utilizada.

Não depender da versão actual do template.

====================================================================
9. CATEGORIAS
====================================================================

Criar:

BÁSICOS
CAMPOS
DOCUMENTAÇÃO OFICIAL
IDENTIFICAÇÃO INSTITUCIONAL
PROCESSOS
PESSOAS
FORMULÁRIOS
TABELAS
ASSINATURAS
CARIMBOS
PÁGINAS
CABEÇALHOS E RODAPÉS
CÓDIGOS
LAYOUT
ANEXOS
COMPONENTES REUTILIZÁVEIS

====================================================================
10. COMPONENTES BÁSICOS
====================================================================

Implementar:

TEXT
HEADING
PARAGRAPH
RICH_TEXT
SPACER
LINE
VERTICAL_LINE
RECTANGLE
CONTAINER
SECTION
GROUP

Suportar:

posição
largura
altura
margem
padding
alinhamento
fonte
tamanho
peso
estilo
cor
borda
background
quebra de página

====================================================================
11. RICH TEXT
====================================================================

Implementar:

RICH_TEXT

Suportar:

negrito
itálico
sublinhado
alinhamento
justificação
listas
numeração
recuo
espaçamento
quebra de linha
variáveis
bindings SIP

Exemplo:

O processo {{processo.numero}} foi instaurado em {{processo.data}}.

====================================================================
12. IDENTIDADE OFICIAL
====================================================================

Implementar:

ANGOLA_HEADER
OFFICIAL_HEADER
OFFICIAL_LOGO
COAT_OF_ARMS
INSTITUTIONAL_BLOCK
OFFICIAL_FOOTER

====================================================================
13. ANGOLA HEADER
====================================================================

Criar:

ANGOLA_HEADER

Permitir:

texto
brasão
alinhamento
fonte
tamanho
peso
espaçamento
posição
separadores

Texto inicial:

REPÚBLICA DE ANGOLA

Mas configurável.

NÃO hardcodar no renderer.

====================================================================
14. COAT OF ARMS
====================================================================

Criar:

COAT_OF_ARMS

Suportar:

asset
upload
width
height
position
alignment
lockAspectRatio
bloquear
substituir

O asset deve ser armazenado no MinIO.

O template guarda apenas:

asset_id

====================================================================
15. OFFICIAL LOGO
====================================================================

Criar:

OFFICIAL_LOGO

Suportar:

logo institucional
logo da direcção
logo do departamento
outros logos autorizados

====================================================================
16. OFFICIAL HEADER
====================================================================

Criar:

OFFICIAL_HEADER

Permitir:

REPÚBLICA DE ANGOLA
MINISTÉRIO DO INTERIOR
SERVIÇO DE INVESTIGAÇÃO CRIMINAL
DIRECÇÃO
DEPARTAMENTO
SECÇÃO

Cada linha:

editável
ordenável
ocultável
removível
configurável

====================================================================
17. INSTITUTIONAL BLOCK
====================================================================

Criar:

INSTITUTIONAL_BLOCK

Bindings:

{{organizacao.nome}}
{{organizacao.sigla}}
{{organizacao.direcao.nome}}
{{organizacao.departamento.nome}}
{{organizacao.seccao.nome}}

====================================================================
18. SEPARADORES
====================================================================

Implementar:

HORIZONTAL_RULE
DOUBLE_HORIZONTAL_RULE
VERTICAL_RULE

Propriedades:

espessura
estilo
comprimento
posição
margem
alinhamento

Devem ser elementos vectoriais.

====================================================================
19. FOLHA 25 LINHAS
====================================================================

Implementar:

OFFICIAL_25_LINE_SHEET

Representar:

A4
25 linhas horizontais
linha vertical esquerda
linha vertical direita

NÃO utilizar imagem.

====================================================================
20. CONFIGURAÇÃO 25 LINHAS
====================================================================

Permitir:

quantidade
distância
margens
posição das linhas laterais
espessura
estilo
cor
numeração
posição da numeração
fonte
tamanho

====================================================================
21. LEFT MARGIN LINE
====================================================================

Implementar:

LEFT_MARGIN_LINE

====================================================================
22. RIGHT MARGIN LINE
====================================================================

Implementar:

RIGHT_MARGIN_LINE

====================================================================
23. WRITING LINES
====================================================================

Implementar:

WRITING_LINES

Suportar:

quantidade
espaçamento
comprimento
posição
espessura
estilo
repetição

====================================================================
24. CAMPOS
====================================================================

Implementar:

UNDERLINE_FIELD
BOX_FIELD
MULTILINE_FIELD

====================================================================
25. PROCESSO
====================================================================

Implementar:

PROCESS_FIELD
PROCESS_HEADER
PROCESS_IDENTIFICATION
PROCESS_STATUS
PROCESS_METADATA

Bindings:

{{processo.numero}}
{{processo.ano}}
{{processo.tipo}}
{{processo.estado}}
{{processo.data}}
{{processo.origem}}
{{processo.assunto}}
{{processo.instrutor}}
{{processo.unidade}}

====================================================================
26. PESSOA
====================================================================

Implementar:

PERSON_FIELD
PERSON_IDENTIFICATION
PERSON_BLOCK

Bindings:

{{pessoa.nome}}
{{pessoa.bi}}
{{pessoa.morada}}
{{pessoa.data_nascimento}}
{{pessoa.naturalidade}}
{{pessoa.nacionalidade}}
{{pessoa.profissao}}
{{pessoa.contacto}}

Utilizar Field Picker.

====================================================================
27. DOCUMENTOS PROCESSUAIS
====================================================================

Preparar componentes:

PARTICIPATION_BLOCK
DECLARATION_BLOCK
SEIZURE_BLOCK
OCCURRENCE_BLOCK
STATEMENT_BLOCK
DETENTION_BLOCK
MANDATE_BLOCK

Todos devem utilizar:

Component Registry
Field Registry
Binding Engine
Template Schema

Não criar arquitectura separada para cada documento.

====================================================================
28. TABELAS
====================================================================

Implementar:

DOCUMENT_TABLE

Suportar:

linhas
colunas
header
footer
merge
split
bordas
padding
alinhamento
largura
bindings
repeater

Header deve repetir em quebra de página.

====================================================================
29. REPEATER
====================================================================

Implementar:

REPEATER

Exemplo:

{{processo.intervenientes[]}}

{{processo.documentos[]}}

{{processo.ocorrencias[]}}

O utilizador desenha o item.

O renderer repete.

====================================================================
30. ASSINATURA
====================================================================

Implementar:

SIGNATURE_BLOCK

Suportar:

nome
cargo
função
assinatura
data
local
linha
imagem
assinatura digital

====================================================================
31. MÚLTIPLAS ASSINATURAS
====================================================================

Implementar:

MULTI_SIGNATURE_BLOCK

Suportar:

1
2
3
4+

Configurar:

orientação
colunas
espaçamento
alinhamento
largura

====================================================================
32. CARIMBO
====================================================================

Implementar:

STAMP

Suportar:

imagem
texto
estado
data
rotação
transparência
tamanho

Presets:

ORIGINAL
CÓPIA
RECEBIDO
URGENTE
CONFIDENCIAL
RASCUNHO

====================================================================
33. LOCAL E DATA
====================================================================

Implementar:

LOCATION_DATE

Exemplo:

Luanda, aos ___ de __________ de ______.

====================================================================
34. DOCUMENT NUMBER
====================================================================

Implementar:

DOCUMENT_NUMBER

Suportar:

prefixo
sequencial
ano
separador
formato

Exemplo:

SIC/DIR/DEP/001/2026

====================================================================
35. REFERÊNCIA
====================================================================

Implementar:

DOCUMENT_REFERENCE

====================================================================
36. ASSUNTO
====================================================================

Implementar:

SUBJECT_BLOCK

====================================================================
37. DESTINATÁRIO
====================================================================

Implementar:

RECIPIENT_BLOCK

Suportar:

tratamento
nome
cargo
instituição
unidade
endereço

====================================================================
38. OBSERVAÇÕES
====================================================================

Implementar:

OBSERVATION_BLOCK

====================================================================
39. QR CODE
====================================================================

Implementar:

QR_CODE

Conteúdo:

processo
documento
URL
código
conteúdo dinâmico

====================================================================
40. BARCODE
====================================================================

Implementar:

BARCODE

Suportar diferentes tipos.

====================================================================
41. PAGINAÇÃO
====================================================================

Implementar:

PAGE_NUMBER

Exemplo:

Página {{page.number}} de {{page.total}}

====================================================================
42. WATERMARK
====================================================================

Implementar:

WATERMARK

Suportar:

texto
imagem
rotação
transparência
tamanho
posição

====================================================================
43. CLASSIFICATION LABEL
====================================================================

Implementar:

CLASSIFICATION_LABEL

Puramente configurável.

Não assumir classificação em todos os documentos.

====================================================================
44. ANEXOS
====================================================================

Implementar:

ATTACHMENTS_BLOCK

Suportar:

número
nome
descrição
quantidade
referência

====================================================================
45. HEADER
====================================================================

Implementar:

HEADER

Suportar:

primeira página
todas as páginas
páginas específicas

====================================================================
46. FOOTER
====================================================================

Implementar:

FOOTER

Suportar:

informação institucional
endereço
contacto
código
página
total de páginas
bindings

====================================================================
47. REUSABLE BLOCK
====================================================================

Implementar:

REUSABLE_BLOCK

Permitir transformar selecção de componentes em bloco reutilizável.

Exemplos:

cabeçalho
rodapé
processo
pessoa
assinatura
destinatário
referência
folha 25 linhas

Versionar blocos.

Nunca alterar silenciosamente templates publicados.

====================================================================
48. PRESETS
====================================================================

Criar:

A4 Oficial
A4 Oficial 25 Linhas
Ofício
Despacho
Auto
Termo
Relatório
Participação
Declaração
Documento de Piquete
Documento de Instrução
Documento PGR

O preset cria estrutura inicial no Canvas.

====================================================================
49. ASSETS
====================================================================

Criar:

Asset Library

Categorias:

brasões
logotipos
assinaturas
carimbos
imagens
símbolos
elementos institucionais

Armazenamento:

MinIO

Template:

asset_id

Nunca guardar binário dentro do Template Schema.

====================================================================
50. FIELD REGISTRY
====================================================================

Criar:

FieldRegistry

Cada campo deve possuir:

key
label
type
description
source
permissions

Exemplo:

processo.numero

processo.assunto

pessoa.nome

pessoa.bi

organizacao.nome

====================================================================
51. FIELD PICKER
====================================================================

Criar interface para seleccionar bindings.

Categorias:

Processo
Pessoa
Organização
Utilizador
Documento
PGR
Piquete
Datas
Sistema

Os campos futuros podem ser adicionados ao registry sem alterar o editor.

====================================================================
52. BINDING ENGINE
====================================================================

Implementar:

BindingResolver

Responsável por resolver:

{{processo.numero}}

{{pessoa.nome}}

{{organizacao.nome}}

Não permitir acesso arbitrário a objectos Python.

Não executar código vindo do template.

====================================================================
53. DADOS VAZIOS
====================================================================

Cada campo deve suportar:

hide
empty
N/A
line
label_only

====================================================================
54. LAYOUT ENGINE
====================================================================

Implementar layout baseado em:

A4
milímetros
margens
área segura
área imprimível

O documento não deve depender do tamanho do monitor.

====================================================================
55. CANVAS
====================================================================

Criar editor A4.

Suportar:

drag
drop
resize
move
select
multi-select
duplicate
delete
lock
group
ungroup

====================================================================
56. SNAP
====================================================================

Implementar:

snap to grid
snap to element
snap to margin
snap to center
smart guides

====================================================================
57. GRID
====================================================================

Suportar:

on/off
spacing
snap
visual intensity

Nunca exportar grid.

====================================================================
58. RULERS
====================================================================

Horizontal
Vertical

Unidade:

milímetros.

====================================================================
59. SAFE AREA
====================================================================

Mostrar:

margens
área imprimível
área segura

Alertar:

ERROR
WARNING
INFO

====================================================================
60. COPY / PASTE
====================================================================

Suportar:

Ctrl+C
Ctrl+V
Ctrl+X
Ctrl+D

Preservar:

properties
bindings
styles
internal relations

====================================================================
61. PROPERTIES PANEL
====================================================================

Painel contextual.

Quando componente seleccionado:

mostrar apenas propriedades aplicáveis.

Não apresentar dezenas de opções irrelevantes.

====================================================================
62. LAYERS / OUTLINE
====================================================================

Criar painel de estrutura:

Página
 ├── Header
 ├── Section
 │    ├── Text
 │    ├── Person Field
 │    └── Table
 └── Footer

Permitir:

seleccionar
reordenar
ocultar
bloquear

====================================================================
63. MULTI-SELECT
====================================================================

Permitir:

mover
alinhar
distribuir
agrupar
duplicar
excluir
bloquear

====================================================================
64. VALIDATION ENGINE
====================================================================

Validar:

binding inválido
componente fora da página
overflow
conteúdo cortado
tabela fora da área
asset inexistente
componente incompatível
template inválido

====================================================================
65. ERROS
====================================================================

ERROR:

impede publicação.

WARNING:

permite publicação com confirmação.

INFO:

informativo.

====================================================================
66. PAGINAÇÃO
====================================================================

Implementar motor preparado para:

overflow
page break
keep together
repeat header
repeat component
widow/orphan handling

====================================================================
67. DOCUMENT ENGINE
====================================================================

Criar abstracção:

DocumentRenderingEngine

Entrada:

Template Schema
+
Data

Saída:

Rendered Document

====================================================================
68. PDF RENDERER
====================================================================

Criar:

PDFRenderer

Interpretar o mesmo Template Schema.

Suportar:

texto
fontes
linhas
tabelas
imagens
headers
footers
assinaturas
QR
barcode
25 linhas
paginação

====================================================================
69. DOCX RENDERER
====================================================================

Criar:

DOCXRenderer

Interpretar o mesmo Template Schema.

Não criar segundo designer.

====================================================================
70. FIDELIDADE
====================================================================

Priorizar fidelidade entre:

Canvas
PDF
DOCX

Especial atenção:

posição
margens
fontes
linhas
tabelas
headers
footers
assinaturas
25 linhas
imagens
paginação

====================================================================
71. PREVIEW
====================================================================

Criar preview:

Canvas
PDF Preview
DOCX Preview quando tecnicamente disponível

Permitir:

zoom
fit width
fit page
page navigation

====================================================================
72. DOCUMENT PREVIEW
====================================================================

O utilizador deve poder visualizar o documento antes da publicação.

Não publicar template inválido.

====================================================================
73. RESPONSIVE EDITOR
====================================================================

O documento permanece A4.

A UI deve adaptar-se.

Painéis:

collapse
expand
resize

Canvas mantém proporção.

====================================================================
74. FRONTEND
====================================================================

Next.js
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
TanStack Query

Não utilizar:

TanStack Start.

====================================================================
75. BACKEND
====================================================================

Python
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL

====================================================================
76. STORAGE
====================================================================

MinIO para:

assets
documentos renderizados quando necessário
ficheiros auxiliares

PostgreSQL:

metadados
templates
schemas
versões
referências

====================================================================
77. SEGURANÇA
====================================================================

Aplicar autorização para:

criar template
editar template
publicar template
arquivar template
gerir assets
utilizar componentes
gerir presets

====================================================================
78. AUDITORIA
====================================================================

Registar:

TEMPLATE_CREATED
TEMPLATE_UPDATED
TEMPLATE_VERSION_CREATED
TEMPLATE_PUBLISHED
TEMPLATE_ARCHIVED

ASSET_CREATED
ASSET_UPDATED
ASSET_DELETED

REUSABLE_BLOCK_CREATED
REUSABLE_BLOCK_UPDATED
REUSABLE_BLOCK_VERSIONED

====================================================================
79. API
====================================================================

Criar endpoints:

GET    /api/v1/document-templates
POST   /api/v1/document-templates
GET    /api/v1/document-templates/{id}
PATCH  /api/v1/document-templates/{id}

GET    /api/v1/document-templates/{id}/versions
POST   /api/v1/document-templates/{id}/versions

POST   /api/v1/document-templates/{id}/publish
POST   /api/v1/document-templates/{id}/archive

GET    /api/v1/document-components
GET    /api/v1/document-fields

GET    /api/v1/assets
POST   /api/v1/assets

GET    /api/v1/reusable-blocks
POST   /api/v1/reusable-blocks

====================================================================
80. FRONTEND ROUTES
====================================================================

Criar:

/documentos/templates

/documentos/templates/novo

/documentos/templates/[id]

/documentos/templates/[id]/editar

/documentos/templates/[id]/versoes

/documentos/componentes

/documentos/assets

/documentos/blocos-reutilizaveis

====================================================================
81. TEMPLATE EDITOR
====================================================================

Layout:

┌─────────────────────────────────────────────┐
│ Toolbar                                     │
├────────────┬──────────────────┬─────────────┤
│ Components │      Canvas      │ Properties  │
│            │                  │             │
│ Library    │       A4         │ Properties  │
│            │                  │ Bindings    │
│            │                  │ Validation  │
├────────────┴──────────────────┴─────────────┤
│ Status / Validation / Page Navigation      │
└─────────────────────────────────────────────┘

====================================================================
82. COMPONENT LIBRARY
====================================================================

Sidebar esquerda:

Pesquisar componente.

Categorias.

Preview visual.

Drag and Drop.

Mostrar:

nome
categoria
descrição
capabilities

====================================================================
83. TOOLBAR
====================================================================

Incluir:

Undo
Redo
Copy
Paste
Duplicate
Delete
Align
Group
Ungroup
Lock
Grid
Snap
Zoom
Preview
Validate
Save
Publish

====================================================================
84. AUTOSAVE
====================================================================

Implementar autosave para drafts.

Não publicar automaticamente.

Mostrar:

Guardado
A guardar...
Alterações não guardadas

====================================================================
85. CONFLICT CONTROL
====================================================================

Preparar controlo de edição concorrente.

Evitar que uma versão publicada seja sobrescrita.

====================================================================
86. VERSION HISTORY
====================================================================

Mostrar:

versão
autor
data
estado

Permitir:

visualizar
comparar
restaurar como nova versão

Não sobrescrever versão histórica.

====================================================================
87. TEMPLATE VALIDATION
====================================================================

Antes de publicar:

executar validação completa.

Não permitir publicação com ERROR.

Warnings devem ser confirmados.

====================================================================
88. COMPONENT EXTENSIBILITY
====================================================================

Novos componentes devem ser adicionáveis via registry.

Não espalhar:

if component.type == ...

por toda a aplicação.

Utilizar registry/resolution.

====================================================================
89. COMPONENT CAPABILITIES
====================================================================

Exemplo:

{
  supportsBinding: true,
  supportsResize: true,
  supportsPagination: true,
  supportsPdf: true,
  supportsDocx: true
}

O editor deve utilizar capabilities para controlar funcionalidades.

====================================================================
90. DOCUMENT PRESETS
====================================================================

Os presets devem ser templates iniciais.

Não criar código específico para cada tipo.

====================================================================
91. PARTICIPAÇÃO
====================================================================

Preparar preset:

PARTICIPAÇÃO

Mas não implementar ainda o módulo de Entrada de Registos.

====================================================================
92. AUTO
====================================================================

Preparar preset:

AUTO

====================================================================
93. DECLARAÇÃO
====================================================================

Preparar preset:

DECLARAÇÃO

====================================================================
94. DOCUMENTO PIQUETE
====================================================================

Preparar preset:

DOCUMENTO DE PIQUETE

====================================================================
95. DOCUMENTO INSTRUÇÃO
====================================================================

Preparar preset:

DOCUMENTO DE INSTRUÇÃO

====================================================================
96. DOCUMENTO PGR
====================================================================

Preparar preset:

DOCUMENTO PGR

====================================================================
97. NÃO IMPLEMENTAR NESTA SPRINT
====================================================================

Não implementar:

Entrada de Registos
Denúncias
Participações operacionais
Autos operacionais
Processos
Piquete
Distribuição
Despachos
Mandados
BRP
PGR Workflow

Apenas criar a infraestrutura documental.

====================================================================
98. TESTES
====================================================================

Testar:

Component Registry
Component Schema
Field Registry
Binding Engine
Template Schema
Template Validation
Versioning
Asset references
Reusable Blocks
Pagination
PDF Renderer
DOCX Renderer

====================================================================
99. TESTE DE BINDING
====================================================================

Template:

{{pessoa.nome}}

Data:

{
  "pessoa": {
    "nome": "João Manuel"
  }
}

Resultado:

João Manuel

====================================================================
100. TESTE DE DADOS VAZIOS
====================================================================

BI inexistente.

Comportamento:

hide

Resultado:

campo desaparece.

Outro template:

line

Resultado:

BI Nº: ______________________

====================================================================
101. TESTE DE REPEATER
====================================================================

Data:

processo.documentos = [
  Documento A,
  Documento B,
  Documento C
]

Resultado:

três linhas/blocos.

====================================================================
102. TESTE 25 LINHAS
====================================================================

Criar:

OFFICIAL_25_LINE_SHEET

Validar:

25 linhas horizontais
2 linhas verticais
A4
margens correctas

====================================================================
103. TESTE DE PAGINAÇÃO
====================================================================

Criar conteúdo superior à página.

Resultado:

overflow correctamente distribuído.

====================================================================
104. TESTE DE TABELA
====================================================================

Tabela maior que uma página.

Resultado:

header repetido.

====================================================================
105. TESTE PDF
====================================================================

Gerar PDF.

Validar:

layout
fontes
margens
linhas
imagens
paginação

====================================================================
106. TESTE DOCX
====================================================================

Gerar DOCX.

Validar:

layout
tabelas
linhas
imagens
headers
footers
assinaturas

====================================================================
107. TESTE DE VERSIONAMENTO
====================================================================

Publicar v1.

Editar.

Criar v2.

Resultado:

v1 permanece intacta.

====================================================================
108. TESTE DE SEGURANÇA
====================================================================

Utilizador sem permissão:

não pode editar template.

Utilizador autorizado:

pode editar.

====================================================================
109. TASKS
====================================================================

Criar:

prompts/tasks/sprint-05/

TASK-001-audit-document-architecture.md
TASK-002-template-domain.md
TASK-003-template-versioning.md
TASK-004-component-registry.md
TASK-005-component-schema.md
TASK-006-field-registry.md
TASK-007-binding-engine.md
TASK-008-basic-components.md
TASK-009-official-components.md
TASK-010-process-components.md
TASK-011-person-components.md
TASK-012-processual-components.md
TASK-013-table-component.md
TASK-014-repeater.md
TASK-015-signature-components.md
TASK-016-stamp-components.md
TASK-017-code-components.md
TASK-018-header-footer.md
TASK-019-25-line-sheet.md
TASK-020-assets.md
TASK-021-reusable-blocks.md
TASK-022-presets.md
TASK-023-canvas.md
TASK-024-component-library.md
TASK-025-properties-panel.md
TASK-026-layout-engine.md
TASK-027-grid-snap-rulers.md
TASK-028-validation-engine.md
TASK-029-pagination-engine.md
TASK-030-pdf-renderer.md
TASK-031-docx-renderer.md
TASK-032-preview.md
TASK-033-template-api.md
TASK-034-template-editor.md
TASK-035-version-history.md
TASK-036-authorization.md
TASK-037-audit.md
TASK-038-tests.md
TASK-039-e2e.md
TASK-040-documentation.md
TASK-041-final-review.md

====================================================================
110. CHECKPOINTS
====================================================================

CHECKPOINT A
Template Domain

CHECKPOINT B
Component Registry

CHECKPOINT C
Field Registry + Binding

CHECKPOINT D
Official Components

CHECKPOINT E
Process + Person Components

CHECKPOINT F
Tables + Repeaters

CHECKPOINT G
25-Line Sheet

CHECKPOINT H
Assets

CHECKPOINT I
Reusable Blocks

CHECKPOINT J
Canvas

CHECKPOINT K
Validation

CHECKPOINT L
Pagination

CHECKPOINT M
PDF

CHECKPOINT N
DOCX

CHECKPOINT O
Frontend Editor

CHECKPOINT P
Authorization

CHECKPOINT Q
Tests

CHECKPOINT R
Documentation

Cada checkpoint:

lint
typecheck
tests
build

Depois:

commit.

====================================================================
111. COMMITS
====================================================================

Exemplos:

feat(documents): implement template domain

feat(documents): implement component registry

feat(documents): implement field registry

feat(documents): implement binding engine

feat(documents): implement official document components

feat(documents): implement process components

feat(documents): implement person components

feat(documents): implement document tables

feat(documents): implement repeaters

feat(documents): implement official 25-line sheet

feat(documents): implement asset library

feat(documents): implement reusable blocks

feat(documents): implement document canvas

feat(documents): implement validation engine

feat(documents): implement pagination engine

feat(documents): implement pdf renderer

feat(documents): implement docx renderer

feat(documents): implement template editor

test(documents): add renderer tests

test(documents): add template e2e tests

docs(documents): document form builder architecture

chore(sprint-05): complete document form builder

====================================================================
112. DOCUMENTAÇÃO
====================================================================

Criar:

docs/sprints/SPRINT-05.md

docs/architecture/document-engine.md

docs/architecture/template-schema.md

docs/architecture/component-registry.md

docs/architecture/binding-engine.md

docs/architecture/rendering.md

====================================================================
113. DEFINITION OF DONE
====================================================================

[ ] Template Domain
[ ] Template Versioning
[ ] Component Registry
[ ] Component Schema
[ ] Field Registry
[ ] Binding Engine
[ ] Basic Components
[ ] Official Components
[ ] Process Components
[ ] Person Components
[ ] Processual Components
[ ] Tables
[ ] Repeater
[ ] Signatures
[ ] Multiple Signatures
[ ] Stamps
[ ] QR Code
[ ] Barcode
[ ] Headers
[ ] Footers
[ ] Pagination
[ ] Watermark
[ ] Classification
[ ] Attachments
[ ] 25-Line Sheet
[ ] Assets
[ ] Reusable Blocks
[ ] Presets
[ ] Canvas
[ ] Grid
[ ] Snap
[ ] Rulers
[ ] Safe Area
[ ] Validation
[ ] Pagination Engine
[ ] PDF Renderer
[ ] DOCX Renderer
[ ] Preview
[ ] Version History
[ ] API
[ ] Frontend
[ ] Authorization
[ ] Audit
[ ] Unit Tests
[ ] Integration Tests
[ ] E2E
[ ] Documentation
[ ] Sidebar
[ ] Lint PASS
[ ] Typecheck PASS
[ ] Build PASS
[ ] Tests PASS
[ ] Tasks DONE
[ ] Commits DONE

====================================================================
114. REGRA FINAL
====================================================================

Não iniciar automaticamente a SPRINT-06.

Após terminar:

1. executar todos os testes;
2. executar build;
3. rever segurança;
4. rever migrations;
5. rever documentação;
6. verificar todos os commits;
7. actualizar SPRINT-05;
8. marcar Sprint como DONE;
9. apresentar relatório final;
10. PARAR.

Aguardar autorização explícita.

====================================================================
FIM DO PROMPT — SPRINT 05
====================================================================
```

### Uma decisão importante nesta Sprint

Eu **não faria o OpenCode tentar implementar os mais de 60 componentes todos como código isolado de uma vez**. O prompt acima define a biblioteca completa, mas a execução deve ser incremental:

```text
Registry
   ↓
Schema
   ↓
Basic Components
   ↓
Official Components
   ↓
Binding
   ↓
Canvas
   ↓
Validation
   ↓
Pagination
   ↓
PDF/DOCX
   ↓
Advanced Components
```

Assim evitamos que a IA crie um Form Builder enorme, inconsistente e difícil de manter.

E a sequência fica muito mais sólida:

**SPRINT 03** criou *quem são as pessoas, onde estão e quais responsabilidades possuem*.

**SPRINT 04** criou *como o SIP comunica acontecimentos aos utilizadores*.

**SPRINT 05** agora cria *como o SIP constrói os documentos oficiais*.

Depois disso, a **SPRINT 06** poderá implementar o **Gestor de Documentos**, consumindo o Form Builder — e só depois entraremos na **Entrada de Registos de Denúncias, Participações e Autos**, que poderá efetivamente utilizar os templates e componentes documentais já construídos.
