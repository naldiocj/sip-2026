import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { PersonDetail } from "@/components/person/person-detail";
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
  bi_number: "BI-123",
  phone: "+244 923 000 000",
  email: "joao.santos@sip.local",
  address: "Luanda, Angola",
  employee_number: "F-1001",
  functional_category: "Técnico Superior",
  job_title: "Inspector",
  admission_date: "2010-03-01",
  employment_status: "EMPLOYED",
  professional_registration: "REG-001",
  notes: null,
  status: "ACTIVE",
  status_label: "Activo",
  is_active: true,
};

describe("PersonDetail", () => {
  it("mostra os dados pessoais e funcionais", async () => {
    const user = userEvent.setup();
    render(<PersonDetail person={person} canUpdate={false} />);
    expect(screen.getAllByText("João Baptista dos Santos").length).toBeGreaterThan(0);
    expect(screen.getByText("joao.santos@sip.local")).toBeTruthy();
    expect(screen.getByText("Activo")).toBeTruthy();
    await user.click(screen.getByRole("tab", { name: /Dados Funcionais/ }));
    expect(screen.getByText("Técnico Superior")).toBeTruthy();
    expect(screen.getByText("Empregado")).toBeTruthy();
  });

  it("mostra todas as tabs do perfil", () => {
    render(<PersonDetail person={person} canUpdate={false} />);
    expect(screen.getByRole("tab", { name: /Dados Pessoais/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Dados Funcionais/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Conta SIP/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Perfis/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Lotação/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Atribuições/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Responsabilidades/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Delegações/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Histórico/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Auditoria/ })).toBeTruthy();
  });

  it("muda de tab ao clicar", async () => {
    const user = userEvent.setup();
    render(<PersonDetail person={person} canUpdate={false} />);
    await user.click(screen.getByRole("tab", { name: /Dados Funcionais/ }));
    expect(screen.getByText("Nº de funcionário")).toBeTruthy();
  });
});