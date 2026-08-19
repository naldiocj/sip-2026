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
import { UserPicker } from "@/components/management/user-picker";
import { useUserAssignments, useEndAssignment } from "@/hooks/use-management";
import { useOrganizations, useOrganizationUnits, useCreateAssignment } from "@/hooks/use-organization";
import type { UserListItem } from "@/lib/users-api";
import type { AssignmentRecord } from "@/lib/management-api";
import { humanizeAssignmentType } from "@/lib/humanize";

const ASSIGNMENT_TYPES = ["PRIMARY", "SECONDARY", "TEMPORARY", "ACTING", "DELEGATED"];

function AssignmentForm({
  open,
  userId,
  onClose,
}: {
  open: boolean;
  userId: string;
  onClose: () => void;
}) {
  const { data: organizations } = useOrganizations();
  const firstOrg = organizations?.[0];
  const { data: units } = useOrganizationUnits(firstOrg?.id ?? null);

  const [unitId, setUnitId] = useState("");
  const [type, setType] = useState("PRIMARY");
  const [isPrimary, setIsPrimary] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateAssignment(userId);

  const activeUnits = (units ?? []).filter((u) => u.is_active);

  const handleSubmit = () => {
    if (!unitId) {
      setError("Selecione a unidade organizacional.");
      return;
    }
    setError(null);
    createMutation.mutate(
      {
        organizational_unit_id: unitId,
        assignment_type: type,
        is_primary: type === "PRIMARY" ? isPrimary : false,
        start_date: startDate || null,
        end_date: endDate || null,
      },
      {
        onSuccess: () => {
          toast.success("Atribuição criada com sucesso");
          setUnitId("");
          setStartDate("");
          setEndDate("");
          onClose();
        },
        onError: (e) => {
          setError(e instanceof Error ? e.message : "Não foi possível criar a atribuição.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova atribuição</DialogTitle>
          <DialogDescription>
            Coloca o utilizador numa unidade organizacional com tipo e período.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FieldGroup>
            <FieldLabel>Unidade organizacional</FieldLabel>
            <Select value={unitId} onValueChange={(v) => setUnitId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar unidade" />
              </SelectTrigger>
              <SelectContent>
                {activeUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                    {u.code ? ` (${u.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
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

function AssignmentsTable({
  assignments,
  unitsMap,
  canEnd,
  onEnd,
}: {
  assignments: AssignmentRecord[];
  unitsMap: Map<string, string>;
  canEnd: boolean;
  onEnd: (assignment: AssignmentRecord) => void;
}) {
  return (
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
            <TableCell>{unitsMap.get(a.organizational_unit_id) ?? a.organizational_unit_id.slice(0, 8)}</TableCell>
            <TableCell>{humanizeAssignmentType(a.assignment_type)}</TableCell>
            <TableCell>{a.is_primary ? <Badge>Principal</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
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
              {canEnd && a.status === "ACTIVE" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEnd(a)}
                  aria-label={`Terminar atribuição em ${unitsMap.get(a.organizational_unit_id) ?? a.organizational_unit_id}`}
                >
                  <SquareArrowOutUpRightIcon className="size-4" />
                  Terminar
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AssignmentsSection() {
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [endTarget, setEndTarget] = useState<AssignmentRecord | null>(null);

  const { data: organizations } = useOrganizations();
  const firstOrg = organizations?.[0];
  const { data: units } = useOrganizationUnits(firstOrg?.id ?? null);
  const unitsMap = new Map((units ?? []).map((u) => [u.id, u.name]));

  const { data: assignments, isLoading, isError, refetch } = useUserAssignments(
    selectedUser?.id ?? null,
  );
  const endMutation = useEndAssignment(selectedUser?.id ?? "");

  const handleEnd = () => {
    if (!endTarget || !selectedUser) return;
    endMutation.mutate(endTarget.id, {
      onSuccess: () => {
        toast.success("Atribuição terminada com sucesso");
        setEndTarget(null);
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Não foi possível terminar a atribuição.");
        setEndTarget(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <UserPicker value={selectedUser?.id ?? null} onChange={setSelectedUser} />

      {!selectedUser ? (
        <EmptyState
          icon={CalendarClockIcon}
          title="Selecione um utilizador"
          description="Escolha um utilizador para ver e gerir as suas atribuições."
        />
      ) : isLoading ? (
        <LoadingState rows={3} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (assignments?.length ?? 0) === 0 ? (
        <EmptyState
          icon={CalendarClockIcon}
          title="Sem atribuições"
          description="Este utilizador ainda não tem atribuições. Crie a primeira."
          action={{
            label: "Nova atribuição",
            onClick: () => setFormOpen(true),
          }}
        />
      ) : (
        <AssignmentsTable
          assignments={assignments ?? []}
          unitsMap={unitsMap}
          canEnd
          onEnd={setEndTarget}
        />
      )}

      {selectedUser && (assignments?.length ?? 0) > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => setFormOpen(true)} data-testid="nova-atribuicao">
            <PlusIcon className="mr-2 size-4" />
            Nova atribuição
          </Button>
        </div>
      )}

      {selectedUser && (
        <AssignmentForm
          open={formOpen}
          userId={selectedUser.id}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={endTarget !== null}
        title="Terminar atribuição"
        description="A atribuição será terminada (o histórico é preservado). Pretende continuar?"
        confirmLabel="Terminar"
        loading={endMutation.isPending}
        onConfirm={handleEnd}
        onCancel={() => setEndTarget(null)}
      />
    </div>
  );
}