import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthStatus } from "@/components/health/health-status";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function renderWithProviders(ui: React.ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("HealthStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading initially", async () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
    const { container } = renderWithProviders(<HealthStatus />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("shows error state when fetch fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("fail"));
    renderWithProviders(<HealthStatus />);
    await waitFor(() => {
      expect(screen.getByText(/indisponível/)).toBeTruthy();
    });
  });

  it("shows health data on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ok",
        service: "sip-backend",
        version: "0.1.0",
        environment: "development",
        timestamp: "2026-01-01T00:00:00Z",
        checks: {},
      }),
    } as Response);
    renderWithProviders(<HealthStatus />);
    await waitFor(() => {
      expect(screen.getByText("Operacional")).toBeTruthy();
      expect(screen.getByText("sip-backend")).toBeTruthy();
    });
  });
});
