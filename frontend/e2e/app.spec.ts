import { test, expect } from "@playwright/test";

test.describe("SIP Application", () => {
  test("homepage loads with dashboard heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Dashboard")).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("SIP")).toBeVisible();
    await expect(page.getByText("Sistema de Instrução Processual")).toBeVisible();
  });

  test("placeholder pages load", async ({ page }) => {
    for (const path of ["/search", "/documents", "/security", "/settings"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    }
  });
});

test.describe("Authentication", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("SIP")).toBeVisible();
    await expect(page.getByText("Sistema de Instrução Processual")).toBeVisible();
    await expect(page.getByLabel("Utilizador")).toBeVisible();
    await expect(page.getByLabel("Palavra-passe")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*login|.*\/$/);
  });
});
