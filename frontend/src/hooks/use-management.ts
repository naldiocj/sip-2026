import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { managementApi } from "@/lib/management-api";
import type {
  DelegationCreate,
  ResponsibilityCreate,
  SubstitutionCreate,
  UserAssignmentUpdate,
} from "@/lib/management-api";

export const managementKeys = {
  all: ["management"] as const,
  assignments: (userId: string) => [...managementKeys.all, "assignments", userId] as const,
  responsibilities: (userId?: string) =>
    [...managementKeys.all, "responsibilities", userId ?? "all"] as const,
  delegations: (userId?: string) =>
    [...managementKeys.all, "delegations", userId ?? "all"] as const,
};

export function useUserAssignments(userId: string | null) {
  return useQuery({
    queryKey: managementKeys.assignments(userId ?? ""),
    queryFn: () => managementApi.listUserAssignments(userId!),
    enabled: !!userId,
  });
}

export function useUpdateAssignment(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data: UserAssignmentUpdate;
    }) => managementApi.updateUserAssignment(userId, assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managementKeys.assignments(userId) });
    },
  });
}

export function useEndAssignment(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) =>
      managementApi.endUserAssignment(userId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managementKeys.assignments(userId) });
    },
  });
}

export function useResponsibilities(userId?: string | null) {
  return useQuery({
    queryKey: managementKeys.responsibilities(userId ?? undefined),
    queryFn: () => managementApi.listResponsibilities(userId ?? undefined),
  });
}

export function useCreateResponsibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResponsibilityCreate) => managementApi.createResponsibility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managementKeys.responsibilities() });
    },
  });
}

export function useEndResponsibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responsibilityId: string) =>
      managementApi.endResponsibility(responsibilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managementKeys.responsibilities() });
    },
  });
}

export function useDelegations(userId?: string | null) {
  return useQuery({
    queryKey: managementKeys.delegations(userId ?? undefined),
    queryFn: () => managementApi.listDelegations(userId ?? undefined),
  });
}

export function useCreateDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DelegationCreate) => managementApi.createDelegation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managementKeys.delegations() });
    },
  });
}

export function useRevokeDelegation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (delegationId: string) => managementApi.revokeDelegation(delegationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managementKeys.delegations() });
    },
  });
}

export function useSubstitutions(userId?: string | null) {
  return useQuery({
    queryKey: [...managementKeys.all, "substitutions", userId ?? "all"],
    queryFn: () => managementApi.listSubstitutions(userId ?? undefined),
  });
}

export function useCreateSubstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubstitutionCreate) => managementApi.createSubstitution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...managementKeys.all, "substitutions"] });
    },
  });
}

export function useEndSubstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (substitutionId: string) => managementApi.endSubstitution(substitutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...managementKeys.all, "substitutions"] });
    },
  });
}