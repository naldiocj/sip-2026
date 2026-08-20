import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { UserDetail } from "@/components/user/user-detail";
import type { UserListItem } from "@/lib/users-api";

const user: UserListItem = {
  id: "u1",
  username: "jose.lopes",
  full_name: "José Lopes",
  email: "jose.lopes@example.com",
  employee_number: "F-1001",
  person_id: null,
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
      { id: "s1", name: "Secção de Investigação", type: "SECTION", type_label: "Secção" },
    ],
  },
};

const userWithoutAssignment: UserListItem = { ...user, id: "u2", username: "sem.lotacao", primary_assignment: null };

function renderDetail(overrides: Partial<Parameters<typeof UserDetail>[0]> = {}) {
  return render(
    <UserDetail
      user={user}
      canUpdate
      canManageProfiles
      canAssign
      onUserChanged={vi.fn()}
      auditEvents={[
        {
          id: "e1",
          event_type: "LOGIN_SUCCESS",
          timestamp: "2026-08-01T10:00:00Z",
          details: { ip_address: "127.0.0.1" },
        },
      ]}
      auditLoading={false}
      auditError={false}
      onAuditRetry={vi.fn()}
      {...overrides}
    />,
  );
}

describe("UserDetail", () => {
  it("renders summary with account data and organizational path", () => {
    renderDetail();
    expect(screen.getAllByText("jose.lopes").length).toBeGreaterThan(0);
    expect(screen.getByText("Direcção de Investigação")).toBeInTheDocument();
    expect(screen.getByText("Principal")).toBeInTheDocument();
  });

  it("shows clear indicator when no assignment exists", () => {
    renderDetail({ user: userWithoutAssignment });
    expect(screen.getByText("Sem atribuição organizacional")).toBeInTheDocument();
  });

  it("renders all tabs", async () => {
    const userEventInstance = userEvent.setup();
    renderDetail();
    for (const tab of ["Resumo", "Perfil", "Atribuições", "Segurança", "Actividade", "Auditoria"]) {
      expect(screen.getByRole("tab", { name: new RegExp(tab) })).toBeInTheDocument();
    }
    await userEventInstance.click(screen.getByRole("tab", { name: /Auditoria/ }));
    expect(screen.getByText("Login Success")).toBeInTheDocument();
  });

  it("shows audit empty state", async () => {
    const userEventInstance = userEvent.setup();
    renderDetail({ auditEvents: [] });
    await userEventInstance.click(screen.getByRole("tab", { name: /Auditoria/ }));
    expect(screen.getByText("Sem eventos de auditoria")).toBeInTheDocument();
  });
});