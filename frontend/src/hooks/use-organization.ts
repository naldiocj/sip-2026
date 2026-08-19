import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/lib/organization-api";
import type { UnitCreate, UnitUpdate, UserAssignmentCreate } from "@/lib/organization-types";

export const organizationKeys = {
  all: ["organization"] as const,
  organizations: () => [...organizationKeys.all, "organizations"] as const,
  units: (orgId: string) => [...organizationKeys.all, "units", orgId] as const,
  tree: (orgId: string) => [...organizationKeys.all, "tree", orgId] as const,
  unit: (unitId: string) => [...organizationKeys.all, "unit", unitId] as const,
  unitAssignments: (unitId: string) =>
    [...organizationKeys.all, "unit-assignments", unitId] as const,
  unitTypes: () => [...organizationKeys.all, "unit-types"] as const,
  userAssignments: (userId: string) =>
    [...organizationKeys.all, "user-assignments", userId] as const,
  context: () => [...organizationKeys.all, "context"] as const,
};

export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.organizations(),
    queryFn: () => organizationApi.listOrganizations(),
  });
}

export function useOrganizationUnits(organizationId: string | null) {
  return useQuery({
    queryKey: organizationKeys.units(organizationId ?? ""),
    queryFn: () => organizationApi.listAllUnits(organizationId!),
    enabled: !!organizationId,
  });
}

export function useUnitsByParent(
  organizationId: string | null,
  parentId: string | null,
  typeId?: string,
) {
  return useQuery({
    queryKey: [...organizationKeys.units(organizationId ?? ""), "children", parentId ?? "", typeId ?? ""] as const,
    queryFn: () =>
      organizationApi.listUnitsByFilters(organizationId!, {
        parent_id: parentId,
        type_id: typeId,
      }),
    enabled: !!organizationId,
    staleTime: 30_000,
  });
}

export function useOrganizationTree(organizationId: string | null) {
  return useQuery({
    queryKey: organizationKeys.tree(organizationId ?? ""),
    queryFn: () => organizationApi.getUnitTree(organizationId!),
    enabled: !!organizationId,
  });
}

export function useUnit(unitId: string | null) {
  return useQuery({
    queryKey: organizationKeys.unit(unitId ?? ""),
    queryFn: () => organizationApi.getUnit(unitId!),
    enabled: !!unitId,
  });
}

export function useUnitAssignments(unitId: string | null) {
  return useQuery({
    queryKey: organizationKeys.unitAssignments(unitId ?? ""),
    queryFn: () => organizationApi.getUnitAssignments(unitId!),
    enabled: !!unitId,
  });
}

export function useUnitTypes() {
  return useQuery({
    queryKey: organizationKeys.unitTypes(),
    queryFn: () => organizationApi.getUnitTypes(),
    staleTime: Infinity,
  });
}

export function useUserAssignments(userId: string | null) {
  return useQuery({
    queryKey: organizationKeys.userAssignments(userId ?? ""),
    queryFn: () => organizationApi.listUserAssignments(userId!),
    enabled: !!userId,
  });
}

export function useOrganizationContext() {
  return useQuery({
    queryKey: organizationKeys.context(),
    queryFn: () => organizationApi.getOrganizationContext(),
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UnitCreate) => organizationApi.createUnit(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.units(variables.organization_id),
      });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.tree(variables.organization_id),
      });
    },
  });
}

export function useUpdateUnit(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: UnitUpdate }) =>
      organizationApi.updateUnit(unitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.units(organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.tree(organizationId),
      });
    },
  });
}

export function useMoveUnit(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ unitId, parentId }: { unitId: string; parentId: string | null }) =>
      organizationApi.moveUnit(unitId, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.units(organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.tree(organizationId),
      });
    },
  });
}

export function useDeactivateUnit(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) => organizationApi.deactivateUnit(unitId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.units(organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.tree(organizationId),
      });
    },
  });
}

export function useCreateAssignment(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserAssignmentCreate) =>
      organizationApi.createUserAssignment(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.userAssignments(userId),
      });
    },
  });
}
