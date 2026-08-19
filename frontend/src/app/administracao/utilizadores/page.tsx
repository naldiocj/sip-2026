"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/state-components";
import { UserDataTable } from "@/components/user/user-data-table";
import { UserForm } from "@/components/user/user-form";
import { useAuth } from "@/hooks/use-auth";
import {
  useActivateUser,
  useBlockUser,
  useCreateUser,
  useDeactivateUser,
  useProfiles,
  useUnblockUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/use-users";
import { useCreateAssignment } from "@/hooks/use-organization";
import type { UserListItem } from "@/lib/users-api";
import { toast } from "sonner";
import { UserPlusIcon } from "lucide-react";

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function UtilizadoresContent() {
  const router = useRouter();
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canCreate = permissions.includes("user.create");
  const canUpdate = permissions.includes("user.update");
  const canManageProfiles = permissions.includes("profile.manage");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const debouncedSearch = useDebounced(search);

  const { data, isLoading, isError, refetch } = useUsers({
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    profile_id: profileFilter === "all" ? undefined : profileFilter,
    page,
    page_size: pageSize,
  });
  const { data: profilesData } = useProfiles();

  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [pendingAssignment, setPendingAssignment] = useState<{
    userId: string;
    unitId: string;
    isPrimary: boolean;
  } | null>(null);
  const assignmentMutation = useCreateAssignment(pendingAssignment?.userId ?? "");

  const pendingActionRef = useRef<((user: UserListItem) => void) | null>(null);

  const handleAction = useCallback(
    (action: string, user: UserListItem, confirm: boolean, fn: () => Promise<unknown>) => {
      const run = () => {
        pendingActionRef.current = null;
        void fn().then(() => {
          toast.success("Operação concluída com sucesso");
          void refetch();
        });
      };
      if (confirm) {
        pendingActionRef.current = run;
        toast(
          <div>
            <p className="font-medium">
              {action} «{user.username}»?
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="destructive" onClick={run}>
                Confirmar
              </Button>
              <Button size="sm" variant="outline" onClick={() => (pendingActionRef.current = null)}>
                Cancelar
              </Button>
            </div>
          </div>,
        );
      } else {
        run();
      }
    },
    [refetch],
  );

  const toggleStatus = useCallback(
    (user: UserListItem) => {
      const activating = user.status !== "ACTIVE";
      handleAction(
        activating ? "Activar" : "Desactivar",
        user,
        !activating,
        () =>
          activating
            ? activateMutation.mutateAsync(user.id)
            : deactivateMutation.mutateAsync(user.id),
      );
    },
    [handleAction, activateMutation, deactivateMutation],
  );

  const toggleBlock = useCallback(
    (user: UserListItem) => {
      const unblocking = user.status === "BLOCKED";
      handleAction(
        unblocking ? "Desbloquear" : "Bloquear",
        user,
        true,
        () =>
          unblocking
            ? unblockMutation.mutateAsync(user.id)
            : blockMutation.mutateAsync(user.id),
      );
    },
    [handleAction, blockMutation, unblockMutation],
  );

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (user: UserListItem) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleCreateAssignment = async (userId: string, unitId: string, isPrimary: boolean) => {
    setPendingAssignment({ userId, unitId, isPrimary });
    try {
      await assignmentMutation.mutateAsync({
        organizational_unit_id: unitId,
        assignment_type: isPrimary ? "PRIMARY" : "SECONDARY",
        is_primary: isPrimary,
        start_date: new Date().toISOString().slice(0, 10),
      });
    } finally {
      setPendingAssignment(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Utilizadores"
        description="Gestão de contas e acessos ao sistema"
        actions={
          canCreate ? (
            <Button onClick={openCreate} data-testid="novo-utilizador">
              <UserPlusIcon className="mr-2 size-4" />
              Novo Utilizador
            </Button>
          ) : undefined
        }
      />
      <PageContent>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <LoadingState message="A carregar utilizadores..." />
            ) : isError ? (
              <ErrorState
                message="Não foi possível carregar os utilizadores"
                onRetry={() => void refetch()}
              />
            ) : (
              <UserDataTable
                items={data?.items ?? []}
                total={data?.total ?? 0}
                page={page}
                pageSize={pageSize}
                search={search}
                statusFilter={statusFilter}
                profileFilter={profileFilter}
                profiles={profilesData?.items ?? []}
                permissions={{ canUpdate, canManageProfiles }}
                actions={{
                  onView: (user) => router.push(`/administracao/utilizadores/${user.id}`),
                  onEdit: openEdit,
                  onToggleStatus: toggleStatus,
                  onToggleBlock: toggleBlock,
                  onManageProfiles: (user) =>
                    router.push(`/administracao/utilizadores/${user.id}?tab=perfis`),
                }}
                onSearchChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                onStatusFilterChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                onProfileFilterChange={(value) => {
                  setProfileFilter(value);
                  setPage(1);
                }}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>
      </PageContent>
      <UserForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editingUser={editingUser}
        onCreate={async (data) => {
          const created = await createMutation.mutateAsync(data);
          toast.success("Utilizador criado com sucesso");
          return created;
        }}
        onUpdate={async (userId, data) => {
          const updated = await updateMutation.mutateAsync({ userId, data });
          toast.success("Utilizador actualizado com sucesso");
          return updated;
        }}
        onCreateAssignment={handleCreateAssignment}
      />
    </PageContainer>
  );
}

export default function UtilizadoresPage() {
  return (
    <ProtectedRoute>
      <UtilizadoresContent />
    </ProtectedRoute>
  );
}