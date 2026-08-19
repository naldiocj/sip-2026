import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon, SquareArrowOutUpRightIcon, UserRoundIcon } from "lucide-react";

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
  useSubstitutions,
  useCreateSubstitution,
  useEndSubstitution,
} from "@/hooks/use-management";
import { useOrganizations, useOrganizationUnits } from "@/hooks/use-organization";
import type { UserListItem } from "@/lib/users-api";
import type { SubstitutionRecord } from "@/lib/management-api";

const FUNCTIONAL_ROLES = [
  "DIRECTOR",
  "DEPARTAMENTO_CHEFE",
  "SECCAO_CHEFE",
  "INSTRUTOR",
  "EDITOR",
  "AGENTE_PIQUETE",
  "SECRETARIO",
  "AGENTE_PGR",
];

function SubstitutionForm({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [substituted, setSubstituted] = useState<UserListItem | null>(null);
  const [substitute, setSubstitute] = useState<UserListItem | null>(null);
  const [unitId, setUnitId] = useState("");
  const [functionalRole, setFunctionalRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: organizations } = useOrganizations();
  const firstOrg = organizations?.[0];
  const { data: units } = useOrganizationUnits(firstOrg?.id ?? null);
  const activeUnits = (units ?? []).filter((u) => u.is_active);

  const createMutation = useCreateSubstitution();

  const handleSubmit = () => {
    if (!substituted) {
      setError("Selecione o utilizador substituído.");
      return;
    }
    if (!substitute) {
      setError("Selecione o substituto.");
      return;
    }
    if (substituted.id === substitute.id) {
      setError("O substituído e o substituto devem ser utilizadores diferentes.");
      return;
    }
    if (!startDate || !endDate) {
      setError("A substituição exige período (início e fim).");
      return;
    }
    setError(null);
    createMutation.mutate(
      {
        substituted_user_id: substituted.id,
        substitute_user_id: substitute.id,
        organizational_unit_id: unitId || null,
        functional_role: functionalRole || null,
        start_date: startDate,
        end_date: endDate,
        reason: reason || null,
      },
      {
        onSuccess: () => {
          toast.success("Substituição criada com sucesso");
          setSubstituted(null);
          setSubstitute(null);
          setUnitId("");
          setFunctionalRole("");
          setStartDate("");
          setEndDate("");
          setReason("");
          onClose();
        },
        onError: (e) => {
          setError(e instanceof Error ? e.message : "Não foi possível criar a substituição.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova substituição</DialogTitle>
          <DialogDescription>
            Um substituto exerce temporariamente a função de outro utilizador.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <UserPicker
            value={substituted?.id ?? null}
            onChange={setSubstituted}
            label="Substituído"
          />
          <UserPicker
            value={substitute?.id ?? null}
            onChange={setSubstitute}
            label="Substituto"
          />
          <FieldGroup>
            <FieldLabel>Função funcional (opcional)</FieldLabel>
            <Select value={functionalRole} onValueChange={(v) => setFunctionalRole(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar função" />
              </SelectTrigger>
              <SelectContent>
                {FUNCTIONAL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.replace(/_/g, " ").toLowerCase()}
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
              placeholder="Motivo da substituição (opcional)"
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
            {createMutation.isPending ? "A criar..." : "Criar substituição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubstitutionsSection() {
  const [formOpen, setFormOpen] = useState(false);
  const [endTarget, setEndTarget] = useState<SubstitutionRecord | null>(null);

  const { data: organizations } = useOrganizations();
  const firstOrg = organizations?.[0];
  const { data: units } = useOrganizationUnits(firstOrg?.id ?? null);
  const unitsMap = new Map((units ?? []).map((u) => [u.id, u.name]));

  const { data: substitutions, isLoading, isError, refetch } = useSubstitutions();
  const endMutation = useEndSubstitution();

  const handleEnd = () => {
    if (!endTarget) return;
    endMutation.mutate(endTarget.id, {
      onSuccess: () => {
        toast.success("Substituição terminada com sucesso");
        setEndTarget(null);
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Não foi possível terminar a substituição.");
        setEndTarget(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <LoadingState rows={3} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (substitutions?.length ?? 0) === 0 ? (
        <EmptyState
          icon={UserRoundIcon}
          title="Sem substituições"
          description="Ainda não existem substituições registadas. Crie a primeira."
          action={{ label: "Nova substituição", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Substituído</TableHead>
              <TableHead>Substituto</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(substitutions ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.substituted_user_id.slice(0, 8)}</TableCell>
                <TableCell>{s.substitute_user_id.slice(0, 8)}</TableCell>
                <TableCell>{s.functional_role ?? "—"}</TableCell>
                <TableCell>
                  {s.organizational_unit_id
                    ? (unitsMap.get(s.organizational_unit_id) ?? s.organizational_unit_id.slice(0, 8))
                    : "—"}
                </TableCell>
                <TableCell>
                  {s.start_date ?? "—"}
                  {s.end_date ? ` → ${s.end_date}` : ""}
                </TableCell>
                <TableCell>
                  <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"}>
                    {s.status === "ACTIVE" ? "Ativa" : "Terminada"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {s.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEndTarget(s)}
                      aria-label="Terminar substituição"
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
        <Button onClick={() => setFormOpen(true)} data-testid="nova-substituicao">
          <PlusIcon className="mr-2 size-4" />
          Nova substituição
        </Button>
      </div>

      <SubstitutionForm open={formOpen} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={endTarget !== null}
        title="Terminar substituição"
        description="A substituição será terminada (o histórico é preservado). Pretende continuar?"
        confirmLabel="Terminar"
        loading={endMutation.isPending}
        onConfirm={handleEnd}
        onCancel={() => setEndTarget(null)}
      />
    </div>
  );
}