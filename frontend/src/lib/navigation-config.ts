import {
  LayoutDashboard,
  Search,
  FileText,
  Building2,
  Shield,
  Settings,
  FolderOpen,
  ClipboardList,
  AlertTriangle,
  Users,
  Bell,
  BarChart3,
  BookOpen,
  Gavel,
  MapPin,
  UserCheck,
  Landmark,
  UserPlus,
  CalendarClock,
} from "lucide-react";
import type { NavigationItem, NavigationGroup } from "@/types/navigation";

export const mainNavigation: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/",
    icon: LayoutDashboard,
    description: "Painel de controlo",
  },
  {
    id: "processos",
    label: "Processos",
    route: "/processos",
    icon: FolderOpen,
    description: "Gestão de processos instrutórios",
    requiredPermission: "process.read",
    children: [
      {
        id: "processos-listar",
        label: "Todos os Processos",
        route: "/processos",
        icon: FolderOpen,
        requiredPermission: "process.read",
      },
      {
        id: "processos-novo",
        label: "Novo Processo",
        route: "/processos/novo",
        icon: FolderOpen,
        requiredPermission: "process.create",
      },
    ],
  },
  {
    id: "ocorrencias",
    label: "Ocorrências",
    route: "/ocorrencias",
    icon: AlertTriangle,
    description: "Registo e acompanhamento de ocorrências",
    requiredPermission: "process.read",
  },
  {
    id: "documentos",
    label: "Documentos",
    route: "/documentos",
    icon: FileText,
    description: "Motor documental e gestão de peças",
    requiredPermission: "document.read",
  },
  {
    id: "mandados",
    label: "Mandados",
    route: "/mandados",
    icon: Gavel,
    description: "Emissão e acompanhamento de mandados",
    requiredPermission: "process.read",
  },
  {
    id: "despachos",
    label: "Despachos",
    route: "/despachos",
    icon: ClipboardList,
    description: "Gestão de despachos e prazos",
    requiredPermission: "process.read",
  },
  {
    id: "detidos",
    label: "Detidos",
    route: "/detidos",
    icon: UserCheck,
    description: "Registo e movimentação de detidos",
    requiredPermission: "process.read",
  },
  {
    id: "piquete",
    label: "Piquete",
    route: "/piquete",
    icon: MapPin,
    description: "Gestão de piquete e operações",
    requiredPermission: "piquete.read",
  },
  {
    id: "pgr",
    label: "PGR",
    route: "/pgr",
    icon: Shield,
    description: "Procuradoria Geral da República",
    requiredPermission: "pgr.read",
  },
  {
    id: "relatorios",
    label: "Relatórios",
    route: "/relatorios",
    icon: BarChart3,
    description: "Relatórios e estatísticas",
    requiredPermission: "report.read",
  },
  {
    id: "notificacoes",
    label: "Notificações",
    route: "/notificacoes",
    icon: Bell,
    description: "Centro de notificações",
    requiredPermission: "notification.read",
  },
];

export const managementNavigation: NavigationItem[] = [
  {
    id: "administracao",
    label: "Administração",
    route: "/administracao",
    icon: Building2,
    description: "Gestão administrativa do SIP",
    requiredPermission: "organization.read",
    children: [
      {
        id: "administracao-pessoas",
        label: "Pessoas",
        route: "/administracao/pessoas",
        icon: UserPlus,
        requiredPermission: "person.read",
      },
      {
        id: "administracao-organizacao",
        label: "Organização",
        route: "/administracao/organizacao",
        icon: Landmark,
        requiredPermission: "organization.read",
      },
      {
        id: "administracao-atribuicoes",
        label: "Atribuições",
        route: "/administracao/atribuicoes",
        icon: CalendarClock,
        requiredPermission: "assignment.read",
      },
      {
        id: "administracao-responsabilidades",
        label: "Responsabilidades",
        route: "/administracao/responsabilidades",
        icon: Shield,
        requiredPermission: "responsibility.read",
      },
      {
        id: "administracao-delegacoes",
        label: "Delegações",
        route: "/administracao/delegacoes",
        icon: UserCheck,
        requiredPermission: "delegation.read",
      },
      {
        id: "administracao-utilizadores",
        label: "Utilizadores",
        route: "/administracao/utilizadores",
        icon: Users,
        requiredPermission: "user.read",
      },
    ],
  },
  {
    id: "pesquisa",
    label: "Pesquisa",
    route: "/pesquisa",
    icon: Search,
    description: "Pesquisa global",
    requiredPermission: "process.read",
  },
  {
    id: "auditoria",
    label: "Auditoria",
    route: "/auditoria",
    icon: Shield,
    description: "Registo de auditoria",
    requiredPermission: "system.audit",
  },
  {
    id: "templates",
    label: "Templates",
    route: "/templates",
    icon: BookOpen,
    description: "Templates de documentos",
    requiredPermission: "template.read",
  },
  {
    id: "definicoes",
    label: "Definições",
    route: "/definicoes",
    icon: Settings,
    description: "Configurações do sistema",
    requiredPermission: "system.config",
  },
];

export const navigationGroups: NavigationGroup[] = [
  {
    id: "main",
    label: "Principal",
    items: mainNavigation,
  },
  {
    id: "administration",
    label: "Administração",
    items: managementNavigation,
    requiredPermission: "organization.read",
  },
];

export function findNavigationItem(
  items: NavigationItem[],
  route: string,
): NavigationItem | undefined {
  for (const item of items) {
    if (item.route === route) return item;
    if (item.children) {
      const found = findNavigationItem(item.children, route);
      if (found) return found;
    }
  }
  return undefined;
}

export function getBreadcrumbsForRoute(pathname: string): { label: string; route: string }[] {
  const allItems = [...mainNavigation, ...managementNavigation];
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; route: string }[] = [{ label: "Início", route: "/" }];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const item = findNavigationItem(allItems, currentPath);
    if (item) {
      breadcrumbs.push({ label: item.label, route: item.route });
    } else {
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        route: currentPath,
      });
    }
  }

  return breadcrumbs;
}

export function filterNavigationByPermission(
  items: NavigationItem[],
  permissions: string[],
): NavigationItem[] {
  return items
    .filter((item) => !item.requiredPermission || permissions.includes(item.requiredPermission))
    .map((item) => ({
      ...item,
      children: item.children
        ? filterNavigationByPermission(item.children, permissions)
        : undefined,
    }));
}
