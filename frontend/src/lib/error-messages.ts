/**
 * Mapeamento de códigos de erro do backend para mensagens humanas.
 * NUNCA mostrar códigos técnicos, stack traces, UUIDs ou SQL ao utilizador.
 */

export interface ErrorMessageConfig {
  title: string;
  message: string;
  type: "generic" | "network" | "permission" | "not-found" | "validation" | "server" | "unauthorized" | "forbidden";
  actionLabel?: string;
}

const ERROR_CODE_MAP: Record<string, ErrorMessageConfig> = {
  // Authentication errors
  UNAUTHORIZED: {
    title: "Sessão expirada",
    message: "A sua sessão expirou. Por favor, inicie sessão novamente.",
    type: "unauthorized",
    actionLabel: "Iniciar sessão",
  },
  INVALID_CREDENTIALS: {
    title: "Credenciais inválidas",
    message: "O nome de utilizador ou a palavra-passe estão incorrectos.",
    type: "validation",
  },
  TOKEN_EXPIRED: {
    title: "Token expirado",
    message: "O token de acesso expirou. Por favor, inicie sessão novamente.",
    type: "unauthorized",
    actionLabel: "Iniciar sessão",
  },

  // Permission errors
  FORBIDDEN: {
    title: "Acesso negado",
    message: "Não tem permissão para realizar esta ação.",
    type: "forbidden",
  },
  INSUFFICIENT_PERMISSIONS: {
    title: "Permissões insuficientes",
    message: "Não tem as permissões necessárias para aceder a este recurso.",
    type: "permission",
  },
  RESOURCE_FORBIDDEN: {
    title: "Acesso proibido",
    message: "Não tem autorização para aceder a este recurso.",
    type: "forbidden",
  },

  // Not found errors
  NOT_FOUND: {
    title: "Não encontrado",
    message: "O recurso solicitado não foi encontrado.",
    type: "not-found",
  },
  RESOURCE_NOT_FOUND: {
    title: "Recurso não encontrado",
    message: "O recurso solicitado não existe ou foi removido.",
    type: "not-found",
  },
  PROCESS_NOT_FOUND: {
    title: "Processo não encontrado",
    message: "O processo solicitado não existe.",
    type: "not-found",
  },
  DOCUMENT_NOT_FOUND: {
    title: "Documento não encontrado",
    message: "O documento solicitado não existe.",
    type: "not-found",
  },
  PERSON_NOT_FOUND: {
    title: "Pessoa não encontrada",
    message: "A pessoa solicitada não existe.",
    type: "not-found",
  },

  // Validation errors
  VALIDATION_ERROR: {
    title: "Dados inválidos",
    message: "Verifique os dados introduzidos e tente novamente.",
    type: "validation",
  },
  INVALID_INPUT: {
    title: "Dados inválidos",
    message: "Um ou mais campos contêm valores inválidos.",
    type: "validation",
  },
  REQUIRED_FIELD_MISSING: {
    title: "Campo obrigatório",
    message: "Por favor, preencha todos os campos obrigatórios.",
    type: "validation",
  },
  INVALID_FORMAT: {
    title: "Formato inválido",
    message: "O formato dos dados introduzidos não é válido.",
    type: "validation",
  },
  DUPLICATE_VALUE: {
    title: "Valor duplicado",
    message: "Este valor já existe. Por favor, utilize outro.",
    type: "validation",
  },

  // Server errors
  INTERNAL_SERVER_ERROR: {
    title: "Erro do servidor",
    message: "Ocorreu um erro interno. A equipa técnica foi notificada.",
    type: "server",
  },
  SERVICE_UNAVAILABLE: {
    title: "Serviço indisponível",
    message: "O serviço está temporariamente indisponível. Tente novamente mais tarde.",
    type: "server",
  },
  DATABASE_ERROR: {
    title: "Erro de base de dados",
    message: "Ocorreu um erro ao aceder à base de dados. Tente novamente.",
    type: "server",
  },
  TIMEOUT: {
    title: "Tempo limite excedido",
    message: "A operação demorou demasiado tempo. Tente novamente.",
    type: "server",
  },

  // Network errors
  NETWORK_ERROR: {
    title: "Erro de ligação",
    message: "Não foi possível ligar ao servidor. Verifique a sua ligação à internet.",
    type: "network",
  },
  CONNECTION_REFUSED: {
    title: "Ligação recusada",
    message: "Não foi possível estabelecer ligação com o servidor.",
    type: "network",
  },

  // Business logic errors
  PROCESS_ALREADY_CLOSED: {
    title: "Processo encerrado",
    message: "Este processo já foi encerrado e não pode ser alterado.",
    type: "validation",
  },
  PROCESS_IN_PROGRESS: {
    title: "Processo em andamento",
    message: "Este processo já está em andamento noutra sessão.",
    type: "validation",
  },
  DOCUMENT_LOCKED: {
    title: "Documento bloqueado",
    message: "Este documento está a ser editado por outro utilizador.",
    type: "validation",
  },
  INVALID_STATE_TRANSITION: {
    title: "Transição inválida",
    message: "Não é possível realizar esta transição no estado actual do processo.",
    type: "validation",
  },
  DEADLINE_PASSED: {
    title: "Prazo ultrapassado",
    message: "O prazo para esta ação já expirou.",
    type: "validation",
  },
  QUOTA_EXCEEDED: {
    title: "Limite excedido",
    message: "Atingiu o limite máximo permitido para esta operação.",
    type: "validation",
  },
};

/**
 * Obtém a configuração de mensagem de erro para um código de erro.
 * Retorna configuração genérica se o código não for reconhecido.
 */
export function getErrorMessageConfig(errorCode: string): ErrorMessageConfig {
  return ERROR_CODE_MAP[errorCode] ?? {
    title: "Erro",
    message: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
    type: "generic",
  };
}

/**
 * Extrai o código de erro de uma resposta de erro do backend.
 */
export function extractErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.code === "string") return err.code;
    if (typeof err.error === "string") return err.error;
    if (typeof err.message === "string") {
      // Try to extract error code from message
      const match = err.message.match(/\[([A-Z_]+)\]/);
      if (match) return match[1];
    }
  }
  return "UNKNOWN_ERROR";
}

/**
 * Obtém a mensagem de erro humanizada para um erro do backend.
 */
export function getHumanizedErrorMessage(error: unknown): { title: string; message: string; type: ErrorMessageConfig["type"] } {
  const code = extractErrorCode(error);
  const config = getErrorMessageConfig(code);
  return { title: config.title, message: config.message, type: config.type };
}

/**
 * Cria um ID de correlação para rastreamento de erros.
 */
export function generateCorrelationId(): string {
  return `SIP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/**
 * Formata um erro para exibição ao utilizador.
 */
export function formatErrorForDisplay(error: unknown): {
  title: string;
  message: string;
  type: ErrorMessageConfig["type"];
  correlationId: string;
} {
  const correlationId = generateCorrelationId();
  const { title, message, type } = getHumanizedErrorMessage(error);
  return { title, message, type, correlationId };
}