import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserAssignments } from "@/components/user/user-assignments";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const assignments = [
  {
    id: "a1",
    user_id: "u1",
    organizational_unit_id: "11111111-1111-1111-1111-111111111111",
    assignment_type: "PRIMARY",
    is_primary: true,
    start_date: "2026-01-01",
    end_date: null,
    status: "ACTIVE",
  },
  {
    id: "a2",
    user_id: "u1",
    organizational_unit_id: "22222222-2222-2222-2222-222222222222",
    assignment_type: "SECONDARY",
    is_primary: false,
    start_date: "2026-03-01",
    end_date: "2026-12-31",
    status: "ACTIVE",
  },
];

let currentAssignments: Array<(typeof assignments)[number]> = [...assignments];

function mockFetch() {
  vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    if (url.includes("/assignments") && method === "GET") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(currentAssignments),
      });
    }
    if (url.includes("/assignments") && method === "POST" && url.includes("/end")) {
      currentAssignments = currentAssignments.filter((a) => a.id !== assignments[0].id);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ ...assignments[0], status: "INACTIVE" }),
      });
    }
    if (url.includes("/organizations") && method === "GET") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: "o1", name: "SIC", is_active: true }]),
      });
    }
    return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
  }) as unknown as typeof fetch);
}

beforeEach(() => {
  queryClient.clear();
  mockFetch();
});

function renderAssignments(canManage = true) {
  return render(
    <QueryClientProvider client={queryClient}>
      <UserAssignments userId="u1" canManage={canManage} />
    </QueryClientProvider>,
  );
}

describe("UserAssignments", () => {
  it("lista as atribuições com tipo, período e estado", async () => {
    renderAssignments();
    expect((await screen.findAllByText("Principal")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Secundária").length).toBeGreaterThan(0);
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();
    expect(screen.getByText("2026-03-01 → 2026-12-31")).toBeInTheDocument();
    expect(screen.getAllByText("Ativa").length).toBeGreaterThan(0);
  });

  it("termina uma atribuição após confirmação", async () => {
    const user = userEvent.setup();
    renderAssignments();
    await screen.findAllByText("Principal");
    await user.click(screen.getAllByRole("button", { name: "Terminar atribuição" })[0]);
    expect(screen.getByText(/Terminar a atribuição Principal\?/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Terminar" }));
    await waitFor(() => {
      expect(screen.queryByText("11111111")).not.toBeInTheDocument();
    });
  });

  it("não mostra acções de gestão sem permissão", async () => {
    renderAssignments(false);
    await screen.findAllByText("Principal");
    expect(screen.queryByRole("button", { name: "Terminar atribuição" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Nova atribuição/ })).not.toBeInTheDocument();
  });
});