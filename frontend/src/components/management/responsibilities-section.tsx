import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon, ShieldIcon, SquareArrowOutUpRightIcon } from "lucide-react";

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
import {
  useResponsibilities,
  useCreateResponsibility,
  useEndResponsibility,
} from "@/hooks/use-management";
import { useOrganizations, useOrganizationUnits } from "@/hooks/use-organization";
import type { UserListItem } from "@/lib/users-api";
import type { ResponsibilityRecord } from "@/lib/management-api";
import { humanizeResponsibilityScope } from "@/lib/humanize";

const SCOPES = [
  "DIRECTION",
  "DEPARTMENT",
  "SECTION",
  "UNIT",
  "PIQUETE",
  "PROCESS_MANAGEMENT",
  "DOCUMENT_MANAGEMENT",
];

const UNIT_REQUIRED_SCOPES = new Set(["DIRECTION", "DEPARTMENT", "SECTION", "UNIT", "PIQUETE"]);

function ResponsibilityForm({
  open,
  defaultUser,
  onClose,
}: {
  open: boolean;
  defaultUser: UserListItem | null;
  onClose: () => void;
}) {
  const [user, setUser] = useState<UserListItem | null>(defaultUser);
  const [scope, setScope] = useState("");
  const [unitId, setUnitId] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: organizations } = useOrganizations();
  const firstOrg = organizations?.[0];
  const { data: units } = useOrganizationUnits(firstOrg?.id ?? null);
  const activeUnits = (units ?? []).filter((u) => u.is_active);

  const createMutation = useCreateResponsibility();

  const unitRequired = UNIT_REQUIRED_SCOPES.has(scope);

  const handleSubmit = () => {
    if (!user) {
      setError("Selecione o utilizador.");
      return;
    }
    if (!scope) {
      setError("Selecione o âmbito da responsabilidade.");
      return;
    }
    if (unitRequired && !unitId) {
      setError("Este âmbito exige uma unidade organizacional.");
      return;
    }
    setError(null);
    createMutation.mutate(
      {
        user_id: user.id,
        scope,
        organizational_unit_id: unitRequired ? unitId : (unitId || null),
        resource_type: resourceType || null,
        start_date: startDate || null,
        end_date: endDate || null,
      },
      {
        onSuccess: () => {
          toast.success("Responsabilidade atribuída com sucesso");
          setScope("");
          setUnitId("");
          setResourceType("");
          setStartDate("");
          setEndDate("");
          onClose();
        },
        onError: (e) => {
          setError(e instanceof Error ? e.message : "Não foi possível atribuir a responsabilidade.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova responsabilidade</DialogTitle>
          <DialogDescription>
            Atribui um âmbito de responsabilidade a um utilizador.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!defaultUser && <UserPicker value={user?.id ?? null} onChange={setUser} />}
          <FieldGroup>
            <FieldLabel>Âmbito</FieldLabel>
            <Select value={scope} onValueChange={(v) => setScope(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar âmbito" />
              </SelectTrigger>
              <SelectContent>
                {SCOPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {humanizeResponsibilityScope(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Unidade organizacional {unitRequired ? "(obrigatória)" : "(opcional)"}</FieldLabel>
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
            <FieldLabel>Tipo de recurso (opcional)</FieldLabel>
            <Input
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              placeholder="Ex.: processo, documento"
              aria-label="Tipo de recurso"
            />
          </FieldGroup>
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
            {createMutation.isPending ? "A atribuir..." : "Atribuir responsabilidade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResponsibilitiesSection() {
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [endTarget, setEndTarget] = useState<ResponsibilityRecord | null>(null);

  const { data: organizations } = useOrganizations();
  const firstOrg = organizations?.[0];
  const { data: units } = useOrganizationUnits(firstOrg?.id ?? null);
  const unitsMap = new Map((units ?? []).map((u) => [u.id, u.name]));

  const { data: responsibilities, isLoading, isError, refetch } = useResponsibilities(
    selectedUser?.id ?? null,
  );
  const endMutation = useEndResponsibility();

  const handleEnd = () => {
    if (!endTarget) return;
    endMutation.mutate(endTarget.id, {
      onSuccess: () => {
        toast.success("Responsabilidade terminada com sucesso");
        setEndTarget(null);
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Não foi possível terminar a responsabilidade.");
        setEndTarget(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <UserPicker
        value={selectedUser?.id ?? null}
        onChange={setSelectedUser}
        label="Filtrar por utilizador"
        placeholder="Todos os utilizadores"
      />

      {isLoading ? (
        <LoadingState rows={3} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (responsibilities?.length ?? 0) === 0 ? (
        <EmptyState
          icon={ShieldIcon}
          title="Sem responsabilidades"
          description="Ainda não existem responsabilidades registadas. Atribua a primeira."
          action={{ label: "Nova responsabilidade", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilizador</TableHead>
              <TableHead>Âmbito</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(responsibilities ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.user_id.slice(0, 8)}</TableCell>
                <TableCell>{humanizeResponsibilityScope(r.scope)}</TableCell>
                <TableCell>
                  {r.organizational_unit_id
                    ? (unitsMap.get(r.organizational_unit_id) ?? r.organizational_unit_id.slice(0, 8))
                    : "—"}
                </TableCell>
                <TableCell>{r.resource_type ?? "—"}</TableCell>
                <TableCell>
                  {r.start_date ?? "—"}
                  {r.end_date ? ` → ${r.end_date}` : ""}
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === "ACTIVE" ? "default" : "secondary"}>
                    {r.status === "ACTIVE" ? "Ativa" : "Terminada"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {r.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEndTarget(r)}
                      aria-label={`Terminar responsabilidade ${humanizeResponsibilityScope(r.scope)}`}
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

      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)} data-testid="nova-responsabilidade">
          <PlusIcon className="mr-2 size-4" />
          Nova responsabilidade
        </Button>
      </div>

      <ResponsibilityForm
        open={formOpen}
        defaultUser={selectedUser}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={endTarget !== null}
        title="Terminar responsabilidade"
        description="A responsabilidade será terminada (o histórico é preservado). Pretende continuar?"
        confirmLabel="Terminar"
        loading={endMutation.isPending}
        onConfirm={handleEnd}
        onCancel={() => setEndTarget(null)}
      />
    </div>
  );
}