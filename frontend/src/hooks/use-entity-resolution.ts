"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface EntityResolution {
  id: string;
  label: string;
  type: string;
}

/**
 * Resolve uma entidade dinâmica pelo ID.
 * Endpoints esperados:
 * - GET /api/v1/processos/{id}
 * - GET /api/v1/documentos/{id}
 * - GET /api/v1/pessoas/{id}
 * etc.
 */
export function useEntityResolution(entityType: string, id: string | undefined) {
  return useQuery({
    queryKey: ["entity", entityType, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get<EntityResolution>(`/api/v1/${entityType}/${id}`);
      return response;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}