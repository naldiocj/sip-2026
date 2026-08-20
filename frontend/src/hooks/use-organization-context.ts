"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface OrganizationContext {
  id: string;
  name: string;
  path: string;
  unit?: string;
  direction?: string;
  department?: string;
  section?: string;
}

/**
 * Obtém o contexto organizacional ativo do utilizador.
 * Endpoint: GET /api/v1/users/me/organization-context
 */
export function useOrganizationContext(): { organizationContext: OrganizationContext | null; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", "organization-context"],
    queryFn: async () => {
      const response = await apiClient.get<OrganizationContext>("/api/v1/users/me/organization-context");
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return { organizationContext: data ?? null, isLoading, error: error as Error | null };
}