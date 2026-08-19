import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { PersonDataTable } from "@/components/person/person-data-table";
import type { Person } from "@/lib/person-types";

const persons: Person[] = [
  {
    id: "1",
    person_number: "P-0001",
    full_name: "João Baptista dos Santos",
    preferred_name: "João",
    birth_date: "1980-01-15",
    birth_place: "Luanda",
    nationality: "Angolana",
    gender: "Masculino",
    bi_number: null,
    phone: null,
    email: "joao.santos@sip.local",
    address: null,
    employee_number: "F-1001",
    functional_category: "Técnico Superior",
    job_title: "Inspector",
    admission_date: "2010-03-01",
    employment_status: "EMPLOYED",
    professional_registration: null,
    notes: null,
    status: "ACTIVE",
    status_label: "Activo",
    is_active: true,
  },
  {
    id: "2",
    person_number: "P-0002",
    full_name: "Maria da Conceição",
    preferred_name: null,
    birth_date: null,
    birth_place: null,
    nationality: "Portuguesa",
    gender: "Feminino",
    bi_number: null,
    phone: null,
    email: "maria.conceicao@sip.local",
    address: null,
    employee_number: "F-1002",
    functional_category: "Auxiliar",
    job_title: null,
    admission_date: null,
    employment_status: "ON_LEAVE",
    professional_registration: null,
    notes: null,
    status: "INACTIVE",
    status_label: "Inactivo",
    is_active: false,
  },
];

describe("PersonDataTable", () => {
  it("renderiza as pessoas com nomes humanizados", () => {
    render(
      <PersonDataTable
        persons={persons}
        onSelectPerson={() => {}}
        canManage={false}
      />,
    );
    expect(screen.getByText("João Baptista dos Santos")).toBeTruthy();
    expect(screen.getByText("Maria da Conceição")).toBeTruthy();
    expect(screen.getByText("Activo")).toBeTruthy();
    expect(screen.getByText("Inactivo")).toBeTruthy();
    expect(screen.queryByText("ACTIVE")).toBeNull();
    expect(screen.queryByText("INACTIVE")).toBeNull();
  });

  it("filtra por pesquisa global", async () => {
    const user = userEvent.setup();
    render(
      <PersonDataTable
        persons={persons}
        onSelectPerson={() => {}}
        canManage={false}
      />,
    );
    const input = screen.getByPlaceholderText("Pesquisar pessoas...");
    await user.type(input, "Maria");
    expect(screen.getByText("Maria da Conceição")).toBeTruthy();
    expect(screen.queryByText("João Baptista dos Santos")).toBeNull();
  });

  it("filtra por estado", async () => {
    const user = userEvent.setup();
    render(
      <PersonDataTable
        persons={persons}
        onSelectPerson={() => {}}
        canManage={false}
      />,
    );
    await user.click(screen.getAllByRole("combobox")[0]);
    await user.click(await screen.findByRole("option", { name: "Activo" }));
    expect(screen.getByText("João Baptista dos Santos")).toBeTruthy();
    expect(screen.queryByText("Maria da Conceição")).toBeNull();
  });

  it("seleciona pessoa ao clicar na linha", async () => {
    const user = userEvent.setup();
    let selectedId: string | null = null;
    render(
      <PersonDataTable
        persons={persons}
        onSelectPerson={(p) => {
          selectedId = p.id;
        }}
        canManage={false}
      />,
    );
    await user.click(screen.getByText("João Baptista dos Santos"));
    expect(selectedId).toBe("1");
  });
});