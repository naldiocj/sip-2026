import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppSidebar } from "@/components/layout/sidebar";
import { AuthContext, type AuthContextType } from "@/contexts/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const mockUser: AuthContextType["user"] = {
  id: "1",
  username: "admin",
  email: "admin@sip.local",
  full_name: "Administrador Teste",
  employee_number: null,
  status: "ACTIVE",
  status_label: "Ativo",
  profiles: [{ id: "1", code: "ADMINISTRADOR_SISTEMA", name: "Admin", label: "Administrador do Sistema" }],
  permissions: ["system.admin", "system.config", "system.audit", "process.read", "document.read"],
  organization_scope: [],
};

function renderSidebar(authOverrides: Partial<AuthContextType> = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const value: AuthContextType = {
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
    ...authOverrides,
  };
  return render(
    <QueryClientProvider client={qc}>
      <AuthContext.Provider value={value}>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("AppSidebar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders sidebar header", () => {
    renderSidebar({ user: mockUser, isAuthenticated: true });
    expect(screen.getByText("SIP")).toBeTruthy();
    expect(screen.getByText("Sistema de Instrução Processual")).toBeTruthy();
  });

  it("shows all navigation items for admin with full permissions", () => {
    renderSidebar({ user: mockUser, isAuthenticated: true });
    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Pesquisa")).toBeTruthy();
    expect(screen.getByText("Documentos")).toBeTruthy();
    expect(screen.getByText("Segurança")).toBeTruthy();
    expect(screen.getByText("Definições")).toBeTruthy();
  });

  it("filters navigation items based on permissions", () => {
    const restrictedUser: AuthContextType["user"] = {
      ...mockUser!,
      permissions: ["process.read"],
    };
    renderSidebar({ user: restrictedUser, isAuthenticated: true });
    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Pesquisa")).toBeTruthy();
    expect(screen.queryByText("Segurança")).toBeNull();
    expect(screen.queryByText("Definições")).toBeNull();
  });

  it("shows user name in sidebar footer", () => {
    renderSidebar({ user: mockUser, isAuthenticated: true });
    expect(screen.getByText("Administrador Teste")).toBeTruthy();
  });

  it("shows humanized profile name", () => {
    renderSidebar({ user: mockUser, isAuthenticated: true });
    expect(screen.getByText("Administrador do Sistema")).toBeTruthy();
  });

  it("does not render footer when not authenticated", () => {
    renderSidebar({ user: null, isAuthenticated: false });
    expect(screen.queryByText("Administrador Teste")).toBeNull();
  });
});
