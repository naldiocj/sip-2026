import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { UserDataTable } from "@/components/user/user-data-table";
import type { UserListItem } from "@/lib/users-api";

const profiles = [
  {
    id: "p1",
    code: "DIRECTOR",
    name: "Director",
    label: "Director",
    is_active: true,
  },
];

const user: UserListItem = {
  id: "u1",
  username: "jose.lopes",
  full_name: "José Lopes",
  email: "jose.lopes@example.com",
  employee_number: "F-1001",
  person_id: "pe1",
  person_name: null,
  status: "ACTIVE",
  status_label: "Ativo",
  profiles: [{ id: "p1", code: "DIRECTOR", name: "Director", label: "Director" }],
  last_login_at: "2026-08-01T10:00:00Z",
  created_at: "2026-01-01T10:00:00Z",
  primary_assignment: {
    id: "a1",
    organizational_unit_id: "u-1",
    assignment_type: "PRIMARY",
    is_primary: true,
    status: "ACTIVE",
    start_date: "2026-01-01",
    end_date: null,
    unit_name: "Secção de Investigação",
    unit_path: [
      { id: "o1", name: "SIC", type: "ORGANIZATION", type_label: "Organização" },
      { id: "d1", name: "Direcção de Investigação", type: "DIRECTION", type_label: "Direcção" },
      {
        id: "s1",
        name: "Secção de Investigação",
        type: "SECTION",
        type_label: "Secção",
      },
    ],
  },
};

const noopHandlers = {
  onView: vi.fn(),
  onEdit: vi.fn(),
  onToggleStatus: vi.fn(),
  onToggleBlock: vi.fn(),
  onManageProfiles: vi.fn(),
  onSearchChange: vi.fn(),
  onStatusFilterChange: vi.fn(),
  onProfileFilterChange: vi.fn(),
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

function renderTable(overrides: Partial<Parameters<typeof UserDataTable>[0]> = {}) {
  return render(
    <UserDataTable
      items={[user]}
      total={1}
      page={1}
      pageSize={20}
      search=""
      statusFilter="all"
      profileFilter="all"
      profiles={profiles}
      permissions={{ canUpdate: true, canManageProfiles: true }}
      actions={{
        onView: noopHandlers.onView,
        onEdit: noopHandlers.onEdit,
        onToggleStatus: noopHandlers.onToggleStatus,
        onToggleBlock: noopHandlers.onToggleBlock,
        onManageProfiles: noopHandlers.onManageProfiles,
      }}
      onSearchChange={noopHandlers.onSearchChange}
      onStatusFilterChange={noopHandlers.onStatusFilterChange}
      onProfileFilterChange={noopHandlers.onProfileFilterChange}
      onPageChange={noopHandlers.onPageChange}
      onPageSizeChange={noopHandlers.onPageSizeChange}
      {...overrides}
    />,
  );
}

async function openMenu(userEventInstance: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByRole("button", { name: "Ações do utilizador" });
  trigger.focus();
  await userEventInstance.keyboard("{Enter}");
}

describe("UserDataTable", () => {
  it("renders user data with labels humanized", () => {
    renderTable();
    expect(screen.getByText("jose.lopes")).toBeInTheDocument();
    expect(screen.getByText("José Lopes")).toBeInTheDocument();
    expect(screen.getByText("jose.lopes@example.com")).toBeInTheDocument();
    expect(screen.getByText("Director")).toBeInTheDocument();
    expect(screen.getByText("Direcção de Investigação")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("shows empty state when no items", () => {
    renderTable({ items: [], total: 0 });
    expect(screen.getByText("Nenhum utilizador encontrado")).toBeInTheDocument();
  });

  it("shows pagination info and disables navigation on single page", () => {
    renderTable();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Página seguinte" })).toBeDisabled();
  });

  it("invokes search callback when typing", async () => {
    renderTable();
    const input = screen.getByRole("searchbox", { name: "Pesquisar utilizadores" });
    await userEvent.type(input, "lopes");
    expect(noopHandlers.onSearchChange).toHaveBeenCalled();
  });

  it("opens action menu with permission-based items", async () => {
    const userEventInstance = userEvent.setup();
    renderTable();
    await openMenu(userEventInstance);
    expect(screen.getByText("Ver detalhe")).toBeInTheDocument();
    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.getByText("Desactivar")).toBeInTheDocument();
    expect(screen.getByText("Bloquear")).toBeInTheDocument();
    expect(screen.getByText("Gerir perfis")).toBeInTheDocument();
  });

  it("hides restricted actions when permissions absent", async () => {
    const userEventInstance = userEvent.setup();
    renderTable({ permissions: { canUpdate: false, canManageProfiles: false } });
    await openMenu(userEventInstance);
    expect(screen.getByText("Ver detalhe")).toBeInTheDocument();
    expect(screen.queryByText("Editar")).not.toBeInTheDocument();
    expect(screen.queryByText("Desactivar")).not.toBeInTheDocument();
    expect(screen.queryByText("Bloquear")).not.toBeInTheDocument();
    expect(screen.queryByText("Gerir perfis")).not.toBeInTheDocument();
  });

  it("invokes onView when Ver detalhe is clicked", async () => {
    const userEventInstance = userEvent.setup();
    renderTable();
    await openMenu(userEventInstance);
    await userEventInstance.click(screen.getByText("Ver detalhe"));
    expect(noopHandlers.onView).toHaveBeenCalledWith(user);
  });
});