import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserSecurity } from "@/components/user/user-security";
import type { UserListItem } from "@/lib/users-api";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const activeUser: UserListItem = {
  id: "u1",
  username: "jose.lopes",
  full_name: "José Lopes",
  email: "jose.lopes@example.com",
  employee_number: "F-1001",
  person_id: null,
  person_name: null,
  status: "ACTIVE",
  status_label: "Ativo",
  profiles: [],
  last_login_at: null,
  created_at: "2026-01-01T10:00:00Z",
  primary_assignment: null,
};

function mockFetch() {
  vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    if (url.includes("/activate")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ ...activeUser, status: "ACTIVE", status_label: "Ativo" }),
      });
    }
    if (url.includes("/deactivate")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ ...activeUser, status: "INACTIVE", status_label: "Inativo" }),
      });
    }
    if (url.includes("/block")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ ...activeUser, status: "BLOCKED", status_label: "Bloqueado" }),
      });
    }
    if (url.includes("/unblock")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ ...activeUser, status: "ACTIVE", status_label: "Ativo" }),
      });
    }
    return Promise.resolve({ ok: true, status: 404, json: () => Promise.resolve({}) });
  }) as unknown as typeof fetch);
}

beforeEach(() => {
  queryClient.clear();
  mockFetch();
});

function renderSecurity(user: UserListItem, canUpdate = true, onChanged = vi.fn()) {
  return {
    onChanged,
    ...render(
      <QueryClientProvider client={queryClient}>
        <UserSecurity user={user} canUpdate={canUpdate} onChanged={onChanged} />
      </QueryClientProvider>,
    ),
  };
}

describe("UserSecurity", () => {
  it("mostra acções de desactivar e bloquear para conta activa", () => {
    renderSecurity(activeUser);
    expect(screen.getByRole("button", { name: "Desactivar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bloquear" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Activar" })).not.toBeInTheDocument();
  });

  it("desactiva a conta após confirmação", async () => {
    const userEventInstance = userEvent.setup();
    const { onChanged } = renderSecurity(activeUser);
    await userEventInstance.click(screen.getByRole("button", { name: "Desactivar" }));
    expect(screen.getByText(/Desactivar a conta «jose.lopes»\?/)).toBeInTheDocument();
    await userEventInstance.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalledWith(
        expect.objectContaining({ status: "INACTIVE" }),
      );
    });
  });

  it("mostra Activar quando a conta não está activa", () => {
    renderSecurity({ ...activeUser, status: "INACTIVE", status_label: "Inativo" });
    expect(screen.getByRole("button", { name: "Activar" })).toBeInTheDocument();
  });

  it("bloqueia a conta após confirmação", async () => {
    const userEventInstance = userEvent.setup();
    const { onChanged } = renderSecurity(activeUser);
    await userEventInstance.click(screen.getByRole("button", { name: "Bloquear" }));
    await userEventInstance.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalledWith(
        expect.objectContaining({ status: "BLOCKED" }),
      );
    });
  });

  it("não mostra acções sem permissão de actualização", () => {
    renderSecurity(activeUser, false);
    expect(screen.queryByRole("button", { name: "Desactivar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bloquear" })).not.toBeInTheDocument();
  });
});