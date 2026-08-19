"use client";

import { useEffect, useState } from "react";

/**
 * Obtém a contagem de ocorrências abertas para o badge da barra lateral.
 * TODO: O endpoint GET /api/v1/ocorrencias/count?status=aberta ainda não está disponível.
 * Descomentar e ligar a apiClient.get() assim que o módulo de ocorrências do backend for implementado.
 */
export function useOcorrenciasCount(): number {
  const [count] = useState(0);

  useEffect(() => {
    // TODO: descomentar quando o backend estiver pronto
    // const data = await apiClient.get<{ count: number }>("/api/v1/ocorrencias/count");
    // setCount(data.count);
  }, []);

  return count;
}

/**
 * Obtém a contagem de pessoas detidas para o badge da barra lateral.
 * TODO: O endpoint GET /api/v1/detidos/count?status=ativo ainda não está disponível.
 * Descomentar e ligar a apiClient.get() assim que o módulo de detidos do backend for implementado.
 */
export function useDetidosCount(): number {
  const [count] = useState(0);

  useEffect(() => {
    // TODO: descomentar quando o backend estiver pronto
    // const data = await apiClient.get<{ count: number }>("/api/v1/detidos/count");
    // setCount(data.count);
  }, []);

  return count;
}

/**
 * Obtém a contagem de notificações não lidas para o badge da barra lateral.
 * TODO: O endpoint GET /api/v1/notificacoes/count?read=false ainda não está disponível.
 * Descomentar e ligar a apiClient.get() assim que o módulo de notificações do backend for implementado.
 */
export function useNotificacoesCount(): number {
  const [count] = useState(0);

  useEffect(() => {
    // TODO: descomentar quando o backend estiver pronto
    // const data = await apiClient.get<{ count: number }>("/api/v1/notificacoes/count");
    // setCount(data.count);
  }, []);

  return count;
}
