"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export interface RetryActionProps {
  onRetry: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
  loadingText?: string;
  errorText?: string;
  successText?: string;
  className?: string;
}

export function RetryAction({
  onRetry,
  maxRetries = 3,
  retryDelay = 1000,
  onSuccess,
  onError,
  children,
  loadingText = "A tentar novamente...",
  errorText = "Falha após várias tentativas",
  successText = "Operação concluída",
  className,
}: RetryActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRetry = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setLastError(null);
    setIsSuccess(false);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      setRetryCount(attempt);
      try {
        await onRetry();
        setIsSuccess(true);
        setIsLoading(false);
        onSuccess?.();
        return;
      } catch (error) {
        setLastError(error instanceof Error ? error : new Error(String(error)));
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    setIsLoading(false);
    onError?.(lastError ?? new Error("Erro desconhecido"));
  }, [onRetry, maxRetries, retryDelay, onSuccess, onError]);

  const handleReset = () => {
    setRetryCount(0);
    setLastError(null);
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 text-green-700 dark:text-green-400" role="status">
        <CheckCircle className="size-4" aria-hidden="true" />
        <span>{successText}</span>
        <Button variant="ghost" size="sm" onClick={handleReset} className="ml-2">
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <div className={className} role="alert">
      {isLoading && (
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
          <span>{loadingText} (tentativa {retryCount} de {maxRetries})</span>
        </div>
      )}

      {lastError && !isLoading && (
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span>{errorText}</span>
          {retryCount < maxRetries && (
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2 gap-1">
              <RefreshCw className="size-3" />
              Tentar novamente
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleReset} className="ml-2 gap-1">
            <XCircle className="size-3" />
            Dispensar
          </Button>
        </div>
      )}

      {!isLoading && !isSuccess && !lastError && (
        <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1">
          <RefreshCw className="size-4" />
          Tentar
        </Button>
      )}
    </div>
  );
}

/**
 * Hook for retry logic
 */
export function useRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  action: T,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      if (isLoading) return;

      setIsLoading(true);
      setLastError(null);
      setIsSuccess(false);

      const { maxRetries = 3, retryDelay = 1000, onSuccess, onError } = options;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        setRetryCount(attempt);
        try {
          const result = await action(...args);
          setIsSuccess(true);
          setIsLoading(false);
          onSuccess?.();
          return result;
        } catch (error) {
          setLastError(error instanceof Error ? error : new Error(String(error)));
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
          }
        }
      }

      setIsLoading(false);
      onError?.(lastError ?? new Error("Erro desconhecido"));
      return undefined;
    },
    [action, options.maxRetries, options.retryDelay, options.onSuccess, options.onError]
  );

  const reset = useCallback(() => {
    setRetryCount(0);
    setLastError(null);
    setIsSuccess(false);
  }, []);

  return {
    execute,
    reset,
    isLoading,
    retryCount,
    lastError,
    isSuccess,
  };
}