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

function titleCase(value: string): string {
  return value
    .split(/[_.-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}