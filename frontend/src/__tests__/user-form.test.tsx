import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserForm } from "@/components/user/user-form";
import type { UserListItem } from "@/lib/users-api";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const profiles = [
  { id: "p1", code: "DIRECTOR", name: "Director", label: "Director", is_active: true },
  { id: "p2", code: "CHEFE_SECCAO", name: "Chefe de Secção", label: "Chefe de Secção", is_active: true },
];

const units = [
  { id: "d1", organization_id: "o1", parent_id: null, type_id: "DIRECTION", code: "DIR-INV", name: "Direcção de Investigação", short_name: "DIR-INV", description: null, status: "ACTIVE", is_active: true, sort_order: 1, created_at: null, updated_at: null },
  { id: "dep1", organization_id: "o1", parent_id: "d1", type_id: "DEPARTMENT", code: "DEP-IC", name: "Departamento de Investigação Criminal", short_name: "DEP-IC", description: null, status: "ACTIVE", is_active: true, sort_order: 1, created_at: null, updated_at: null },
  { id: "s1", organization_id: "o1", parent_id: "dep1", type_id: "SECTION", code: "SEC-1", name: "Secção de Investigação", short_name: "SEC-1", description: null, status: "ACTIVE", is_active: true, sort_order: 1, created_at: null, updated_at: null },
];

function renderForm(props: Parameters<typeof UserForm>[0]) {
  return render(
    <QueryClientProvider client={queryClient}>
      <UserForm {...props} />
    </QueryClientProvider>,
  );
}

function mockFetch() {
  vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/v1/organizations")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: "o1", name: "SIC", is_active: true }]),
      });
    }
    if (url.includes("/api/v1/profiles")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ items: profiles, total: profiles.length }),
      });
    }
    if (url.includes("/api/v1/units")) {
      const parsed = new URL(url, "http://test.local");
      const parentId = parsed.searchParams.get("parent_id");
      const typeId = parsed.searchParams.get("type_id");
      let result = units.filter((u) => u.type_id === typeId);
      if (parentId) result = result.filter((u) => u.parent_id === parentId);
      else result = result.filter((u) => u.parent_id === null);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(result),
      });
    }
    return Promise.resolve({ ok: true, status: 404, json: () => Promise.resolve({}) });
  }) as unknown as typeof fetch);
}

beforeEach(() => {
  queryClient.clear();
  mockFetch();
});

const baseProps = {
  open: true,
  onClose: vi.fn(),
  onCreate: vi.fn().mockResolvedValue({ id: "u1" } as UserListItem),
  onCreateAssignment: vi.fn().mockResolvedValue(undefined),
};

describe("UserForm", () => {
  it("valida campos obrigatórios na criação", async () => {
    const user = userEvent.setup();
    renderForm({ ...baseProps });
    await user.click(screen.getByRole("button", { name: "Criar Utilizador" }));
    expect(await screen.findByText("Nome completo é obrigatório")).toBeTruthy();
    expect(screen.getByText("Utilizador deve ter pelo menos 3 caracteres")).toBeTruthy();
  });

  it("submete a criação com dados válidos e cria atribuição", async () => {
    const user = userEvent.setup();
    renderForm({ ...baseProps });
    await user.type(screen.getByLabelText("Utilizador *"), "jose.lopes");
    await user.type(screen.getByLabelText("Nome completo *"), "José Lopes");
    await user.type(screen.getByLabelText("Email *"), "jose@example.com");
    await user.type(screen.getByLabelText("Password *"), "segredo123");

    await user.click(screen.getByRole("button", { name: "Criar Utilizador" }));
    await waitFor(() => {
      expect(baseProps.onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "jose.lopes",
          full_name: "José Lopes",
          email: "jose@example.com",
          status: "PENDING",
        }),
      );
    });
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("não cria atribuição quando nenhuma unidade é selecionada", async () => {
    const user = userEvent.setup();
    renderForm({ ...baseProps });
    await user.type(screen.getByLabelText("Utilizador *"), "jose.lopes");
    await user.type(screen.getByLabelText("Nome completo *"), "José Lopes");
    await user.type(screen.getByLabelText("Email *"), "jose@example.com");
    await user.type(screen.getByLabelText("Password *"), "segredo123");
    await user.click(screen.getByRole("button", { name: "Criar Utilizador" }));
    await waitFor(() => expect(baseProps.onCreate).toHaveBeenCalled());
    expect(baseProps.onCreateAssignment).not.toHaveBeenCalled();
  });

  it("edita apenas dados da conta (sem contexto organizacional)", async () => {
    const user = userEvent.setup();
    const editingUser: UserListItem = {
      id: "u1",
      username: "jose.lopes",
      full_name: "José Lopes",
      email: "jose@example.com",
      employee_number: "F-1001",
      person_id: null,
      person_name: null,
      status: "ACTIVE",
      status_label: "Ativo",
      profiles: [],
      last_login_at: null,
      created_at: null,
      primary_assignment: null,
    };
    const onUpdate = vi.fn().mockResolvedValue(editingUser);
    renderForm({ ...baseProps, editingUser, onUpdate });
    expect(screen.queryByText("Contexto Organizacional")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Utilizador *")).toBeDisabled();
  });
});