import { describe, it, expect } from "vitest";
import {
  humanizePermission,
  humanizeProfile,
  humanizeUserStatus,
  humanizeProcessStatus,
  humanizeDocumentType,
  humanizeOccurrenceType,
  humanizeMandateStatus,
  humanizeNotificationType,
  humanizeAuditAction,
  humanizeStatus,
  humanizeEntity,
  titleCase,
} from "@/lib/humanize";

describe("humanizePermission", () => {
  it("returns Portuguese label for known permission", () => {
    expect(humanizePermission("process.read")).toBe("Consultar Processos");
    expect(humanizePermission("document.create")).toBe("Criar Documentos");
    expect(humanizePermission("system.admin")).toBe("Administrar o Sistema");
  });

  it("generates fallback label for unknown permission", () => {
    expect(humanizePermission("custom.action")).toBe("Custom: Action");
  });

  it("returns code when no dot separator", () => {
    expect(humanizePermission("unknown")).toBe("unknown");
  });
});

describe("humanizeProfile", () => {
  it("returns Portuguese label for known profile", () => {
    expect(humanizeProfile("DIRECTOR")).toBe("Director");
    expect(humanizeProfile("INSTRUTOR_PROCESSUAL")).toBe("Instrutor Processual");
  });

  it("generates fallback for unknown profile", () => {
    expect(humanizeProfile("UNKNOWN_ROLE")).toBe("Unknown Role");
  });
});

describe("humanizeUserStatus", () => {
  it("returns Portuguese label for known status", () => {
    expect(humanizeUserStatus("ACTIVE")).toBe("Ativo");
    expect(humanizeUserStatus("INACTIVE")).toBe("Inativo");
    expect(humanizeUserStatus("BLOCKED")).toBe("Bloqueado");
    expect(humanizeUserStatus("SUSPENDED")).toBe("Suspenso");
    expect(humanizeUserStatus("PENDING")).toBe("Pendente");
  });

  it("generates fallback for unknown status", () => {
    expect(humanizeUserStatus("UNKNOWN")).toBe("Unknown");
  });
});

describe("humanizeProcessStatus", () => {
  it("returns Portuguese label for known status", () => {
    expect(humanizeProcessStatus("RECEBIDO")).toBe("Recebido");
    expect(humanizeProcessStatus("EM_INSTRUCAO")).toBe("Em instrução");
    expect(humanizeProcessStatus("ARQUIVADO")).toBe("Arquivado");
  });

  it("generates fallback for unknown status", () => {
    expect(humanizeProcessStatus("CUSTOM_STATUS")).toBe("Custom Status");
  });
});

describe("humanizeDocumentType", () => {
  it("returns Portuguese label for known type", () => {
    expect(humanizeDocumentType("DENUNCIA")).toBe("Denúncia");
    expect(humanizeDocumentType("DESPACHO")).toBe("Despacho");
    expect(humanizeDocumentType("MANDADO")).toBe("Mandado");
  });
});

describe("humanizeOccurrenceType", () => {
  it("returns Portuguese label for known type", () => {
    expect(humanizeOccurrenceType("CRIME")).toBe("Crime");
    expect(humanizeOccurrenceType("QUEIXA")).toBe("Queixa");
  });
});

describe("humanizeMandateStatus", () => {
  it("returns Portuguese label for known status", () => {
    expect(humanizeMandateStatus("EMITIDO")).toBe("Emitido");
    expect(humanizeMandateStatus("CUMPRIDO")).toBe("Cumprido");
    expect(humanizeMandateStatus("ANULADO")).toBe("Anulado");
  });
});

describe("humanizeNotificationType", () => {
  it("returns Portuguese label for known type", () => {
    expect(humanizeNotificationType("PROCESSO_ATRIBUIDO")).toBe("Processo atribuído");
    expect(humanizeNotificationType("PRAZO_PROXIMO")).toBe("Prazo próximo");
  });
});

describe("humanizeAuditAction", () => {
  it("returns Portuguese label for known action", () => {
    expect(humanizeAuditAction("CREATED")).toBe("Criado");
    expect(humanizeAuditAction("TRANSFERRED")).toBe("Transferido");
    expect(humanizeAuditAction("ARCHIVED")).toBe("Arquivado");
  });
});

describe("humanizeStatus", () => {
  it("uses domain-specific map when domain provided", () => {
    expect(humanizeStatus("RECEBIDO", "process")).toBe("Recebido");
    expect(humanizeStatus("DENUNCIA", "document")).toBe("Denúncia");
    expect(humanizeStatus("EMITIDO", "mandate")).toBe("Emitido");
  });

  it("falls back to titleCase when domain unknown", () => {
    expect(humanizeStatus("SOME_STATUS", "unknown")).toBe("Some Status");
  });

  it("falls back to titleCase when no domain", () => {
    expect(humanizeStatus("SOME_STATUS")).toBe("Some Status");
  });
});

describe("humanizeEntity", () => {
  it("resolves known entity types", () => {
    expect(humanizeEntity("permission", "process.read")).toBe("Consultar Processos");
    expect(humanizeEntity("profile", "DIRECTOR")).toBe("Director");
    expect(humanizeEntity("process", "CONCLUIDO")).toBe("Concluído");
    expect(humanizeEntity("document", "AUTO")).toBe("Auto");
  });

  it("falls back to titleCase for unknown entity types", () => {
    expect(humanizeEntity("unknown", "SOME_CODE")).toBe("Some Code");
  });
});

describe("titleCase", () => {
  it("splits on underscores and capitalizes", () => {
    expect(titleCase("HELLO_WORLD")).toBe("Hello World");
  });

  it("splits on dots and capitalizes", () => {
    expect(titleCase("process.read")).toBe("Process Read");
  });

  it("splits on hyphens and capitalizes", () => {
    expect(titleCase("some-value")).toBe("Some Value");
  });

  it("handles single word", () => {
    expect(titleCase("hello")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(titleCase("")).toBe("");
  });
});
