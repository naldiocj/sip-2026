const PERMISSION_LABELS: Record<string, string> = {
  "process.read": "Consultar Processos",
  "process.create": "Criar Processos",
  "process.update": "Atualizar Processos",
  "process.assign": "Atribuir Processos",
  "process.delete": "Eliminar Processos",
  "document.read": "Consultar Documentos",
  "document.create": "Criar Documentos",
  "document.edit": "Editar Documentos",
  "document.publish": "Publicar Documentos",
  "document.delete": "Eliminar Documentos",
  "user.read": "Consultar Utilizadores",
  "user.create": "Criar Utilizadores",
  "user.update": "Atualizar Utilizadores",
  "user.delete": "Eliminar Utilizadores",
  "profile.read": "Consultar Perfis",
  "profile.manage": "Gerir Perfis",
  "permission.read": "Consultar Permissões",
  "permission.manage": "Gerir Permissões",
  "notification.read": "Consultar Notificações",
  "notification.manage": "Gerir Notificações",
  "organization.read": "Consultar Organização",
  "organization.manage": "Gerir Organização",
  "organization.create": "Criar Organização",
  "organization.update": "Atualizar Organização",
  "person.read": "Consultar Pessoas",
  "person.create": "Criar Pessoas",
  "person.update": "Atualizar Pessoas",
  "person.deactivate": "Desativar Pessoas",
  "assignment.read": "Consultar Atribuições",
  "assignment.create": "Criar Atribuições",
  "assignment.update": "Atualizar Atribuições",
  "assignment.end": "Terminar Atribuições",
  "responsibility.read": "Consultar Responsabilidades",
  "responsibility.manage": "Gerir Responsabilidades",
  "delegation.read": "Consultar Delegações",
  "delegation.manage": "Gerir Delegações",
  "system.admin": "Administrar o Sistema",
  "system.config": "Configurar o Sistema",
  "system.audit": "Consultar Auditoria",
  "report.read": "Consultar Relatórios",
  "report.create": "Criar Relatórios",
  "report.export": "Exportar Relatórios",
  "template.read": "Consultar Templates",
  "template.create": "Criar Templates",
  "template.edit": "Editar Templates",
  "template.publish": "Publicar Templates",
  "piquete.read": "Consultar Piquete",
  "piquete.create": "Criar Piquete",
  "piquete.update": "Atualizar Piquete",
  "pgr.read": "Consultar PGR",
  "pgr.manage": "Gerir PGR",
};

const PROFILE_LABELS: Record<string, string> = {
  ADMINISTRADOR_SISTEMA: "Administrador do Sistema",
  DIRECTOR: "Director",
  SECRETARIA_GERAL: "Secretaria Geral",
  CHEFE_DEPARTAMENTO: "Chefe de Departamento",
  CHEFE_SECCAO: "Chefe de Secção",
  INSTRUTOR_PROCESSUAL: "Instrutor Processual",
  AGENTE_PIQUETE: "Agente de Piquete",
  EDITOR_DOCUMENTAL: "Editor Documental",
  AGENTE_PGR: "Agente PGR",
};

const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  BLOCKED: "Bloqueado",
  PENDING: "Pendente",
};

const PERSON_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  RETIRED: "Reformado",
  DECEASED: "Falecido",
  UNKNOWN: "Desconhecido",
};

const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  EMPLOYED: "Empregado",
  ON_LEAVE: "Licença",
  SUSPENDED: "Suspenso",
  TERMINATED: "Terminado",
  NOT_APPLICABLE: "Não aplicável",
};

const PROCESS_STATUS_LABELS: Record<string, string> = {
  RECEBIDO: "Recebido",
  EM_ANALISE: "Em análise",
  EM_INSTRUCAO: "Em instrução",
  AGUARDANDO_DESPACHO: "Aguardando despacho",
  DESPACHADO: "Despachado",
  CONCLUIDO: "Concluído",
  ARQUIVADO: "Arquivado",
  SUSPENSO: "Suspenso",
  REABERTO: "Reaberto",
  DEVOLVIDO: "Devolvido",
  TRANSFERIDO: "Transferido",
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  DENUNCIA: "Denúncia",
  PARTICIPACAO: "Participação",
  QUEIXA: "Queixa",
  AUTO: "Auto",
  DESPACHO: "Despacho",
  MANDADO: "Mandado",
  RELATORIO: "Relatório",
  TERMOS: "Termos",
  DECLARACAO: "Declaração",
  OFICIO: "Ofício",
  NOTIFICACAO: "Notificação",
  REQUERIMENTO: "Requerimento",
  RECIBO: "Recibo",
  CAPA: "Capa do Processo",
  PARECER: "Parecer",
};

const OCCURRENCE_TYPE_LABELS: Record<string, string> = {
  CRIME: "Crime",
  CONTRAVENCAO: "Contra-ordenação",
  INFRACAO: "Infração",
  OCORRENCIA: "Ocorrência",
  PARTICIPACAO: "Participação",
  DENUNCIA: "Denúncia",
  QUEIXA: "Queixa",
};

