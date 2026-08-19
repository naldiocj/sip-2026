import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { OrganizationTree } from "@/components/organization/organization-tree";
import { MoveUnitDialog } from "@/components/organization/move-unit-dialog";
import type { UnitTreeNode, OrganizationalUnit } from "@/lib/organization-types";

const tree: UnitTreeNode[] = [
  {
    id: "dir-1",
    organization_id: "org-1",
    parent_id: null,
    type_id: "DIRECTION",
    code: "DIR-001",
    name: "Direcção Nacional",
    short_name: null,
    status: "ACTIVE",
    is_active: true,
    sort_order: 1,
    children_count: 2,
    children: [
      {
        id: "dep-1",
        organization_id: "org-1",
        parent_id: "dir-1",
        type_id: "DEPARTMENT",
        code: "DEP-001",
        name: "Departamento Jurídico",
        short_name: null,
        status: "ACTIVE",
        is_active: true,
        sort_order: 1,
        children_count: 1,
        children: [
          {
            id: "sec-1",
            organization_id: "org-1",
            parent_id: "dep-1",
            type_id: "SECTION",
            code: "SEC-001",
            name: "Secção de Contencioso",
            short_name: null,
            status: "ACTIVE",
            is_active: true,
            sort_order: 1,
            children_count: 0,
            children: [],
          },
        ],
      },
      {
        id: "dep-2",
        organization_id: "org-1",
        parent_id: "dir-1",
        type_id: "DEPARTMENT",
        code: "DEP-002",
        name: "Departamento de Inspecção",
        short_name: null,
        status: "ACTIVE",
        is_active: true,
        sort_order: 2,
        children_count: 0,
        children: [],
      },
    ],
  },
  {
    id: "unit-1",
    organization_id: "org-1",
    parent_id: null,
    type_id: "UNIT",
    code: "UNT-001",
    name: "Unidade Autónoma",
    short_name: null,
    status: "INACTIVE",
    is_active: false,
    sort_order: 2,
    children_count: 0,
    children: [],
  },
];

const units: OrganizationalUnit[] = [
  {
    id: "dir-1",
    organization_id: "org-1",
    parent_id: null,
    type_id: "DIRECTION",
    code: "DIR-001",
    name: "Direcção Nacional",
    short_name: null,
    description: null,
    status: "ACTIVE",
    is_active: true,
    sort_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    id: "dep-1",
    organization_id: "org-1",
    parent_id: "dir-1",
    type_id: "DEPARTMENT",
    code: "DEP-001",
    name: "Departamento Jurídico",
    short_name: null,
    description: null,
    status: "ACTIVE",
    is_active: true,
    sort_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    id: "unit-1",
    organization_id: "org-1",
    parent_id: null,
    type_id: "UNIT",
    code: "UNT-001",
    name: "Unidade Autónoma",
    short_name: null,
    description: null,
    status: "INACTIVE",
    is_active: false,
    sort_order: 2,
    created_at: null,
    updated_at: null,
  },
];

