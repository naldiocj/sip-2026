import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AssignmentsSection } from "@/components/management/assignments-section";
import { ResponsibilitiesSection } from "@/components/management/responsibilities-section";
import { DelegationsSection } from "@/components/management/delegations-section";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

function renderWithProviders(ui: React.ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

function jsonResponse(payload: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => payload,
  } as Response;
}

const usersPayload = {
  items: [
    {
      id: "user-1",
      username: "joao",
      full_name: "João Baptista",
      email: "joao@sip.local",
      employee_number: "F-1",
      person_id: null,
      person_name: null,
      status: "ACTIVE",
    },
    {
      id: "user-2",
      username: "maria",
      full_name: "Maria Conceição",
      email: "maria@sip.local",
      employee_number: "F-2",
      person_id: null,
      person_name: null,
      status: "ACTIVE",
    },
  ],
  total: 2,
};

const organizationsPayload = [
  { id: "org-1", code: "SIC", name: "SIC", short_name: "SIC", status: "ACTIVE", is_active: true },
];

const unitsPayload = [
  {
    id: "unit-1",
    organization_id: "org-1",
    parent_id: null,
    type_id: "SECTION",
    code: "SEC-1",
    name: "Secção de Instrução",
    short_name: "SEC-1",
    status: "ACTIVE",
    is_active: true,
    sort_order: 1,
  },
];

const assignmentsPayload = [
  {
    id: "assign-1",
    user_id: "user-1",
    organizational_unit_id: "unit-1",
    assignment_type: "PRIMARY",
    is_primary: true,
    start_date: "2026-01-01",
    end_date: null,
    status: "ACTIVE",
  },
];

function mockApiRoutes() {
  vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/assignments")) {
      return Promise.resolve(jsonResponse(assignmentsPayload));
    }
    if (url.includes("/api/v1/users")) {
      return Promise.resolve(jsonResponse(usersPayload));
    }
    if (url.includes("/api/v1/organizations")) {
      return Promise.resolve(jsonResponse(organizationsPayload));
    }
    if (url.includes("/api/v1/units?")) {
      return Promise.resolve(jsonResponse(unitsPayload));
    }
    return Promise.resolve(jsonResponse({}));
  });
}

describe("AssignmentsSection", () => {
  beforeEach(() => {
    mockApiRoutes();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mostra estado vazio antes de selecionar utilizador", () => {
    renderWithProviders(<AssignmentsSection />);
    expect(screen.getByText("Selecione um utilizador")).toBeTruthy();
  });

  it("lista atribuições do utilizador selecionado", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssignmentsSection />);

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeTruthy();
    });

    await user.click(screen.getAllByRole("combobox")[0]);
    await waitFor(() => {
      expect(screen.getByText(/João Baptista/)).toBeTruthy();
    });
    await user.click(screen.getByText(/João Baptista/));

    await waitFor(() => {
      expect(screen.getByText("Secção de Instrução")).toBeTruthy();
    });
    expect(screen.getAllByText("Principal").length).toBeGreaterThan(0);
    expect(screen.getByText("Ativa")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Terminar/ })).toBeTruthy();
  });

  it("termina atribuição após confirmação", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssignmentsSection />);

    await waitFor(() => {
      expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);
    });
    await user.click(screen.getAllByRole("combobox")[0]);
    await waitFor(() => {
      expect(screen.getByText(/João Baptista/)).toBeTruthy();
    });
    await user.click(screen.getByText(/João Baptista/));

    await waitFor(() => {
      expect(screen.getByText("Secção de Instrução")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Terminar/ }));

    await waitFor(() => {
      expect(screen.getByText("Terminar atribuição")).toBeTruthy();
    });
    await user.click(screen.getAllByRole("button", { name: "Terminar" }).at(-1)!);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Atribuição terminada com sucesso");
    });
  });
});

describe("ResponsibilitiesSection", () => {
  beforeEach(() => {
    mockApiRoutes();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mostra estado vazio quando não há responsabilidades", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/users")) {
        return Promise.resolve(jsonResponse(usersPayload));
      }
      if (url.includes("/api/v1/organizations")) {
        return Promise.resolve(jsonResponse(organizationsPayload));
      }
      if (url.includes("/api/v1/units?")) {
        return Promise.resolve(jsonResponse(unitsPayload));
      }
      if (url.includes("/api/v1/responsibilities")) {
        return Promise.resolve(jsonResponse([]));
      }
      return Promise.resolve(jsonResponse({}));
    });
    renderWithProviders(<ResponsibilitiesSection />);
    await waitFor(() => {
      expect(screen.getByText("Sem responsabilidades")).toBeTruthy();
    });
    expect(screen.getAllByText("Nova responsabilidade").length).toBeGreaterThan(0);
  });
});

describe("DelegationsSection", () => {
  beforeEach(() => {
    mockApiRoutes();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mostra estado vazio quando não há delegações", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/users")) {
        return Promise.resolve(jsonResponse(usersPayload));
      }
      if (url.includes("/api/v1/organizations")) {
        return Promise.resolve(jsonResponse(organizationsPayload));
      }
      if (url.includes("/api/v1/units?")) {
        return Promise.resolve(jsonResponse(unitsPayload));
      }
      if (url.includes("/api/v1/delegations")) {
        return Promise.resolve(jsonResponse([]));
      }
      return Promise.resolve(jsonResponse({}));
    });
    renderWithProviders(<DelegationsSection />);
    await waitFor(() => {
      expect(screen.getByText("Sem delegações")).toBeTruthy();
    });
    expect(screen.getAllByText("Nova delegação").length).toBeGreaterThan(0);
  });
});