import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: null, isLoading: true, error: null }),
}));

vi.mock("@/components/health/health-status", () => ({
  HealthStatus: () => <div data-testid="health-status">loading</div>,
}));

describe("Home page", () => {
  it("renders dashboard heading", () => {
    render(<Home />);
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });
});
