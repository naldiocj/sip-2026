"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type SystemStatus = "online" | "degraded" | "offline";

/**
 * Obtém o estado do sistema.
 * Endpoint: GET /api/v1/health/system
 */
export function useSystemStatus(): { status: SystemStatus; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useQuery({
    queryKey: ["system", "status"],
    queryFn: async () => {
      const response = await apiClient.get<{ status: SystemStatus }>("/api/v1/health/system");
      return response.status;
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
    retry: 3,
  });

  return { status: data ?? "offline", isLoading, error: error as Error | null };
}