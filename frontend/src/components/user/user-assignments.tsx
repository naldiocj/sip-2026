"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarClockIcon,
  PlusIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-components";
import { ConfirmDialog } from "@/components/management/confirm-dialog";
import { useEndAssignment, useUserAssignments } from "@/hooks/use-management";
import {
  useCreateAssignment,
  useOrganizations,
  useUnitsByParent,
} from "@/hooks/use-organization";
import type { AssignmentRecord } from "@/lib/management-api";
import { humanizeAssignmentType } from "@/lib/humanize";

const ASSIGNMENT_TYPES = ["PRIMARY", "SECONDARY", "TEMPORARY", "ACTING", "DELEGATED"];

interface UserAssignmentsProps {
  userId: string;
  canManage: boolean;
}

function AssignmentCreateDialog({
  open,
  userId,
  onClose,
}: {
  open: boolean;
  userId: string;
  onClose: () => void;
}) {
  const { data: organizations } = useOrganizations();
  const organizationId = organizations?.[0]?.id ?? null;

  const [directionId, setDirectionId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [type, setType] = useState("PRIMARY");
  const [isPrimary, setIsPrimary] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const directionsQuery = useUnitsByParent(organizationId, null, "DIRECTION");
  const departmentsQuery = useUnitsByParent(organizationId, directionId, "DEPARTMENT");
  const sectionsQuery = useUnitsByParent(organizationId, departmentId, "SECTION");
  const unitsQuery = useUnitsByParent(organizationId, sectionId, "UNIT");

  const createMutation = useCreateAssignment(userId);

  const reset = () => {
    setDirectionId(null);
    setDepartmentId(null);
    setSectionId(null);
    setUnitId(null);
    setType("PRIMARY");
    setIsPrimary(true);
    setStartDate("");
    setEndDate("");
    setError(null);
  };

  const handleSubmit = () => {
    const targetUnitId = unitId ?? sectionId ?? departmentId ?? directionId;
    if (!targetUnitId) {
      setError("Selecione a unidade organizacional.");
      return;
    }
    setError(null);
    createMutation.mutate(
      {
        organizational_unit_id: targetUnitId,
        assignment_type: type,
        is_primary: type === "PRIMARY" ? isPrimary : false,
        start_date: startDate || null,
        end_date: endDate || null,
      },
      {
        onSuccess: () => {
          toast.success("Atribuição criada com sucesso");
          reset();
          onClose();
        },
        onError: (e) => {
          setError(e instanceof Error ? e.message : "Não foi possível criar a atribuição.");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova atribuição</DialogTitle>
          <DialogDescription>
            Coloca o utilizador numa unidade organizacional com tipo e período.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <FieldLabel>Direcção</FieldLabel>
              <Select
                value={directionId ?? ""}
                onValueChange={(v) => {
                  setDirectionId(v || null);
                  setDepartmentId(null);
                  setSectionId(null);
                  setUnitId(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {(directionsQuery.data ?? []).map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Departamento</FieldLabel>
              <Select
                value={departmentId ?? ""}
                onValueChange={(v) => {
                  setDepartmentId(v || null);
                  setSectionId(null);
                  setUnitId(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {(departmentsQuery.data ?? []).map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Secção</FieldLabel>
              <Select
                value={sectionId ?? ""}
                onValueChange={(v) => {
                  setSectionId(v || null);
                  setUnitId(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {(sectionsQuery.data ?? []).map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Unidade</FieldLabel>
              <Select
                value={unitId ?? ""}
                onValueChange={(v) => setUnitId(v || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {(unitsQuery.data ?? []).map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <FieldGroup>
            <FieldLabel>Tipo</FieldLabel>
            <Select value={type} onValueChange={(v) => setType(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {humanizeAssignmentType(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          {type === "PRIMARY" && (
            <FieldGroup>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="size-4 accent-primary"
                />
                Atribuição principal
              </label>
            </FieldGroup>
          )}
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <FieldLabel>Início</FieldLabel>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Data de início"
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Fim</FieldLabel>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="Data de fim"
              />
            </FieldGroup>
          </div>
          {error && <FieldError>{error}</FieldError>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "A criar..." : "Criar atribuição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UserAssignments({ userId, canManage }: UserAssignmentsProps) {
  const { data: assignments, isLoading, isError, refetch } = useUserAssignments(userId);
  const endMutation = useEndAssignment(userId);

  const [formOpen, setFormOpen] = useState(false);
  const [endTarget, setEndTarget] = useState<AssignmentRecord | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Atribuições organizacionais</h3>
        {canManage && (
          <Button size="sm" onClick={() => setFormOpen(true)} data-testid="nova-atribuicao">
            <PlusIcon className="mr-1.5 size-3.5" />
            Nova atribuição
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingState rows={3} />
      ) : isError ? (
        <ErrorState
          message="Não foi possível carregar as atribuições"
          onRetry={() => void refetch()}
        />
      ) : !assignments || assignments.length === 0 ? (
        <EmptyState
          icon={CalendarClockIcon}
          title="Sem atribuições"
          description="Este utilizador ainda não tem atribuições organizacionais."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.organizational_unit_id.slice(0, 8)}</TableCell>
                <TableCell>{humanizeAssignmentType(a.assignment_type)}</TableCell>
                <TableCell>
                  {a.is_primary ? <Badge>Principal</Badge> : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  {a.start_date ?? "—"}
                  {a.end_date ? ` → ${a.end_date}` : ""}
                </TableCell>
                <TableCell>
                  <Badge variant={a.status === "ACTIVE" ? "default" : "secondary"}>
                    {a.status === "ACTIVE" ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {canManage && a.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEndTarget(a)}
                      aria-label="Terminar atribuição"
                    >
                      <SquareArrowOutUpRightIcon className="size-4" />
                      Terminar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {canManage && (
        <AssignmentCreateDialog
          open={formOpen}
          userId={userId}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={!!endTarget}
        title="Terminar atribuição"
        description={
          endTarget
            ? `Terminar a atribuição ${humanizeAssignmentType(endTarget.assignment_type)}?`
            : ""
        }
        confirmLabel="Terminar"
        onConfirm={() => {
          if (!endTarget) return;
          endMutation.mutate(endTarget.id, {
            onSuccess: () => {
              toast.success("Atribuição terminada com sucesso");
              setEndTarget(null);
            },
            onError: (e) => {
              toast.error(e instanceof Error ? e.message : "Não foi possível terminar a atribuição");
            },
          });
        }}
        onCancel={() => setEndTarget(null)}
      />
    </div>
  );
}