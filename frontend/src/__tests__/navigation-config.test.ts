import { describe, it, expect } from "vitest";
import {
  findNavigationItem,
  getBreadcrumbsForRoute,
  filterNavigationByPermission,
  mainNavigation,
  managementNavigation,
} from "@/lib/navigation-config";

describe("findNavigationItem", () => {
  it("finds a top-level item by route", () => {
    const item = findNavigationItem(mainNavigation, "/processos");
    expect(item).toBeDefined();
    expect(item?.id).toBe("processos");
    expect(item?.label).toBe("Processos");
  });

  it("finds a nested item by route", () => {
    const item = findNavigationItem(mainNavigation, "/processos/novo");
    expect(item).toBeDefined();
    expect(item?.id).toBe("processos-novo");
  });

  it("returns undefined for non-existent route", () => {
    const item = findNavigationItem(mainNavigation, "/nao-existe");
    expect(item).toBeUndefined();
  });

  it("searches across all items", () => {
    const allItems = [...mainNavigation, ...managementNavigation];
    const item = findNavigationItem(allItems, "/organizacao");
    expect(item).toBeDefined();
    expect(item?.id).toBe("organizacao");
  });
});

describe("getBreadcrumbsForRoute", () => {
  it("returns Início for root", () => {
    const crumbs = getBreadcrumbsForRoute("/");
    expect(crumbs).toEqual([{ label: "Início", route: "/" }]);
  });

  it("returns Início > Processos for /processos", () => {
    const crumbs = getBreadcrumbsForRoute("/processos");
    expect(crumbs).toEqual([
      { label: "Início", route: "/" },
      { label: "Processos", route: "/processos" },
    ]);
  });

  it("returns nested breadcrumbs", () => {
    const crumbs = getBreadcrumbsForRoute("/processos/novo");
    expect(crumbs).toEqual([
      { label: "Início", route: "/" },
      { label: "Processos", route: "/processos" },
      { label: "Novo Processo", route: "/processos/novo" },
    ]);
  });

  it("capitalizes unknown segments", () => {
    const crumbs = getBreadcrumbsForRoute("/unknown-segment");
    expect(crumbs).toEqual([
      { label: "Início", route: "/" },
      { label: "Unknown-segment", route: "/unknown-segment" },
    ]);
  });
});

describe("filterNavigationByPermission", () => {
  it("returns all items when user has all permissions", () => {
    const allPerms = [
      "process.read",
      "document.read",
      "organization.read",
      "system.audit",
      "system.config",
      "piquete.read",
      "pgr.read",
      "report.read",
      "notification.read",
      "user.read",
      "template.read",
    ];
    const filtered = filterNavigationByPermission(mainNavigation, allPerms);
    expect(filtered.length).toBe(mainNavigation.length);
  });

  it("filters items based on permissions", () => {
    const filtered = filterNavigationByPermission(mainNavigation, ["process.read"]);
    const ids = filtered.map((i) => i.id);
    expect(ids).toContain("dashboard");
    expect(ids).toContain("processos");
    expect(ids).not.toContain("documentos");
    expect(ids).not.toContain("piquete");
  });

  it("always includes items without requiredPermission", () => {
    const filtered = filterNavigationByPermission(mainNavigation, []);
    expect(filtered.some((i) => i.id === "dashboard")).toBe(true);
  });

  it("filters nested children", () => {
    const filtered = filterNavigationByPermission(mainNavigation, ["process.read"]);
    const processos = filtered.find((i) => i.id === "processos");
    expect(processos?.children).toBeDefined();
    expect(processos?.children?.some((c) => c.id === "processos-novo")).toBe(false);
  });
});
