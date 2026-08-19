"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import {
  useOcorrenciasCount,
  useDetidosCount,
  useNotificacoesCount,
} from "@/hooks/use-badge-counts";
import { navigationGroups, filterNavigationByPermission } from "@/lib/navigation-config";
import { humanizeProfile } from "@/lib/humanize";
import type { NavigationBadge, NavigationItem } from "@/types/navigation";
import type { LucideIcon } from "lucide-react";

function withBadges(
  items: NavigationItem[],
  badges: Record<string, NavigationBadge>,
): NavigationItem[] {
  return items.map((item) => {
    const badge = badges[item.id];
    return {
      ...item,
      badge: badge && (badge.count ?? 0) > 0 ? badge : item.badge,
      children: item.children ? withBadges(item.children, badges) : undefined,
    };
  });
}

function navItemToMain(
  item: NavigationItem,
): {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
  badge?: NavigationBadge;
  children?: { id: string; label: string; route: string; icon: LucideIcon }[];
} {
  return {
    id: item.id,
    label: item.label,
    route: item.route,
    icon: item.icon,
    badge: item.badge,
    children: item.children?.map(navItemToMain),
  };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const ocorrenciasCount = useOcorrenciasCount();
  const detidosCount = useDetidosCount();
  const notificacoesCount = useNotificacoesCount();

  const permissions = user?.permissions ?? [];

  const badgeMap: Record<string, NavigationBadge> = {
    ocorrencias: { count: ocorrenciasCount, variant: "destructive" },
    detidos: { count: detidosCount, variant: "secondary" },
    notificacoes: { count: notificacoesCount, variant: "destructive" },
  };

  const filteredGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: filterNavigationByPermission(withBadges(group.items, badgeMap), permissions),
    }))
    .filter((group) => group.items.length > 0);

  const userProfile = user?.profiles[0] ? humanizeProfile(user.profiles[0].code) : undefined;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">SIP</h2>
        </div>
        <p className="text-xs text-muted-foreground">Sistema de Instrucao Processual</p>
      </SidebarHeader>
      <SidebarContent>
        {filteredGroups.map((group) => (
          <NavMain key={group.id} label={group.label} items={group.items.map(navItemToMain)} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              full_name: user.full_name,
              email: user.email,
              profile: userProfile,
            }}
            onLogout={logout}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
