import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SubstitutionsSection } from "@/components/management/substitutions-section";

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

const substitutionsPayload = [
  {
    id: "sub-1",
    substituted_user_id: "user-aaaa-1",
    substitute_user_id: "user-bbbb-2",
    organizational_unit_id: "unit-1",
    functional_role: "INSTRUTOR",
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    reason: "Licença",
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: "sub-2",
    substituted_user_id: "user-cccc-3",
    substitute_user_id: "user-dddd-4",
    organizational_unit_id: null,
    functional_role: null,
    start_date: "2026-01-01",
    end_date: "2026-01-15",
    reason: null,
    status: "ENDED",
    is_active: false,
  },
];

function mockApiRoutes() {
  vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/v1/substitutions")) {
      return Promise.resolve(jsonResponse(substitutionsPayload));
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

describe("SubstitutionsSection", () => {
  beforeEach(() => {
    mockApiRoutes();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lista substituições com estado humanizado", async () => {
    renderWithProviders(<SubstitutionsSection />);
    await waitFor(() => {
      expect(screen.getByText("Secção de Instrução")).toBeTruthy();
    });
    expect(screen.getByText("Ativa")).toBeTruthy();
    expect(screen.getByText("Terminada")).toBeTruthy();
    expect(screen.getByText("INSTRUTOR")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Terminar substituição" })).toHaveLength(1);
  });

  it("termina substituição após confirmação", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SubstitutionsSection />);
    await waitFor(() => {
      expect(screen.getByText("Secção de Instrução")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: "Terminar substituição" }));
    await waitFor(() => {
      expect(screen.getByText("Terminar substituição")).toBeTruthy();
    });
    await user.click(screen.getAllByRole("button", { name: "Terminar" }).at(-1)!);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Substituição terminada com sucesso");
    });
  });

  it("valida campos obrigatórios no formulário de criação", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SubstitutionsSection />);
    await user.click(screen.getByTestId("nova-substituicao"));
    await waitFor(() => {
      expect(screen.getAllByText("Nova substituição").length).toBeGreaterThan(1);
    });
    await user.click(screen.getByRole("button", { name: "Criar substituição" }));
    await waitFor(() => {
      expect(screen.getByText("Selecione o utilizador substituído.")).toBeTruthy();
    });
  });
});