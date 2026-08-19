import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { UnitDataTable } from "@/components/organization/unit-data-table";
import { UnitDetails } from "@/components/organization/unit-details";
import type { OrganizationalUnit } from "@/lib/organization-types";

const units: OrganizationalUnit[] = [
  {
    id: "dir-1",
    organization_id: "org-1",
    parent_id: null,
    type_id: "DIRECTION",
    code: "DIR-001",
    name: "Direcção Nacional",
    short_name: "DN",
    description: "Direcção superior",
    status: "ACTIVE",
    is_active: true,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "dep-1",
    organization_id: "org-1",
    parent_id: "dir-1",
    type_id: "DEPARTMENT",
    code: "DEP-001",
    name: "Departamento Jurídico",
    short_name: "DJ",
    description: null,
    status: "INACTIVE",
    is_active: false,
    sort_order: 2,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: null,
  },
];

describe("UnitDataTable", () => {
  it("renderiza as unidades com tipo e estado humanizados", () => {
    render(
      <UnitDataTable
        units={units}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        canManage={false}
      />,
    );
    expect(screen.getByText("Direcção Nacional")).toBeTruthy();
    expect(screen.getByText("Departamento Jurídico")).toBeTruthy();
    expect(screen.getAllByText("Direcção").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ativo").length).toBeGreaterThan(0);
    expect(screen.queryByText("ACTIVE")).toBeNull();
    expect(screen.queryByText("INACTIVE")).toBeNull();
  });

  it("filtra por pesquisa global", async () => {
    const user = userEvent.setup();
    render(
      <UnitDataTable
        units={units}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        canManage={false}
      />,
    );
    const input = screen.getByPlaceholderText("Pesquisar unidades...");
    await user.type(input, "Jurídico");
    expect(screen.getByText("Departamento Jurídico")).toBeTruthy();
    expect(screen.queryByText("Direcção Nacional")).toBeNull();
  });

  it("filtra por estado", async () => {
    const user = userEvent.setup();
    render(
      <UnitDataTable
        units={units}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        canManage={false}
      />,
    );
    const statusSelect = screen.getAllByRole("combobox")[1];
    await user.click(statusSelect);
    await user.click(await screen.findByRole("option", { name: "Ativo" }));
    expect(screen.getByText("Direcção Nacional")).toBeTruthy();
    expect(screen.queryByText("Departamento Jurídico")).toBeNull();
  });

  it("seleciona unidade ao clicar na linha", async () => {
    const user = userEvent.setup();
    let selectedId: string | null = null;
    render(
      <UnitDataTable
        units={units}
        selectedUnitId={null}
        onSelectUnit={(u) => {
          selectedId = u.id;
        }}
        canManage={false}
      />,
    );
    await user.click(screen.getByText("Direcção Nacional"));
    expect(selectedId).toBe("dir-1");
  });

  it("mostra ação de edição apenas quando canManage", async () => {
    const user = userEvent.setup();
    const onEditUnit = vi.fn();
    const { unmount } = render(
      <UnitDataTable
        units={units}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        canManage={true}
        onEditUnit={onEditUnit}
      />,
    );
    const editButtons = screen.getAllByRole("button", { name: "Editar" });
    expect(editButtons).toHaveLength(2);
    await user.click(editButtons[0]);
    expect(onEditUnit).toHaveBeenCalledWith(
      expect.objectContaining({ id: "dir-1" }),
    );
    unmount();

    render(
      <UnitDataTable
        units={units}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        canManage={false}
      />,
    );
    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
  });
});

describe("UnitDetails", () => {
  it("mostra placeholder antes de selecionar unidade", () => {
    render(<UnitDetails unit={null} canManage={false} />);
    expect(
      screen.getByText("Selecione uma unidade para ver os detalhes."),
    ).toBeTruthy();
  });

  it("mostra a informação da unidade", () => {
    render(<UnitDetails unit={units[0]} canManage={false} />);
    expect(screen.getAllByText("Direcção Nacional").length).toBeGreaterThan(0);
    expect(screen.getByText("DN")).toBeTruthy();
    expect(screen.getAllByText("DIR-001").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Direcção").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ativo").length).toBeGreaterThan(0);
    expect(screen.getByText("Direcção superior")).toBeTruthy();
  });

  it("mostra as pessoas atribuídas com a respetiva função", () => {
    render(
      <UnitDetails
        unit={units[0]}
        canManage={false}
        assignments={[
          {
            id: "assign-1",
            user_id: "user-1",
            username: "joao",
            user_full_name: "João Baptista",
            organizational_unit_id: "dir-1",
            unit_name: "Direcção Nacional",
            unit_type_id: "DIRECTION",
            assignment_type: "PRIMARY",
            is_primary: true,
            start_date: "2026-01-01",
            end_date: null,
            status: "ACTIVE",
            created_at: null,
            updated_at: null,
          },
        ]}
      />,
    );
    expect(screen.getByText("Pessoas (1)")).toBeTruthy();
    expect(screen.getByText("João Baptista")).toBeTruthy();
    expect(screen.getByText("Principal")).toBeTruthy();
  });

  it("mostra botão de edição apenas quando canManage", () => {
    const onEdit = vi.fn();
    const { unmount } = render(
      <UnitDetails unit={units[0]} canManage={true} onEdit={onEdit} />,
    );
    const editButton = screen.getByRole("button", { name: "Editar" });
    expect(editButton).toBeTruthy();
    unmount();

    render(<UnitDetails unit={units[0]} canManage={false} />);
    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
  });
});