"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

const segmentLabels: Record<string, string> = {
  search: "Pesquisa",
  documents: "Documentos",
  security: "Segurança",
  settings: "Definições",
  processos: "Processos",
  ocorrencias: "Ocorrências",
  mandados: "Mandados",
  despachos: "Despachos",
  detidos: "Detidos",
  piquete: "Piquete",
  pgr: "PGR",
  relatorios: "Relatórios",
  notificacoes: "Notificações",
  organizacao: "Organização",
  utilizadores: "Utilizadores",
  auditoria: "Auditoria",
  templates: "Templates",
  definicoes: "Definições",
  novo: "Novo",
  estrutura: "Estrutura",
  unidades: "Unidades",
  pessoas: "Pessoas",
  atribuicoes: "Atribuições",
  historico: "Histórico",
};

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Início</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const label = segmentLabels[segment] || segment;
          const isLast = index === segments.length - 1;
          return (
            <BreadcrumbItem key={href}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