describe("OrganizationTree", () => {
  it("renderiza os nós e conta as unidades", () => {
    render(
      <OrganizationTree
        tree={tree}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        canManage={false}
      />,
    );
    expect(screen.getByText("Direcção Nacional")).toBeTruthy();
    expect(screen.getByText("Unidade Autónoma")).toBeTruthy();
    expect(screen.getByText("5 unidades")).toBeTruthy();
  });

  it("expande e recolhe subunidades", async () => {
    const user = userEvent.setup();
    render(
      <OrganizationTree
        tree={tree}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        canManage={false}
      />,
    );
    expect(screen.getByText("Departamento Jurídico")).toBeTruthy();

    const collapseButtons = screen.getAllByRole("button", { name: "Recolher" });
    await user.click(collapseButtons[0]);
    expect(screen.queryByText("Departamento Jurídico")).toBeNull();

    const expandButton = screen.getByRole("button", { name: "Expandir" });
    await user.click(expandButton);
    expect(screen.getByText("Departamento Jurídico")).toBeTruthy();
  });

  it("seleciona a unidade ao clicar", async () => {
    const user = userEvent.setup();
    let selectedId: string | null = null;
    render(
      <OrganizationTree
        tree={tree}
        selectedUnitId={null}
        onSelectUnit={(unit) => {
          selectedId = unit.id;
        }}
        canManage={false}
      />,
    );
    await user.click(screen.getByText("Secção de Contencioso"));
    expect(selectedId).toBe("sec-1");
  });

  it("não mostra acções de gestão quando canManage é false", () => {
    render(
      <OrganizationTree
        tree={tree}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        canManage={false}
      />,
    );
    expect(screen.queryByRole("button", { name: "Ações" })).toBeNull();
  });

  it("mostra acções de gestão quando canManage é true", async () => {
    const user = userEvent.setup();
    const onEditUnit = vi.fn();
    const onAddChild = vi.fn();
    const onMoveUnit = vi.fn();
    const onDeactivateUnit = vi.fn();
    render(
      <OrganizationTree
        tree={tree}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        onEditUnit={onEditUnit}
        onAddChild={onAddChild}
        onMoveUnit={onMoveUnit}
        onDeactivateUnit={onDeactivateUnit}
        canManage={true}
      />,
    );
    const node = screen.getByText("Departamento Jurídico");
    const row = node.closest(".group");
    expect(row).not.toBeNull();

    await user.click(within(row as HTMLElement).getByRole("button", { name: "Ações" }));
    await user.click(await screen.findByRole("menuitem", { name: /Editar/ }));
    expect(onEditUnit).toHaveBeenCalledWith(
      expect.objectContaining({ id: "dep-1" }),
    );

    await user.click(within(row as HTMLElement).getByRole("button", { name: "Ações" }));
    await user.click(await screen.findByRole("menuitem", { name: /Adicionar sub-unidade/ }));
    expect(onAddChild).toHaveBeenCalledWith("dep-1");

    await user.click(within(row as HTMLElement).getByRole("button", { name: "Ações" }));
    await user.click(await screen.findByRole("menuitem", { name: /Mover/ }));
    expect(onMoveUnit).toHaveBeenCalledWith(
      expect.objectContaining({ id: "dep-1" }),
    );

    await user.click(within(row as HTMLElement).getByRole("button", { name: "Ações" }));
    await user.click(await screen.findByRole("menuitem", { name: /Desativar/ }));
    expect(onDeactivateUnit).toHaveBeenCalledWith(
      expect.objectContaining({ id: "dep-1" }),
    );
  });

  it("desativa o item Desativar para unidades inativas", async () => {
    const user = userEvent.setup();
    const onDeactivateUnit = vi.fn();
    render(
      <OrganizationTree
        tree={tree}
        selectedUnitId={null}
        onSelectUnit={() => {}}
        onDeactivateUnit={onDeactivateUnit}
        canManage={true}
      />,
    );
    const node = screen.getByText("Unidade Autónoma");
    const row = node.closest(".group");
    expect(row).not.toBeNull();

    await user.click(within(row as HTMLElement).getByRole("button", { name: "Ações" }));
    const item = await screen.findByRole("menuitem", { name: /Desativar/ });
    expect(item).toHaveAttribute("aria-disabled", "true");
  });
});

describe("MoveUnitDialog", () => {
  it("exclui a unidade e os descendentes das opções de destino", async () => {
    const user = userEvent.setup();
    const onMoved = vi.fn();
    render(
      <MoveUnitDialog
        unit={tree[0].children[0]}
        units={units}
        onClose={() => {}}
        onMoved={onMoved}
      />,
    );
    expect(screen.getByText("Departamento Jurídico")).toBeTruthy();
    expect(screen.getByText("Mover Unidade")).toBeTruthy();

    await user.click(screen.getByRole("combobox"));
    const options = await screen.findAllByRole("option");
    const labels = options.map((o) => o.textContent);
    expect(labels).toContain("Direcção Nacional");
    expect(labels).not.toContain("Secção de Contencioso");
    expect(labels).not.toContain("Departamento Jurídico");
  });

  it("move a unidade para o novo pai", async () => {
    const user = userEvent.setup();
    const onMoved = vi.fn().mockResolvedValue(undefined);
    render(
      <MoveUnitDialog
        unit={tree[0].children[0]}
        units={units}
        onClose={() => {}}
        onMoved={onMoved}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Direcção Nacional" }));
    await user.click(screen.getByRole("button", { name: /Mover$/ }));
    expect(onMoved).toHaveBeenCalledWith("dep-1", "dir-1");
  });

  it("permite mover para o nível superior", async () => {
    const user = userEvent.setup();
    const onMoved = vi.fn().mockResolvedValue(undefined);
    render(
      <MoveUnitDialog
        unit={tree[0].children[0]}
        units={units}
        onClose={() => {}}
        onMoved={onMoved}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: /Nenhuma \(nível superior\)/ }),
    );
    await user.click(screen.getByRole("button", { name: /Mover$/ }));
    expect(onMoved).toHaveBeenCalledWith("dep-1", null);
  });
});