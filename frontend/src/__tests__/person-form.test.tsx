import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PersonForm } from "@/components/person/person-form";
import type { Person } from "@/lib/person-types";

const person: Person = {
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
};

describe("PersonForm", () => {
  it("valida nome obrigatório na criação", async () => {
    const user = userEvent.setup();
    render(
      <PersonForm
        open
        onClose={() => {}}
        onCreated={() => {}}
        createFn={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Criar Pessoa" }));
    expect(await screen.findByText("Nome completo é obrigatório")).toBeTruthy();
  });

  it("submete a criação com dados válidos", async () => {
    const user = userEvent.setup();
    const createFn = vi.fn().mockResolvedValue(person);
    render(
      <PersonForm
        open
        onClose={() => {}}
        onCreated={() => {}}
        createFn={createFn}
      />,
    );
    await user.type(screen.getByLabelText("Nome completo *"), "Maria da Conceição");
    await user.type(screen.getByLabelText("Email"), "maria@sip.local");
    await user.click(screen.getByRole("button", { name: "Criar Pessoa" }));
    expect(createFn).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: "Maria da Conceição",
        email: "maria@sip.local",
      }),
    );
  });

  it("valida email inválido", async () => {
    const user = userEvent.setup();
    render(
      <PersonForm
        open
        onClose={() => {}}
        onCreated={() => {}}
        createFn={vi.fn()}
      />,
    );
    await user.type(screen.getByLabelText("Nome completo *"), "João");
    await user.type(screen.getByLabelText("Email"), "email-invalido");
    await user.click(screen.getByRole("button", { name: "Criar Pessoa" }));
    expect(await screen.findByText("Email inválido")).toBeTruthy();
  });

  it("pré-preenche os dados na edição", () => {
    render(
      <PersonForm
        open
        editingPerson={person}
        onClose={() => {}}
        onCreated={() => {}}
        createFn={vi.fn()}
        updateFn={vi.fn()}
      />,
    );
    const input = screen.getByLabelText("Nome completo *") as HTMLInputElement;
    expect(input.value).toBe("João Baptista dos Santos");
    expect(screen.getByRole("button", { name: "Guardar" })).toBeTruthy();
  });
});