"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useActivateUser,
  useBlockUser,
  useDeactivateUser,
  useUnblockUser,
} from "@/hooks/use-users";
import { humanizeUserStatus } from "@/lib/humanize";
import type { UserListItem } from "@/lib/users-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/management/confirm-dialog";

interface UserSecurityProps {
  user: UserListItem;
  canUpdate: boolean;
  onChanged: (user: UserListItem) => void;
}

type PendingAction = "activate" | "deactivate" | "block" | "unblock" | null;

export function UserSecurity({ user, canUpdate, onChanged }: UserSecurityProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const activate = useActivateUser();
  const deactivate = useDeactivateUser();
  const block = useBlockUser();
  const unblock = useUnblockUser();

  const execute = (action: Exclude<PendingAction, null>) => {
    const mutation =
      action === "activate"
        ? activate
        : action === "deactivate"
          ? deactivate
          : action === "block"
            ? block
            : unblock;
    mutation.mutate(user.id, {
      onSuccess: (updated) => {
        toast.success("Estado da conta actualizado com sucesso");
        setPendingAction(null);
        onChanged(updated);
      },
      onError: (e) => {
        setPendingAction(null);
        toast.error(e instanceof Error ? e.message : "Não foi possível actualizar o estado");
      },
    });
  };

  const confirmLabels: Record<Exclude<PendingAction, null>, { title: string; description: string }> = {
    activate: {
      title: "Activar conta",
      description: `Activar a conta «${user.username}»? O utilizador poderá iniciar sessão novamente.`,
    },
    deactivate: {
      title: "Desactivar conta",
      description: `Desactivar a conta «${user.username}»? As sessões activas serão revogadas.`,
    },
    block: {
      title: "Bloquear conta",
      description: `Bloquear a conta «${user.username}»? As sessões activas serão revogadas.`,
    },
    unblock: {
      title: "Desbloquear conta",
      description: `Desbloquear a conta «${user.username}»? O utilizador poderá iniciar sessão novamente.`,
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
          {humanizeUserStatus(user.status)}
        </Badge>
        {!canUpdate && (
          <span className="text-xs text-muted-foreground">
            Não tem permissão para alterar o estado desta conta.
          </span>
        )}
      </div>

      {canUpdate && (
        <div className="flex flex-wrap gap-2">
          {user.status !== "ACTIVE" && (
            <Button size="sm" onClick={() => setPendingAction("activate")}>
              Activar
            </Button>
          )}
          {user.status === "ACTIVE" && (
            <Button size="sm" variant="outline" onClick={() => setPendingAction("deactivate")}>
              Desactivar
            </Button>
          )}
          {user.status !== "BLOCKED" && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setPendingAction("block")}
            >
              Bloquear
            </Button>
          )}
          {user.status === "BLOCKED" && (
            <Button size="sm" variant="outline" onClick={() => setPendingAction("unblock")}>
              Desbloquear
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction ? confirmLabels[pendingAction].title : ""}
        description={pendingAction ? confirmLabels[pendingAction].description : ""}
        confirmLabel="Confirmar"
        destructive={pendingAction === "deactivate" || pendingAction === "block"}
        loading={
          activate.isPending || deactivate.isPending || block.isPending || unblock.isPending
        }
        onConfirm={() => pendingAction && execute(pendingAction)}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}