import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { personApi } from "@/lib/person-api";
import type {
  PersonCreate,
  PersonListParams,
  PersonUpdate,
} from "@/lib/person-types";

export const personKeys = {
  all: ["person"] as const,
  list: (params: PersonListParams) => [...personKeys.all, "list", params] as const,
  detail: (personId: string) => [...personKeys.all, "detail", personId] as const,
};

export function usePeople(params: PersonListParams) {
  return useQuery({
    queryKey: personKeys.list(params),
    queryFn: () => personApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function usePerson(personId: string | null) {
  return useQuery({
    queryKey: personKeys.detail(personId ?? ""),
    queryFn: () => personApi.get(personId!),
    enabled: !!personId,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PersonCreate) => personApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
}

export function useUpdatePerson(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PersonUpdate) => personApi.update(personId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
}

export function useDeactivatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (personId: string) => personApi.deactivate(personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
}