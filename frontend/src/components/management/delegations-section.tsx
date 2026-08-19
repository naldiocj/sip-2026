import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon, ShieldOffIcon, UserCheckIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
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
  useDelegations,
  useCreateDelegation,
  useRevokeDelegation,
} from "@/hooks/use-management";
import { useOrganizations, useOrganizationUnits } from "@/hooks/use-organization";
import type { UserListItem } from "@/lib/users-api";
import type { DelegationRecord } from "@/lib/management-api";
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

function DelegationForm({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [delegator, setDelegator] = useState<UserListItem | null>(null);
  const [delegate, setDelegate] = useState<UserListItem | null>(null);
  const [scope, setScope] = useState("");
  const [unitId, setUnitId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: organizations } = useOrganizations();
  const firstOrg = organizations?.[0];
  const { data: units } = useOrganizationUnits(firstOrg?.id ?? null);
  const activeUnits = (units ?? []).filter((u) => u.is_active);

  const createMutation = useCreateDelegation();

  const handleSubmit = () => {
    if (!delegator) {
      setError("Selecione o delegante.");
      return;
    }
    if (!delegate) {
      setError("Selecione o delegado.");
      return;
    }
    if (delegator.id === delegate.id) {
      setError("O delegante e o delegado devem ser utilizadores diferentes.");
      return;
    }
    if (!scope) {
      setError("Selecione o âmbito da delegação.");
      return;
    }
    setError(null);
    createMutation.mutate(
      {
        delegator_user_id: delegator.id,
        delegate_user_id: delegate.id,
        scope,
        organizational_unit_id: unitId || null,
        start_date: startDate || null,
        end_date: endDate || null,
        reason: reason || null,
      },
      {
        onSuccess: () => {
          toast.success("Delegação criada com sucesso");
          setDelegator(null);
          setDelegate(null);
          setScope("");
          setUnitId("");
          setStartDate("");
          setEndDate("");
          setReason("");
          onClose();
        },
        onError: (e) => {
          setError(e instanceof Error ? e.message : "Não foi possível criar a delegação.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova delegação</DialogTitle>
          <DialogDescription>
            Transfere temporariamente uma responsabilidade de um delegante para um delegado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <UserPicker value={delegator?.id ?? null} onChange={setDelegator} label="Delegante" />
          <UserPicker value={delegate?.id ?? null} onChange={setDelegate} label="Delegado" />
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
            <FieldLabel>Unidade organizacional (opcional)</FieldLabel>
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
          <FieldGroup>
            <FieldLabel>Motivo</FieldLabel>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo da delegação (opcional)"
              aria-label="Motivo"
              rows={2}
            />
          </FieldGroup>
          {error && <FieldError>{error}</FieldError>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "A criar..." : "Criar delegação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DelegationsSection() {
  const [formOpen, setFormOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<DelegationRecord | null>(null);

  const { data: organizations } = useOrganizations();
  const firstOrg = organizations?.[0];
  const { data: units } = useOrganizationUnits(firstOrg?.id ?? null);
  const unitsMap = new Map((units ?? []).map((u) => [u.id, u.name]));

  const { data: delegations, isLoading, isError, refetch } = useDelegations();
  const revokeMutation = useRevokeDelegation();

  const handleRevoke = () => {
    if (!revokeTarget) return;
    revokeMutation.mutate(revokeTarget.id, {
      onSuccess: () => {
        toast.success("Delegação revogada com sucesso");
        setRevokeTarget(null);
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Não foi possível revogar a delegação.");
        setRevokeTarget(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <LoadingState rows={3} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (delegations?.length ?? 0) === 0 ? (
        <EmptyState
          icon={UserCheckIcon}
          title="Sem delegações"
          description="Ainda não existem delegações registadas. Crie a primeira."
          action={{ label: "Nova delegação", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delegante</TableHead>
              <TableHead>Delegado</TableHead>
              <TableHead>Âmbito</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(delegations ?? []).map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.delegator_user_id.slice(0, 8)}</TableCell>
                <TableCell>{d.delegate_user_id.slice(0, 8)}</TableCell>
                <TableCell>{humanizeResponsibilityScope(d.scope)}</TableCell>
                <TableCell>
                  {d.organizational_unit_id
                    ? (unitsMap.get(d.organizational_unit_id) ?? d.organizational_unit_id.slice(0, 8))
                    : "—"}
                </TableCell>
                <TableCell>
                  {d.start_date ?? "—"}
                  {d.end_date ? ` → ${d.end_date}` : ""}
                </TableCell>
                <TableCell>
                  <Badge variant={d.status === "ACTIVE" ? "default" : "secondary"}>
                    {d.status === "ACTIVE" ? "Ativa" : d.status === "REVOKED" ? "Revogada" : "Expirada"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {d.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRevokeTarget(d)}
                      aria-label={`Revogar delegação de ${d.delegator_user_id.slice(0, 8)} para ${d.delegate_user_id.slice(0, 8)}`}
                    >
                      <ShieldOffIcon className="size-4" />
                      Revogar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)} data-testid="nova-delegacao">
          <PlusIcon className="mr-2 size-4" />
          Nova delegação
        </Button>
      </div>

      <DelegationForm open={formOpen} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={revokeTarget !== null}
        title="Revogar delegação"
        description="A delegação será revogada (o histórico é preservado). Pretende continuar?"
        confirmLabel="Revogar"
        loading={revokeMutation.isPending}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  );
}