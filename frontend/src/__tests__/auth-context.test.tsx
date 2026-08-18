import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthContext, type AuthContextType } from "@/contexts/auth-context";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

function renderAuthProvider(ui: React.ReactNode) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("provides auth context to children", () => {
    let authValue: AuthContextType | undefined;
    renderAuthProvider(
      <AuthContext.Consumer>
        {(value) => {
          authValue = value;
          return null;
        }}
      </AuthContext.Consumer>,
    );
    expect(authValue).toBeDefined();
    expect(authValue!.isAuthenticated).toBe(false);
    expect(authValue!.isLoading).toBe(true);
  });

  it("shows loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
    renderAuthProvider(<div data-testid="child">Content</div>);
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("calls /api/v1/auth/me on mount", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("Not authenticated"));

    renderAuthProvider(
      <AuthContext.Consumer>
        {(value) => (
          <div>
            <span data-testid="loading">{value?.isLoading ? "loading" : "done"}</span>
            <span data-testid="authenticated">{value?.isAuthenticated ? "yes" : "no"}</span>
          </div>
        )}
      </AuthContext.Consumer>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("done");
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/me"),
      expect.anything(),
    );
    expect(screen.getByTestId("authenticated").textContent).toBe("no");
  });
});
