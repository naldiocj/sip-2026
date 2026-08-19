import { test, expect, type Page } from "@playwright/test";

// Cenários E2E administrativos (TASK-028).
// Pré-requisitos: backend a correr (porta 8000) com base de dados migrada e
// seed de desenvolvimento (scripts/seed_dev.py).

const DEV_USERS = {
  admin: { username: "admin", password: "admin123" },
  director: { username: "director", password: "director123" },
  instrutor: { username: "instrutor", password: "instrutor123" },
  pgr: { username: "pgr", password: "pgr123" },
} as const;

async function login(page: Page, user: keyof typeof DEV_USERS) {
  const { username, password } = DEV_USERS[user];
  await page.goto("/login");
  await page.getByLabel("Utilizador").fill(username);
  await page.getByLabel("Palavra-passe").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page.getByText("Dashboard")).toBeVisible();
}

test.describe("Administração (E2E)", () => {
  test("E2E-001: administrador cria pessoa, unidade e atribuição e consulta o contexto", async ({ page }) => {
    const suffix = Date.now();
    const personName = `E2E Pessoa ${suffix}`;
    const unitName = `E2E Unidade ${suffix}`;

    await login(page, "admin");

    // ── 1. Criar pessoa ──
    await page.goto("/administracao/pessoas");
    await page.getByTestId("nova-pessoa").click();
    await page.getByLabel("Nome completo *").fill(personName);
    await page.getByRole("button", { name: "Criar Pessoa" }).click();
    await page.waitForURL(/\/administracao\/pessoas\/[0-9a-f-]+$/);
    await expect(page.getByText(personName)).toBeVisible();

    // ── 2. Criar unidade ──
    await page.goto("/administracao/organizacao");
    await page.getByRole("button", { name: "Nova Unidade" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nome *").fill(unitName);
    await dialog.getByText("Seleccionar tipo").click();
    await page.getByRole("option", { name: "Secção" }).click();
    await dialog.getByRole("button", { name: "Criar Unidade" }).click();
    await page.getByRole("tab", { name: "Unidades" }).click();
    await expect(page.getByText(unitName)).toBeVisible();

    // ── 3. Criar atribuição ──
    await page.goto("/administracao/atribuicoes");
    await page.getByPlaceholder("Pesquisar por nome ou utilizador...").fill("admin");
    await page.getByText("Selecionar utilizador").click();
    await page.getByRole("option", { name: /Administrador do Sistema/ }).click();
    await page.getByText("Selecionar unidade").click();
    await page.getByRole("option", { name: unitName }).click();
    await page.getByRole("button", { name: "Criar atribuição" }).click();
    await expect(page.getByText(unitName)).toBeVisible();
    await expect(page.getByText("Ativa")).toBeVisible();

    // ── 4. Consultar contexto (estrutura) ──
    await page.goto("/administracao/organizacao");
    await page.getByText(unitName).click();
    await expect(page.getByText("Detalhes")).toBeVisible();
    await expect(page.getByText(unitName)).toBeVisible();
    await expect(page.getByText("Ativa")).toBeVisible();
  });

  test("E2E-002: director consulta a estrutura mas não altera o global", async ({ page }) => {
    await login(page, "director");

    await page.goto("/administracao/organizacao");
    await expect(page.getByText("Árvore Organizacional")).toBeVisible();
    await expect(page.getByText("Direcções")).toBeVisible();
    await expect(page.getByRole("button", { name: "Nova Unidade" })).toHaveCount(0);

    const organizations = await page.request.get("/api/v1/organizations");
    expect(organizations.status()).toBe(200);
    const orgs = (await organizations.json()) as Array<{ id: string }>;
    const orgId = orgs[0].id;

    const createUnit = await page.request.post("/api/v1/units", {
      data: {
        organization_id: orgId,
        type_id: "SECTION",
        name: `E2E Bloqueada ${Date.now()}`,
      },
    });
    expect(createUnit.status()).toBe(403);

    const users = await page.request.get("/api/v1/users");
    expect(users.status()).toBe(403);
  });

  test("E2E-003: instrutor não acede à administração", async ({ page }) => {
    await login(page, "instrutor");

    await expect(page.getByText("Administração")).toHaveCount(0);

    const organizations = await page.request.get("/api/v1/organizations");
    expect(organizations.status()).toBe(403);
    const users = await page.request.get("/api/v1/users");
    expect(users.status()).toBe(403);

    await page.goto("/administracao/organizacao");
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("E2E-004: agente PGR consulta apenas o contexto autorizado", async ({ page }) => {
    await login(page, "pgr");

    await page.goto("/pgr");
    await expect(page.getByRole("heading", { name: "PGR" })).toBeVisible();

    const persons = await page.request.get("/api/v1/persons");
    expect(persons.status()).toBe(200);

    const organizations = await page.request.get("/api/v1/organizations");
    expect(organizations.status()).toBe(403);
    const users = await page.request.get("/api/v1/users");
    expect(users.status()).toBe(403);
  });
});