"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  label,
  items,
}: {
  label?: string;
  items: {
    id: string;
    label: string;
    route: string;
    icon: LucideIcon;
    badge?: { count: number; variant?: string };
    children?: {
      id: string;
      label: string;
      route: string;
      icon: LucideIcon;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const isChildActive = item.children?.some((child) => pathname === child.route);

          if (item.children && item.children.length > 0) {
            return (
              <Collapsible
                key={item.id}
                defaultOpen={isChildActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={
                          pathname === item.route ||
                          (item.route !== "/" && pathname.startsWith(item.route))
                        }
                      />
                    }
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  {item.badge && item.badge.count > 0 && (
                    <SidebarMenuBadge>{item.badge.count}</SidebarMenuBadge>
                  )}
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.id}>
                          <SidebarMenuSubButton
                            render={<Link href={child.route} />}
                            isActive={pathname === child.route}
                          >
                            <child.icon className="size-4 shrink-0" />
                            <span>{child.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                render={<Link href={item.route} />}
                isActive={
                  pathname === item.route ||
                  (item.route !== "/" && pathname.startsWith(item.route))
                }
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
              {item.badge && item.badge.count > 0 && (
                <SidebarMenuBadge>{item.badge.count}</SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
