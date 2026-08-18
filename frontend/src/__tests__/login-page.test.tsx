import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "@/app/login/page";
import { AuthContext, type AuthContextType } from "@/contexts/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/login",
}));

const mockAuthValue: AuthContextType = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  isLoading: false,
};

function renderLoginPage(authOverrides: Partial<AuthContextType> = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const value = { ...mockAuthValue, ...authOverrides };
  return render(
    <QueryClientProvider client={qc}>
      <AuthContext.Provider value={value}>
        <LoginPage />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders login form", () => {
    renderLoginPage();
    expect(screen.getAllByText("SIP").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("Utilizador")).toBeTruthy();
    expect(screen.getByLabelText("Palavra-passe")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeTruthy();
  });

  it("renders project description", () => {
    renderLoginPage();
    expect(screen.getAllByText("Sistema de Instrução Processual").length).toBeGreaterThan(0);
  });

  it("submits credentials on form submit", async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderLoginPage({ login: loginMock });

    await user.type(screen.getByLabelText("Utilizador"), "admin");
    await user.type(screen.getByLabelText("Palavra-passe"), "admin123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        username: "admin",
        password: "admin123",
      });
    });
  });

  it("displays error message on login failure", async () => {
    const loginMock = vi.fn().mockRejectedValue(new Error("Credenciais inválidas"));
    const user = userEvent.setup();
    renderLoginPage({ login: loginMock });

    await user.type(screen.getByLabelText("Utilizador"), "admin");
    await user.type(screen.getByLabelText("Palavra-passe"), "admin123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByText("Credenciais inválidas")).toBeTruthy();
    });
  });

  it("shows loading state during submission", async () => {
    const loginMock = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => setTimeout(resolve, 100)),
    );
    const user = userEvent.setup();
    renderLoginPage({ login: loginMock });

    await user.type(screen.getByLabelText("Utilizador"), "admin");
    await user.type(screen.getByLabelText("Palavra-passe"), "admin123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByText("A entrar...")).toBeTruthy();
    });
  });

  it("redirects to dashboard if already authenticated", async () => {
    const { container } = renderLoginPage({ isAuthenticated: true, isLoading: false });
    expect(container.innerHTML).toBe("");
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Utilizador"), "admin");
    await user.type(screen.getByLabelText("Palavra-passe"), "12345");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByText("Palavra-passe deve ter pelo menos 6 caracteres")).toBeTruthy();
    });
  });

  it("shows validation error for empty username", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Palavra-passe"), "admin123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByText("Utilizador é obrigatório")).toBeTruthy();
    });
  });
});
