"use client";

import { Component, ErrorInfo, ReactNode, useContext, useState, useCallback } from "react";
import { AuthContext } from "@/contexts/auth-context";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  correlationId: string;
}

function generateCorrelationId(): string {
  return `SIP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

class ErrorBoundaryClass extends Component<{ children: ReactNode; fallback?: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    correlationId: "",
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      correlationId: `SIP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
      correlationId: `SIP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });

    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showCorrelationId?: boolean;
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  correlationId: string;
  showCorrelationId?: boolean;
  onRetry: () => void;
  onGoHome: () => void;
  onReload: () => void;
}

function ErrorFallback({
  error,
  errorInfo,
  correlationId,
  showCorrelationId = true,
  onRetry,
  onGoHome,
  onReload,
}: ErrorFallbackProps) {
  const handleGoHome = useCallback(() => {
    window.location.href = "/";
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <svg className="size-12 text-destructive mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <h1 className="text-2xl font-bold text-foreground">Algo correu mal</h1>
          <p className="text-muted-foreground mt-2">
            A aplicação encontrou um erro inesperado. A equipa técnica foi notificada automaticamente.
          </p>
        </div>

        <div
          className="flex flex-col items-center justify-center text-center p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 size-12" aria-hidden="true">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-semibold text-foreground">Erro da aplicação</h3>
              <p className="text-muted-foreground max-w-md">{error?.message ?? "Erro desconhecido"}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono px-2 py-1 bg-muted/50 rounded">
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>Ref: {correlationId}</span>
              <button
                onClick={() => navigator.clipboard.writeText(correlationId)}
                className="ml-1 hover:text-foreground transition-colors"
                aria-label="Copiar ID de correlação"
              >
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={onRetry}
            className="w-full gap-2 flex items-center justify-center px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Tentar novamente
          </button>
          <button
            onClick={onGoHome}
            className="w-full gap-2 flex items-center justify-center px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12" />
            </svg>
            Ir para o Dashboard
          </button>
          <button
            onClick={onReload}
            className="w-full gap-2 flex items-center justify-center px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Recarregar a aplicação
          </button>
        </div>

        <details className="mt-6 text-left">
          <summary className="text-sm text-muted-foreground cursor-pointer">
            Detalhes técnicos
          </summary>
          <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-auto max-h-48 font-mono text-muted-foreground">
            {error?.stack ?? "Sem stack trace disponível"}
          </pre>
          <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-auto max-h-48 font-mono text-muted-foreground">
            {errorInfo?.componentStack ?? "Sem component stack disponível"}
          </pre>
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground">
            Referência: {correlationId}
          </div>
        </details>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showCorrelationId?: boolean;
}

export function ErrorBoundary({
  children,
  fallback,
  onError,
  showCorrelationId = true,
}: ErrorBoundaryProps) {
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    correlationId: string;
  }>({
    hasError: false,
    error: null,
    errorInfo: null,
    correlationId: "",
  });

  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    const correlationId = `SIP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    setErrorState({
      hasError: true,
      error,
      errorInfo,
      correlationId,
    });

    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    onError?.(error, errorInfo);
  }, [onError]);

  const handleRetry = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
      correlationId: "",
    });
  }, []);

  if (errorState.hasError) {
    if (fallback) {
      return fallback;
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-background"
        role="alert"
        aria-live="assertive"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <svg className="size-12 text-destructive mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <h1 className="text-2xl font-bold text-foreground">Algo correu mal</h1>
            <p className="text-muted-foreground mt-2">
              A aplicação encontrou um erro inesperado. A equipa técnica foi notificada automaticamente.
            </p>
          </div>

          <div
            className="flex flex-col items-center justify-center text-center p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 size-12" aria-hidden="true">
                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>
              <div className="space-y-1 text-center">
                <h3 className="font-semibold text-foreground">Erro da aplicação</h3>
                <p className="text-muted-foreground max-w-md">{errorState.error?.message ?? "Erro desconhecido"}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono px-2 py-1 bg-muted/50 rounded">
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <span>Ref: {errorState.correlationId}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(errorState.correlationId)}
                  className="ml-1 hover:text-foreground transition-colors"
                  aria-label="Copiar ID de correlação"
                >
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleRetry}
              className="w-full gap-2 flex items-center justify-center px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full gap-2 flex items-center justify-center px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12" />
              </svg>
              Ir para o Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full gap-2 flex items-center justify-center px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Recarregar a aplicação
            </button>
          </div>

          <details className="mt-6 text-left">
            <summary className="text-sm text-muted-foreground cursor-pointer">
              Detalhes técnicos
            </summary>
            <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-auto max-h-48 font-mono text-muted-foreground">
              {errorState.error?.stack ?? "Sem stack trace disponível"}
            </pre>
            <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-auto max-h-48 font-mono text-muted-foreground">
              {errorState.errorInfo?.componentStack ?? "Sem component stack disponível"}
            </pre>
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground">
              Referência: {errorState.correlationId}
            </div>
          </details>
        </div>
      </div>
    );
  }

  if (errorState.hasError) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background" role="alert" aria-live="assertive">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <svg className="size-12 text-destructive mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <h1 className="text-2xl font-bold text-foreground">Algo correu mal</h1>
            <p className="text-muted-foreground mt-2">
              A aplicação encontrou um erro inesperado. A equipa técnica foi notificada automaticamente.
            </p>
          </div>

          <div
            className="flex flex-col items-center justify-center text-center p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 size-12" aria-hidden="true">
                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>
              <div className="space-y-1 text-center">
                <h3 className="font-semibold text-foreground">Erro da aplicação</h3>
                <p className="text-muted-foreground max-w-md">{errorState.error?.message ?? "Erro desconhecido"}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono px-2 py-1 bg-muted/50 rounded">
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <span>Ref: {errorState.correlationId}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(errorState.correlationId)}
                  className="ml-1 hover:text-foreground transition-colors"
                  aria-label="Copiar ID de correlação"
                >
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleRetry}
              className="w-full gap-2 flex items-center justify-center px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full gap-2 flex items-center justify-center px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12" />
              </svg>
              Ir para o Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full gap-2 flex items-center justify-center px-4 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Recarregar a aplicação
            </button>
          </div>

          <details className="mt-6 text-left">
            <summary className="text-sm text-muted-foreground cursor-pointer">
              Detalhes técnicos
            </summary>
            <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-auto max-h-48 font-mono text-muted-foreground">
              {errorState.error?.stack ?? "Sem stack trace disponível"}
            </pre>
            <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-auto max-h-48 font-mono text-muted-foreground">
              {errorState.errorInfo?.componentStack ?? "Sem component stack disponível"}
            </pre>
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground">
              Referência: {errorState.correlationId}
            </div>
          </details>
        </div>
      </div>
    );
  }

  return children;
}

export function useErrorHandler() {
  return {
    captureError: (error: Error) => {
      console.error("Captured error:", error);
    },
  };
}