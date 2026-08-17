# Biblioteca Profissional de Componentes Documentais do SIP

> Especificação normativa. O motor documental do SIP baseia-se nestes
> componentes para gerar documentos oficiais e processuais.

## Regra

- Um único template gera PDF e DOCX.
- O utilizador desenha o documento **uma única vez**.
- O motor renderiza em ambos os formatos.

## Componentes

### Básicos

| ID | Componente | Descrição |
|---|---|---|
| TEXT | Texto | Bloco de texto simples |
| HEADING | Título | Título/seccão (nível 1–6) |
| PARAGRAPH | Parágrafo | Parágrafo com formatação |
| RICH_TEXT | Texto Rico | Texto com formatação mista |
| LINE | Linha | Linha horizontal de separação |
| CONTAINER | Contêiner | Bloco agrupador |
| SECCION | Seccão | Seccão com título e conteúdo |

### Metadados do Documento

| ID | Componente | Descrição |
|---|---|---|
| DOCUMENT_NUMBER | Número do Documento | Numeração automática do documento |
| DOCUMENT_REFERENCE | Referência | Referência cruzada a outros documentos |
| SUBJECT_BLOCK | Bloco de Assunto | Assunto/epígrafe do documento |
| PERSON_FIELD | Campo de Pessoa | Nome, BI, qualidade, morada |
| PROCESS_FIELD | Campo de Processo | Número do processo, data, estado |

### Cabeçalho Oficial

| ID | Componente | Descrição |
|---|---|---|
| OFFICIAL_HEADER | Cabeçalho Oficial | Cabeçalho institucional padrão |
| COAT_OF_ARMS | Brasão | Brasão da República |
| OFFICIAL_LOGO | Logotipo Oficial | Logotipo da instituição |
| INSTITUTIONAL_BLOCK | Bloco Institucional | Nome do organismo, direcção, departamento |

### Tabelas e Repetição

| ID | Componente | Descrição |
|---|---|---|
| DOCUMENT_TABLE | Tabela | Tabela com colunas e linhas |
| REPEATER | Repetidor | Repete secção para cada item |
| SIGNATURE_BLOCK | Bloco de Assinatura | Campo de assinatura simples |
| MULTI_SIGNATURE_BLOCK | Assinaturas Múltiplas | Vários assinantes |

### Componentes Processuais

| ID | Componente | Descrição |
|---|---|---|
| PARTICIPATION_BLOCK | Participação | Bloco de participação oficial |
| DECLARATION_BLOCK | Declaração | Bloco de declaração testemunhal |
| SEIZURE_BLOCK | Apreensão | Registo de apreensão de bens |
| OCCURRENCE_BLOCK | Ocorrência | Registo de ocorrência |
| STATEMENT_BLOCK | Depoimento | Depoimento formal |
| DETENTION_BLOCK | Detenção | Registo de detenção |
| MANDATE_BLOCK | Mandado | Mandado de busca, detenção, etc. |

### Especial

| ID | Componente | Descrição |
|---|---|---|
| OFFICIAL_25_LINE_SHEET | Folha Oficial 25 linhas | Formato oficial angolano |

## Regras de Formatação

- Formato A4 (210mm × 297mm).
- Margens: 30mm esquerda, 20mm direita, 25mm topo, 25mm fundo.
- Corpo: 12pt Times New Roman ou equivalente.
- Interlinha: 1.5.
- Numeração de páginas no rodapé.
- Cabeçalho institucional em todas as páginas.

## Dados do Template

Cada template define:

```json
{
  "documentType": "PARTICIPATION",
  "version": "1.0",
  "components": [...],
  "bindings": {...},
  "validation": {...}
}
```

## Bindings

O template define variáveis que são preenchidas com dados do processo:

```
{{process.number}}
{{process.subject}}
{{person.name}}
{{person.id_number}}
{{institution.name}}
{{institution.director}}
```

## Validação

O motor valida:

- Campos obrigatórios.
- Formatos (data, número, texto).
- Comprimento máximo.
- Regras específicas por tipo de documento.
