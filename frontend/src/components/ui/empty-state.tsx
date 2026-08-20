"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  Search,
  ShieldAlert,
  FileText,
  Users,
  FolderOpen,
  AlertCircle,
  Info,
  HelpCircle,
  Plus,
  Filter,
  RefreshCw,
  Settings,
} from "lucide-react";

export type EmptyStateVariant =
  | "no-data"
  | "no-results"
  | "no-results-filter"
  | "no-permission"
  | "error"
  | "no-connection"
  | "loading"
  | "first-visit";

interface EmptyStateConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  variant?: "default" | "warning" | "destructive";
}

const EMPTY_STATE_CONFIGS: Record<EmptyStateVariant, EmptyStateConfig> = {
  "no-data": {
    icon: <Inbox className="size-12 text-muted-foreground/50" />,
    title: "Nenhum registo encontrado",
    description: "Ainda não existem registos para apresentar.",
    actionLabel: "Criar primeiro",
    actionIcon: <Plus className="size-4" />,
  },
  "no-results": {
    icon: <Search className="size-12 text-muted-foreground/50" />,
    title: "Nenhum resultado",
    description: "A pesquisa não retornou resultados. Tente alterar os termos.",
    actionLabel: "Limpar pesquisa",
    actionIcon: <RefreshCw className="size-4" />,
  },
  "no-results-filter": {
    icon: <Filter className="size-12 text-muted-foreground/50" />,
    title: "Nenhum resultado com os filtros atuais",
    description: "Tente ajustar ou remover alguns filtros para ver mais resultados.",
    actionLabel: "Limpar filtros",
    actionIcon: <Filter className="size-4" />,
    variant: "warning",
  },
  "no-permission": {
    icon: <ShieldAlert className="size-12 text-muted-foreground/50" />,
    title: "Sem permissão de acesso",
    description: "Não tem autorização para visualizar este conteúdo. Contacte o administrador se precisar de acesso.",
    actionLabel: "Contactar administrador",
    actionIcon: <Settings className="size-4" />,
    variant: "destructive",
  },
  error: {
    icon: <AlertCircle className="size-12 text-destructive/50" />,
    title: "Ocorreu um erro",
    description: "Não foi possível carregar os dados. Tente novamente mais tarde.",
    actionLabel: "Tentar novamente",
    actionIcon: <RefreshCw className="size-4" />,
    variant: "destructive",
  },
  "no-connection": {
    icon: <Info className="size-12 text-warning/50" />,
    title: "Sem ligação",
    description: "Verifique a sua ligação à internet e tente novamente.",
    actionLabel: "Tentar novamente",
    actionIcon: <RefreshCw className="size-4" />,
    variant: "warning",
  },
  loading: {
    icon: <HelpCircle className="size-12 text-muted-foreground/50" animate-spin />,
    title: "A carregar...",
    description: "Por favor aguarde enquanto carregamos os dados.",
  },
  "first-visit": {
    icon: <FileText className="size-12 text-muted-foreground/50" />,
    title: "Bem-vindo",
    description: "Comece por criar o seu primeiro registo ou explore as funcionalidades disponíveis.",
    actionLabel: "Começar",
    actionIcon: <Plus className="size-4" />,
  },
};

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
}

export function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  icon,
  className,
  size = "default",
  fullWidth = true,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIGS[variant];

  const resolvedIcon = icon ?? config.icon;
  const resolvedTitle = title ?? config.title;
  const resolvedDescription = description ?? config.description;
  const resolvedActionLabel = actionLabel ?? config.actionLabel;
  const resolvedActionIcon = actionIcon ?? config.actionIcon;
  const resolvedVariant = config.variant ?? "default";

  const sizeClasses = {
    sm: "p-4 gap-2 text-sm",
    default: "p-6 gap-3",
    lg: "p-8 gap-4 text-lg",
  };

  const iconSizes = {
    sm: "size-8",
    default: "size-12",
    lg: "size-16",
  };

  const textSizes = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        fullWidth && "w-full",
        resolvedVariant === "warning" && "bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800",
        resolvedVariant === "destructive" && "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800",
        "rounded-xl border-border",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn("flex flex-col items-center gap-3", textSizes[size])}>
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted/50",
            iconSizes[size],
            config.variant === "warning" && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300",
            config.variant === "destructive" && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
          )}
          aria-hidden="true"
        >
          {resolvedIcon}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">{title ?? config.title}</h3>
          <p className="text-muted-foreground max-w-md">{description ?? config.description}</p>
        </div>
        {resolvedActionLabel && onAction && (
          <Button
            variant={resolvedVariant === "destructive" ? "destructive" : resolvedVariant === "warning" ? "outline" : "default"}
            size="sm"
            onClick={onAction}
            className="mt-2 gap-1.5"
          >
            {resolvedActionIcon}
            {resolvedActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Predefined empty states for common scenarios
 */
export const EmptyStates = {
  noProcessos: () => <EmptyState variant="no-data" actionLabel="Criar processo" onAction={() => {}} />,
  noDocumentos: () => <EmptyState variant="no-data" actionLabel="Criar documento" onAction={() => {}} />,
  noPessoas: () => <EmptyState variant="no-data" actionLabel="Adicionar pessoa" onAction={() => {}} />,
  noUnidades: () => <EmptyState variant="no-data" actionLabel="Criar unidade" onAction={() => {}} />,
  noUtilizadores: () => <EmptyState variant="no-data" actionLabel="Adicionar utilizador" onAction={() => {}} />,
  noNotificacoes: () => <EmptyState variant="no-data" title="Nenhuma notificação" description="Todas as notificações foram lidas." />,
  noResultadosPesquisa: (onClear?: () => void) => (
    <EmptyState variant="no-results" actionLabel="Limpar pesquisa" onAction={onClear} />
  ),
  noResultadosFiltro: (onClear?: () => void) => (
    <EmptyState variant="no-results-filter" actionLabel="Limpar filtros" onAction={onClear} />
  ),
  semPermissao: (onContact?: () => void) => (
    <EmptyState variant="no-permission" actionLabel="Contactar administrador" onAction={onContact} />
  ),
  erroCarregar: (onRetry?: () => void) => (
    <EmptyState variant="error" actionLabel="Tentar novamente" onAction={onRetry} />
  ),
  semLigacao: (onRetry?: () => void) => (
    <EmptyState variant="no-connection" actionLabel="Tentar novamente" onAction={onRetry} />
  ),
  primeiraVisita: (onStart?: () => void) => (
    <EmptyState variant="first-visit" actionLabel="Começar" onAction={onStart} />
  ),
};