const MANDATE_STATUS_LABELS: Record<string, string> = {
  EMITIDO: "Emitido",
  PENDENTE: "Pendente",
  EM_EXECUCAO: "Em execução",
  CUMPRIDO: "Cumprido",
  DEVOLVIDO: "Devolvido",
  ANULADO: "Anulado",
  REVOGADO: "Revogado",
};

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  PROCESSO_ATRIBUIDO: "Processo atribuído",
  NOVO_DESPACHO: "Novo despacho",
  PRAZO_PROXIMO: "Prazo próximo",
  DOCUMENTO_RECEBIDO: "Documento recebido",
  PROCESSO_DEVOLVIDO: "Processo devolvido",
  SOLICITACAO_PGR: "Solicitação PGR",
  MANDADO_PENDENTE: "Mandado pendente",
  DILIGENCIA_PENDENTE: "Diligência pendente",
};

const UNIT_TYPE_LABELS: Record<string, string> = {
  ORGANIZATION: "Organização",
  DIRECTION: "Direcção",
  DEPARTMENT: "Departamento",
  SECTION: "Secção",
  UNIT: "Unidade",
  PIQUETE: "Piquete",
  OTHER: "Outra Unidade",
};

const ASSIGNMENT_TYPE_LABELS: Record<string, string> = {
  PRIMARY: "Principal",
  SECONDARY: "Secundária",
  TEMPORARY: "Temporária",
  ACTING: "Interino",
  DELEGATED: "Delegada",
};

const RESPONSIBILITY_SCOPE_LABELS: Record<string, string> = {
  DIRECTION: "Direção",
  DEPARTMENT: "Departamento",
  SECTION: "Secção",
  UNIT: "Unidade",
  PIQUETE: "Piquete",
  PROCESS_MANAGEMENT: "Gestão de Processos",
  DOCUMENT_MANAGEMENT: "Gestão de Documentos",
};

const AUDIT_ACTION_LABELS: Record<string, string> = {
  CREATED: "Criado",
  UPDATED: "Alterado",
  TRANSFERRED: "Transferido",
  DISPATCHED: "Despachado",
  SIGNED: "Assinado",
  CANCELLED: "Anulado",
  ARCHIVED: "Arquivado",
  REOPENED: "Reaberto",
};

const DOMAIN_LABEL_MAPS: Record<string, Record<string, string>> = {
  process: PROCESS_STATUS_LABELS,
  document: DOCUMENT_TYPE_LABELS,
  occurrence: OCCURRENCE_TYPE_LABELS,
  mandate: MANDATE_STATUS_LABELS,
  notification: NOTIFICATION_TYPE_LABELS,
  audit: AUDIT_ACTION_LABELS,
};

export function humanizePermission(code: string): string {
  const label = PERMISSION_LABELS[code];
  if (label) {
    return label;
  }
  const [resource, action] = code.split(".");
  if (!action) {
    return code;
  }
  return `${titleCase(resource)}: ${titleCase(action)}`;
}

export function humanizeProfile(code: string): string {
  return PROFILE_LABELS[code] ?? titleCase(code);
}

export function humanizeUserStatus(status: string): string {
  return USER_STATUS_LABELS[status] ?? titleCase(status);
}

export function humanizePersonStatus(status: string): string {
  return PERSON_STATUS_LABELS[status] ?? titleCase(status);
}

export function humanizeEmploymentStatus(status: string): string {
  return EMPLOYMENT_STATUS_LABELS[status] ?? titleCase(status);
}

export function humanizeUnitType(code: string): string {
  return UNIT_TYPE_LABELS[code] ?? titleCase(code);
}

export function humanizeAssignmentType(code: string): string {
  return ASSIGNMENT_TYPE_LABELS[code] ?? titleCase(code);
}

export function humanizeResponsibilityScope(scope: string): string {
  return RESPONSIBILITY_SCOPE_LABELS[scope] ?? titleCase(scope);
}

export function humanizeProcessStatus(status: string): string {
  return PROCESS_STATUS_LABELS[status] ?? titleCase(status);
}

export function humanizeDocumentType(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? titleCase(type);
}

export function humanizeOccurrenceType(type: string): string {
  return OCCURRENCE_TYPE_LABELS[type] ?? titleCase(type);
}

export function humanizeMandateStatus(status: string): string {
  return MANDATE_STATUS_LABELS[status] ?? titleCase(status);
}

export function humanizeNotificationType(type: string): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? titleCase(type);
}

export function humanizeAuditAction(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? titleCase(action);
}

export function humanizeStatus(status: string, domain?: string): string {
  if (domain && DOMAIN_LABEL_MAPS[domain]) {
    return DOMAIN_LABEL_MAPS[domain][status] ?? titleCase(status);
  }
  return titleCase(status);
}

export function humanizeEntity(type: string, code: string): string {
  const maps: Record<string, Record<string, string>> = {
    permission: PERMISSION_LABELS,
    profile: PROFILE_LABELS,
    userStatus: USER_STATUS_LABELS,
    personStatus: PERSON_STATUS_LABELS,
    employmentStatus: EMPLOYMENT_STATUS_LABELS,
    process: PROCESS_STATUS_LABELS,
    document: DOCUMENT_TYPE_LABELS,
    occurrence: OCCURRENCE_TYPE_LABELS,
    mandate: MANDATE_STATUS_LABELS,
    notification: NOTIFICATION_TYPE_LABELS,
    unitType: UNIT_TYPE_LABELS,
    assignmentType: ASSIGNMENT_TYPE_LABELS,
    scope: RESPONSIBILITY_SCOPE_LABELS,
    audit: AUDIT_ACTION_LABELS,
  };
  return maps[type]?.[code] ?? titleCase(code);
}

export function titleCase(value: string): string {
  return value
    .split(/[_.-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
