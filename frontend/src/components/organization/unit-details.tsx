"use client";

import type { OrganizationalUnit, UserAssignmentWithDetails } from "@/lib/organization-types";
import { getUnitTypeMetadata, getStatusMetadata, getAssignmentTypeMetadata } from "@/lib/organization-metadata";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PencilIcon, PlusIcon, UserIcon } from "lucide-react";

interface UnitDetailsProps {
  unit: OrganizationalUnit | null;
  assignments?: UserAssignmentWithDetails[];
  onEdit?: (unit: OrganizationalUnit) => void;
  onAddAssignment?: (unitId: string) => void;
  canManage: boolean;
}

export function UnitDetails({
  unit,
  assignments = [],
  onEdit,
  onAddAssignment,
  canManage,
}: UnitDetailsProps) {
  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Selecione uma unidade para ver os detalhes.
        </p>
      </div>
    );
  }

  const metadata = getUnitTypeMetadata(unit.type_id);
  const statusMeta = getStatusMetadata(unit.status);
  const StatusIcon = statusMeta.icon;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">{unit.name}</h3>
            {unit.short_name && (
              <p className="text-sm text-muted-foreground">{unit.short_name}</p>
            )}
          </div>
          {canManage && (
            <Button variant="outline" size="sm" onClick={() => onEdit?.(unit)}>
              <PencilIcon className="mr-1.5 size-3.5" />
              Editar
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={metadata.badgeVariant}>
            <metadata.icon className="mr-1 size-3" />
            {metadata.label}
          </Badge>
          <Badge variant={statusMeta.badgeVariant}>
            <StatusIcon className="mr-1 size-3" />
            {statusMeta.label}
          </Badge>
          {unit.code && (
            <Badge variant="outline">{unit.code}</Badge>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Informação</h4>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Nome</dt>
            <dd className="font-medium">{unit.name}</dd>
          </div>
          {unit.code && (
            <div>
              <dt className="text-muted-foreground">Código</dt>
              <dd className="font-medium">{unit.code}</dd>
            </div>
          )}
          <div>
            <dt className="text-muted-foreground">Tipo</dt>
            <dd className="font-medium">{metadata.label}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Estado</dt>
            <dd className="font-medium">{statusMeta.label}</dd>
          </div>
          {unit.description && (
            <div className="col-span-2">
              <dt className="text-muted-foreground">Descrição</dt>
              <dd>{unit.description}</dd>
            </div>
          )}
          {unit.created_at && (
            <div>
              <dt className="text-muted-foreground">Criado em</dt>
              <dd>
                {new Date(unit.created_at).toLocaleDateString("pt-AO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
            </div>
          )}
          {unit.updated_at && (
            <div>
              <dt className="text-muted-foreground">Atualizado em</dt>
              <dd>
                {new Date(unit.updated_at).toLocaleDateString("pt-AO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">
            Pessoas ({assignments.length})
          </h4>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddAssignment?.(unit.id)}
            >
              <PlusIcon className="mr-1.5 size-3.5" />
              Atribuir
            </Button>
          )}
        </div>
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center rounded-md border border-dashed py-6 text-center">
            <UserIcon className="mb-2 size-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Nenhuma pessoa atribuída
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => {
              const aMeta = getAssignmentTypeMetadata(a.assignment_type);
              return (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center justify-between rounded-md border p-3",
                    a.is_primary && "border-primary/30 bg-primary/5",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {a.user_full_name || a.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {aMeta.label}
                      {a.is_primary && " · Principal"}
                    </p>
                  </div>
                  <Badge variant={a.is_primary ? "default" : "secondary"} className="text-xs">
                    {aMeta.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
