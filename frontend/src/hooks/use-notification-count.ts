"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/**
 * Obtém a contagem de notificações não lidas.
 * Endpoint: GET /api/v1/notifications/unread-count
 */
export function useNotificationCount(): { count: number; isLoading: boolean; error: Error | null } {
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await apiClient.get<{ count: number }>("/api/v1/notifications/unread-count");
      return response.count;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });

  return { count: data ?? 0, isLoading, error: error as Error | null };
}