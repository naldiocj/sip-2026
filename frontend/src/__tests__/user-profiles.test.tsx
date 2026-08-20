import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProfiles } from "@/components/user/user-profiles";
import type { UserListItem } from "@/lib/users-api";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const profiles = [
  { id: "p1", code: "DIRECTOR", name: "Director", label: "Director", is_active: true },
  { id: "p2", code: "CHEFE_SECCAO", name: "Chefe de Secção", label: "Chefe de Secção", is_active: true },
];

const user: UserListItem = {
  id: "u1",
  username: "jose.lopes",
  full_name: "José Lopes",
  email: "jose.lopes@example.com",
  employee_number: null,
  person_id: null,
  person_name: null,
  status: "ACTIVE",
  status_label: "Ativo",
  profiles: [{ id: "p1", code: "DIRECTOR", name: "Director", label: "Director" }],
  last_login_at: null,
  created_at: "2026-01-01T10:00:00Z",
  primary_assignment: null,
};

function mockFetch() {
  vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    if (url.includes("/api/v1/profiles") && method === "GET") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ items: profiles, total: profiles.length }),
      });
    }
    if (url.includes("/profiles") && method === "POST") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            ...user,
            profiles: [
              { id: "p1", code: "DIRECTOR", name: "Director", label: "Director" },
              { id: "p2", code: "CHEFE_SECCAO", name: "Chefe de Secção", label: "Chefe de Secção" },
            ],
          }),
      });
    }
    if (url.includes("/profiles") && method === "DELETE") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ...user, profiles: [] }),
      });
    }
    return Promise.resolve({ ok: true, status: 404, json: () => Promise.resolve({}) });
  }) as unknown as typeof fetch);
}

beforeEach(() => {
  queryClient.clear();
  mockFetch();
});

function renderProfiles(canManage = true, onChanged = vi.fn()) {
  return {
    onChanged,
    ...render(
      <QueryClientProvider client={queryClient}>
        <UserProfiles user={user} canManage={canManage} onChanged={onChanged} />
      </QueryClientProvider>,
    ),
  };
}

describe("UserProfiles", () => {
  it("lista os perfis atribuídos", async () => {
    renderProfiles();
    expect(await screen.findByText("Director")).toBeInTheDocument();
    expect(screen.getByText("DIRECTOR")).toBeInTheDocument();
  });

  it("atribui um novo perfil", async () => {
    const userEventInstance = userEvent.setup();
    const { onChanged } = renderProfiles();
    await screen.findByText("Selecionar perfil para atribuir");
    await userEventInstance.click(screen.getAllByRole("combobox")[0]);
    await userEventInstance.click(
      await screen.findByRole("option", { name: "Chefe de Secção" }),
    );
    await userEventInstance.click(screen.getByRole("button", { name: "Atribuir" }));
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalledWith(
        expect.objectContaining({ profiles: expect.arrayContaining([expect.objectContaining({ code: "CHEFE_SECCAO" })]) }),
      );
    });
  });

  it("remove um perfil após confirmação", async () => {
    const userEventInstance = userEvent.setup();
    const { onChanged } = renderProfiles();
    await userEventInstance.click(
      await screen.findByRole("button", { name: "Remover perfil Director" }),
    );
    await userEventInstance.click(screen.getByRole("button", { name: "Remover" }));
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalledWith(
        expect.objectContaining({ profiles: [] }),
      );
    });
  });

  it("não mostra acções de gestão sem permissão", async () => {
    renderProfiles(false);
    await screen.findByText("Director");
    expect(screen.queryByRole("button", { name: "Remover perfil Director" })).not.toBeInTheDocument();
    expect(screen.queryByText("Selecionar perfil para atribuir")).not.toBeInTheDocument();
  });
});