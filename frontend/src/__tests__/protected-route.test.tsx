import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthContext, type AuthContextType } from "@/contexts/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
}));

function renderWithAuth(
  ui: React.ReactNode,
  authOverrides: Partial<AuthContextType> = {},
) {
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
        {ui}
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when authenticated", () => {
    renderWithAuth(
      <ProtectedRoute>
        <div data-testid="content">Protected Content</div>
      </ProtectedRoute>,
      { isAuthenticated: true, isLoading: false },
    );
    expect(screen.getByTestId("content")).toBeTruthy();
  });

  it("redirects to login when not authenticated", async () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { isAuthenticated: false, isLoading: false },
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows loading skeleton while loading", () => {
    const { container } = renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { isLoading: true },
    );
    expect(screen.queryByText("Protected Content")).toBeNull();
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("does not render children before auth is resolved", () => {
    renderWithAuth(
      <ProtectedRoute>
        <div data-testid="content">Protected Content</div>
      </ProtectedRoute>,
      { isLoading: true },
    );
    expect(screen.queryByTestId("content")).toBeNull();
  });
});
