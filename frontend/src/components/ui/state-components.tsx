import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export function LoadingState({ message = "A carregar...", rows = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label={message}>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-center"
    >
      {Icon && <Icon className="mb-3 size-10 text-muted-foreground/50" />}
      <h3 className="text-sm font-medium">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button className="mt-4" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Ocorreu um erro ao carregar os dados.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-md border border-destructive/30 bg-destructive/5 py-12 text-center"
    >
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCwIcon className="mr-1.5 size-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

interface ForbiddenStateProps {
  message?: string;
}

export function ForbiddenState({
  message = "Não tem permissão para aceder a este recurso.",
}: ForbiddenStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-center"
    >
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
