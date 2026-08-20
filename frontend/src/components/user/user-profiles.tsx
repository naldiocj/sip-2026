"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAssignProfile, useProfiles, useRemoveProfile } from "@/hooks/use-users";
import type { UserListItem } from "@/lib/users-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState, EmptyState } from "@/components/ui/state-components";
import { ConfirmDialog } from "@/components/management/confirm-dialog";

interface UserProfilesProps {
  user: UserListItem;
  canManage: boolean;
  onChanged: (user: UserListItem) => void;
}

export function UserProfiles({ user, canManage, onChanged }: UserProfilesProps) {
  const { data: profilesData, isLoading } = useProfiles();
  const assignMutation = useAssignProfile();
  const removeMutation = useRemoveProfile();
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const availableProfiles = (profilesData?.items ?? []).filter(
    (profile) => !user.profiles.some((p) => p.id === profile.id),
  );

  const handleAssign = () => {
    if (!selectedProfileId) return;
    assignMutation.mutate(
      { userId: user.id, profileId: selectedProfileId },
      {
        onSuccess: (updated) => {
          toast.success("Perfil atribuído com sucesso");
          setSelectedProfileId("");
          onChanged(updated);
        },
        onError: (e) => {
          toast.error(e instanceof Error ? e.message : "Não foi possível atribuir o perfil");
        },
      },
    );
  };

  const handleRemove = (profileId: string) => {
    removeMutation.mutate(
      { userId: user.id, profileId },
      {
        onSuccess: (updated) => {
          toast.success("Perfil removido com sucesso");
          setRemoveTarget(null);
          onChanged(updated);
        },
        onError: (e) => {
          setRemoveTarget(null);
          toast.error(e instanceof Error ? e.message : "Não foi possível remover o perfil");
        },
      },
    );
  };

  const removeProfile = (profilesData?.items ?? []).find((p) => p.id === removeTarget);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Perfis atribuídos</h3>
        {isLoading ? (
          <LoadingState rows={2} />
        ) : user.profiles.length === 0 ? (
          <div className="mt-2">
            <EmptyState
              title="Sem perfis"
              description="Este utilizador não tem perfis atribuídos."
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {user.profiles.map((profile) => (
              <li
                key={profile.id}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{profile.label}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{profile.code}</span>
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoveTarget(profile.id)}
                    aria-label={`Remover perfil ${profile.label}`}
                  >
                    Remover
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManage && availableProfiles.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectedProfileId} onValueChange={(v) => setSelectedProfileId(v ?? "")}>
            <SelectTrigger className="w-full sm:w-[260px]" aria-label="Selecionar perfil">
              <SelectValue placeholder="Selecionar perfil para atribuir" />
            </SelectTrigger>
            <SelectContent>
              {availableProfiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={!selectedProfileId || assignMutation.isPending}
          >
            {assignMutation.isPending ? "A atribuir..." : "Atribuir"}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        title="Remover perfil"
        description={
          removeProfile
            ? `Remover o perfil «${removeProfile.label}» de «${user.username}»?`
            : ""
        }
        confirmLabel="Remover"
        destructive
        loading={removeMutation.isPending}
        onConfirm={() => removeTarget && handleRemove(removeTarget)}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}