"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav";
import { Bell, LogOut, User, Settings, Shield, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { humanizeProfile } from "@/lib/humanize";
import { getInitials } from "@/lib/utils";
import { useNotificationCount } from "@/hooks/use-notification-count";
import { useSystemStatus } from "@/hooks/use-system-status";
import { useOrganizationContext } from "@/hooks/use-organization-context";

export function Header() {
  const { user, logout } = useAuth();
  const { count: notificationCount } = useNotificationCount();
  const { status: systemStatus } = useSystemStatus();
  const { organizationContext } = useOrganizationContext();

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <BreadcrumbNav />
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="size-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-medium text-destructive-foreground">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 border-l pl-2">
          {organizationContext && (
            <div className="hidden sm:flex flex-col items-end text-right">
              <p className="text-xs font-medium text-foreground">{organizationContext.name}</p>
              <p className="text-[0.625rem] text-muted-foreground">{organizationContext.path}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {systemStatus === "online" && <Wifi className="size-4 text-success" aria-label="Sistema online" />}
          {systemStatus === "degraded" && <WifiOff className="size-4 text-warning" aria-label="Sistema degradado" />}
          {systemStatus === "offline" && <AlertTriangle className="size-4 text-destructive" aria-label="Sistema offline" />}
        </div>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="size-6">
                <AvatarFallback className="text-xs">{getInitials(user.full_name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.profiles[0] ? humanizeProfile(user.profiles[0].code) : "Sem perfil"}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Conta</DropdownMenuLabel>
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 size-4" />
                  Segurança
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {organizationContext && user.organizations && user.organizations.length > 1 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Organização</DropdownMenuLabel>
                    {user.organizations.map((org) => (
                      <DropdownMenuItem key={org.id} className={organizationContext.id === org.id ? "bg-primary/5" : ""}>
                        {org.name}
                        {organizationContext.id === org.id && " (atual)"}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 size-4" />
                Terminar sessão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
