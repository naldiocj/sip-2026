import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "@/app/page";
import { AuthContext } from "@/contexts/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("@/components/health/health-status", () => ({
  HealthStatus: () => <div data-testid="health-status">loading</div>,
}));

const mockAuthValue = {
  user: {
    id: "1",
    username: "admin",
    email: "admin@sip.local",
    full_name: "Administrador",
    employee_number: null,
    status: "ACTIVE",
    status_label: "Ativo",
    profiles: [
      { id: "1", code: "ADMINISTRADOR_SISTEMA", name: "Admin", label: "Administrador do Sistema" },
    ],
    permissions: ["system.admin"],
    organization_scope: [],
  },
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
  isLoading: false,
};

function renderWithProviders(ui: React.ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <AuthContext.Provider value={mockAuthValue}>{ui}</AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("Home page", () => {
  it("renders dashboard heading", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  it("shows welcome message with user name", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Bem-vindo, Administrador")).toBeTruthy();
  });
});
