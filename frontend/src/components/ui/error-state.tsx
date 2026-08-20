"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, AlertTriangle, XCircle, Info, WifiOff, Server } from "lucide-react";

export type ErrorType =
  | "generic"
  | "network"
  | "permission"
  | "not-found"
  | "validation"
  | "server"
  | "unauthorized"
  | "forbidden";

export interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  correlationId?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showCorrelationId?: boolean;
  showActions?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export interface InlineErrorProps {
  message: string;
  className?: string;
}

const ERROR_CONFIGS: Record<ErrorType, { icon: React.ReactNode; defaultTitle: string; defaultMessage: string; variant: "destructive" | "warning" | "info" }> = {
  generic: {
    icon: <AlertCircle className="size-6" />,
    defaultTitle: "Ocorreu um erro",
    defaultMessage: "Algo correu mal. Tente novamente mais tarde.",
    variant: "destructive",
  },
  network: {
    icon: <WifiOff className="size-6" />,
    defaultTitle: "Erro de ligação",
    defaultMessage: "Não foi possível ligar ao servidor. Verifique a sua ligação à internet.",
    variant: "warning",
  },
  permission: {
    icon: <AlertTriangle className="size-6" />,
    defaultTitle: "Acesso negado",
    defaultMessage: "Não tem permissão para realizar esta ação.",
    variant: "destructive",
  },
  "not-found": {
    icon: <Info className="size-6" />,
    defaultTitle: "Não encontrado",
    defaultMessage: "O recurso solicitado não foi encontrado.",
    variant: "warning",
  },
  validation: {
    icon: <AlertTriangle className="size-6" />,
    defaultTitle: "Dados inválidos",
    defaultMessage: "Verifique os dados introduzidos e tente novamente.",
    variant: "warning",
  },
  server: {
    icon: <Server className="size-6" />,
    defaultTitle: "Erro do servidor",
    defaultMessage: "Ocorreu um erro interno. A equipa técnica foi notificada.",
    variant: "destructive",
  },
  unauthorized: {
    icon: <XCircle className="size-6" />,
    defaultTitle: "Sessão expirada",
    defaultMessage: "A sua sessão expirou. Por favor, inicie sessão novamente.",
    variant: "destructive",
  },
  forbidden: {
    icon: <AlertTriangle className="size-6" />,
    defaultTitle: "Acesso proibido",
    defaultMessage: "Não tem autorização para aceder a este recurso.",
    variant: "destructive",
  },
};

export function ErrorState({
  type = "generic",
  title,
  message,
  correlationId,
  onRetry,
  onDismiss,
  showCorrelationId = true,
  showActions = true,
  className,
  size = "default",
}: ErrorStateProps) {
  const config = ERROR_CONFIGS[type];

  const resolvedTitle = title ?? config.defaultTitle;
  const resolvedMessage = message ?? config.defaultMessage;
  const resolvedVariant = config.variant;

  const sizeClasses = {
    sm: "p-3 gap-2 text-sm",
    default: "p-4 gap-3",
    lg: "p-6 gap-4 text-lg",
  };

  const iconSizes = {
    sm: "size-4",
    default: "size-6",
    lg: "size-8",
  };

  const textSizes = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg",
  };

  const variantStyles = {
    destructive: "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800",
    warning: "bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800",
    info: "bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-xl border",
        variantStyles[config.variant],
        sizeClasses[size],
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted/50 size-10",
            config.variant === "destructive" && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300",
            config.variant === "warning" && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300",
            config.variant === "info" && "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          )}
          aria-hidden="true"
        >
          {config.icon}
        </div>
        <div className="space-y-1 text-center">
          <h3 className="font-semibold text-foreground">{title ?? config.defaultTitle}</h3>
          <p className="text-muted-foreground max-w-md">{message ?? config.defaultMessage}</p>
        </div>
        {showCorrelationId && correlationId && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono px-2 py-1 bg-muted/50 rounded">
            <Info className="size-3" aria-hidden="true" />
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
        )}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md mt-2">
            {onRetry && (
              <Button variant="default" size="sm" onClick={onRetry} className="gap-1.5 flex-1">
                <RefreshCw className="size-4" />
                Tentar novamente
              </Button>
            )}
            {onDismiss && (
              <Button variant="outline" size="sm" onClick={onDismiss} className="gap-1.5 flex-1">
                <XCircle className="size-4" />
                Dispensar
              </Button>
            )}
            {!onRetry && !onDismiss && (
              <Button variant="default" size="sm" onClick={() => window.location.reload()} className="gap-1.5 flex-1">
                <RefreshCw className="size-4" />
                Recarregar página
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Inline error state for forms and components
 */
export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm",
        className
      )}
      role="alert"
    >
      <AlertCircle className="size-4 flex-shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

/**
 * Toast error notification
 */
interface ToastErrorProps {
  message: string;
  correlationId?: string;
  onDismiss?: () => void;
  duration?: number;
}

export function ToastError({ message, correlationId, onDismiss, duration = 5000 }: ToastErrorProps) {
  // This would integrate with sonner or similar toast library
  // For now, return null as placeholder
  return null;
}