import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/users-api";
import type {
  AuditListParams,
  UserCreate,
  UserListParams,
  UserUpdate,
} from "@/lib/users-api";

export const usersKeys = {
  all: ["users"] as const,
  list: (params: UserListParams) => [...usersKeys.all, "list", params] as const,
  detail: (userId: string) => [...usersKeys.all, "detail", userId] as const,
  profiles: ["profiles"] as const,
  audit: (params: AuditListParams) => ["audit", params] as const,
};

export function useUsers(params: UserListParams = {}) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: usersKeys.detail(userId ?? ""),
    queryFn: () => usersApi.get(userId!),
    enabled: !!userId,
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: usersKeys.profiles,
    queryFn: () => usersApi.listProfiles(),
    staleTime: 60_000,
  });
}

export function useUserAudit(params: AuditListParams) {
  return useQuery({
    queryKey: usersKeys.audit(params),
    queryFn: () => usersApi.listAudit(params),
    enabled: !!params.user_id,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: usersKeys.all });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });
    }
  };
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (data: UserCreate) => usersApi.create(data),
    onSuccess: (user) => invalidate(user.id),
  });
}

export function useUpdateUser(userId: string) {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (data: UserUpdate) => usersApi.update(userId, data),
    onSuccess: (user) => invalidate(user.id),
  });
}

export function useActivateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (userId: string) => usersApi.activate(userId),
    onSuccess: (user) => invalidate(user.id),
  });
}

export function useDeactivateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (userId: string) => usersApi.deactivate(userId),
    onSuccess: (user) => invalidate(user.id),
  });
}

export function useBlockUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (userId: string) => usersApi.block(userId),
    onSuccess: (user) => invalidate(user.id),
  });
}

export function useUnblockUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (userId: string) => usersApi.unblock(userId),
    onSuccess: (user) => invalidate(user.id),
  });
}

export function useAssignProfile() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ userId, profileId }: { userId: string; profileId: string }) =>
      usersApi.assignProfile(userId, profileId),
    onSuccess: (user) => invalidate(user.id),
  });
}

export function useRemoveProfile() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ userId, profileId }: { userId: string; profileId: string }) =>
      usersApi.removeProfile(userId, profileId),
    onSuccess: (user) => invalidate(user.id),
  });
}