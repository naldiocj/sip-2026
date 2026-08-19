import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/users-api";

export const usersKeys = {
  all: ["users"] as const,
  list: (search?: string) => [...usersKeys.all, "list", search ?? ""] as const,
};

export function useUsers(search?: string) {
  return useQuery({
    queryKey: usersKeys.list(search),
    queryFn: () => usersApi.list(search),
    staleTime: 30_000,
  });
}