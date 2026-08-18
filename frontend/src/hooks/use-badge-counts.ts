"use client";

import { useEffect, useState } from "react";

/**
 * Fetches the count of open ocorrências for sidebar badge.
 * TODO: Endpoint GET /api/v1/ocorrencias/count?status=aberta not yet available.
 * Uncomment and wire to apiClient.get() once the backend ocorrências module is implemented.
 */
export function useOcorrenciasCount(): number {
  const [count] = useState(0);

  useEffect(() => {
    // TODO: uncomment when backend is ready
    // const data = await apiClient.get<{ count: number }>("/api/v1/ocorrencias/count");
    // setCount(data.count);
  }, []);

  return count;
}

/**
 * Fetches the count of currently detained persons for sidebar badge.
 * TODO: Endpoint GET /api/v1/detidos/count?status=ativo not yet available.
 * Uncomment and wire to apiClient.get() once the backend detidos module is implemented.
 */
export function useDetidosCount(): number {
  const [count] = useState(0);

  useEffect(() => {
    // TODO: uncomment when backend is ready
    // const data = await apiClient.get<{ count: number }>("/api/v1/detidos/count");
    // setCount(data.count);
  }, []);

  return count;
}

/**
 * Fetches the count of unread notifications for sidebar badge.
 * TODO: Endpoint GET /api/v1/notificacoes/count?read=false not yet available.
 * Uncomment and wire to apiClient.get() once the backend notifications module is implemented.
 */
export function useNotificacoesCount(): number {
  const [count] = useState(0);

  useEffect(() => {
    // TODO: uncomment when backend is ready
    // const data = await apiClient.get<{ count: number }>("/api/v1/notificacoes/count");
    // setCount(data.count);
  }, []);

  return count;
}
