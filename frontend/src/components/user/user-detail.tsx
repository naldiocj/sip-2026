"use client";

import { useState } from "react";
import type { UserListItem } from "@/lib/users-api";
import { humanizeUserStatus } from "@/lib/humanize";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/state-components";
import { UserAssignments } from "@/components/user/user-assignments";
import { UserSecurity } from "@/components/user/user-security";
import { UserProfiles } from "@/components/user/user-profiles";
import {
  UserRoundIcon,
  BadgeCheckIcon,
  CalendarClockIcon,
  ShieldIcon,
  HistoryIcon,
  ScrollTextIcon,
  Building2Icon,
} from "lucide-react";

interface UserDetailProps {
  user: UserListItem;
  canUpdate: boolean;
  canManageProfiles: boolean;
  canAssign: boolean;
  onUserChanged: (user: UserListItem) => void;
  auditEvents: Array<{
    id: string;
    event_type: string;
    timestamp: string;
    details: Record<string, unknown>;
  }> | null;
  auditLoading: boolean;
  auditError: boolean;
  onAuditRetry: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanizeEventType(eventType: string): string {
  return eventType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function UserDetail({
  user,
  canUpdate,
  canManageProfiles,
  canAssign,
  onUserChanged,
  auditEvents,
  auditLoading,
  auditError,
  onAuditRetry,
}: UserDetailProps) {
  const [activeTab, setActiveTab] = useState("resumo");

  const primary = user.primary_assignment;
  const path = primary?.unit_path ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">{user.full_name}</h3>
        <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
          {user.status_label ?? humanizeUserStatus(user.status)}
        </Badge>
        <span className="font-mono text-xs text-muted-foreground">@{user.username}</span>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="flex-wrap">
          <TabsTrigger value="resumo">
            <UserRoundIcon className="mr-1.5 size-3.5" />
            Resumo
          </TabsTrigger>
          <TabsTrigger value="perfil">
            <BadgeCheckIcon className="mr-1.5 size-3.5" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="atribuicoes">
            <CalendarClockIcon className="mr-1.5 size-3.5" />
            Atribuições
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <ShieldIcon className="mr-1.5 size-3.5" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="actividade">
            <HistoryIcon className="mr-1.5 size-3.5" />
            Actividade
          </TabsTrigger>
          <TabsTrigger value="auditoria">
            <ScrollTextIcon className="mr-1.5 size-3.5" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="Utilizador" value={user.username} />
            <DetailRow label="Nome completo" value={user.full_name} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Nº de funcionário" value={user.employee_number ?? "—"} />
            <DetailRow label="Estado" value={user.status_label ?? humanizeUserStatus(user.status)} />
            <DetailRow label="Criado em" value={formatDateTime(user.created_at)} />
            <DetailRow label="Último acesso" value={formatDateTime(user.last_login_at)} />
          </dl>
          <div className="mt-5">
            <h4 className="text-sm font-medium text-muted-foreground">
              Contexto organizacional
            </h4>
            {primary ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
                {path.map((item, index) => (
                  <span key={item.id} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-muted-foreground">/</span>}
                    <span className="text-muted-foreground">{item.type_label}:</span>
                    <span className="font-medium">{item.name}</span>
                  </span>
                ))}
                {primary.is_primary && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Principal
                  </Badge>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <EmptyState
                  icon={Building2Icon}
                  title="Sem atribuição organizacional"
                  description="Este utilizador ainda não tem uma atribuição a uma unidade."
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="perfil" className="mt-4">
          <UserProfiles
            user={user}
            canManage={canManageProfiles}
            onChanged={onUserChanged}
          />
        </TabsContent>

        <TabsContent value="atribuicoes" className="mt-4">
          <UserAssignments userId={user.id} canManage={canAssign} />
        </TabsContent>

        <TabsContent value="seguranca" className="mt-4">
          <UserSecurity user={user} canUpdate={canUpdate} onChanged={onUserChanged} />
        </TabsContent>

        <TabsContent value="actividade" className="mt-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow label="Último acesso" value={formatDateTime(user.last_login_at)} />
            <DetailRow label="Conta criada" value={formatDateTime(user.created_at)} />
            <DetailRow label="Estado actual" value={user.status_label ?? humanizeUserStatus(user.status)} />
          </dl>
        </TabsContent>

        <TabsContent value="auditoria" className="mt-4">
          {auditLoading ? (
            <EmptyState
              icon={ScrollTextIcon}
              title="A carregar auditoria..."
              description="A consultar os eventos de auditoria deste utilizador."
            />
          ) : auditError ? (
            <EmptyState
              icon={ScrollTextIcon}
              title="Não foi possível carregar a auditoria"
              description="Tente novamente."
              action={{ label: "Tentar novamente", onClick: onAuditRetry }}
            />
          ) : !auditEvents || auditEvents.length === 0 ? (
            <EmptyState
              icon={ScrollTextIcon}
              title="Sem eventos de auditoria"
              description="Ainda não existem eventos registados para este utilizador."
            />
          ) : (
            <ul className="space-y-2">
              {auditEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-col gap-1 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{humanizeEventType(event.event_type)}</p>
                    {event.details && Object.keys(event.details).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(event.details)
                          .map(([key, value]) => `${key}: ${String(value)}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString("pt-PT")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}