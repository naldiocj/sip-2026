"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, XCircle, PauseCircle, RotateCcw, ArrowRight, Archive, Hourglass, AlertTriangle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

export interface StatusConfig {
  label: string;
  variant: "default" | "success" | "warning" | "destructive" | "info" | "secondary";
  icon?: React.ReactNode;
  description?: string;
}

export const SIP_STATUS_CONFIG: Record<string, StatusConfig> = {
  // Process statuses
  RECEBIDO: { label: "Recebido", variant: "info", icon: <InboxIcon />, description: "Processo recebido e aguardando triagem" },
  EM_ANALISE: { label: "Em análise", variant: "warning", icon: <SearchIcon />, description: "Processo em análise preliminar" },
  EM_INSTRUCAO: { label: "Em instrução", variant: "default", icon: <FileTextIcon />, description: "Processo em fase de instrução" },
  AGUARDANDO_DESPACHO: { label: "Aguardando despacho", variant: "warning", icon: <ClockIcon />, description: "Aguardando despacho superior" },
  DESPACHADO: { label: "Despachado", variant: "success", icon: <CheckCircleIcon />, description: "Processo despachado" },
  CONCLUIDO: { label: "Concluído", variant: "success", icon: <CheckCircleIcon />, description: "Processo concluído" },
  ARQUIVADO: { label: "Arquivado", variant: "secondary", icon: <ArchiveIcon />, description: "Processo arquivado" },
  SUSPENSO: { label: "Suspenso", variant: "destructive", icon: <PauseCircleIcon />, description: "Processo suspenso" },
  REABERTO: { label: "Reaberto", variant: "info", icon: <RotateCcwIcon />, description: "Processo reaberto" },
  DEVOLVIDO: { label: "Devolvido", variant: "destructive", icon: <ArrowRightIcon />, description: "Processo devolvido para correção" },
  TRANSFERIDO: { label: "Transferido", variant: "info", icon: <ArrowRightIcon />, description: "Processo transferido para outra unidade" },

  // Document statuses
  RASCUNHO: { label: "Rascunho", variant: "secondary", icon: <FileTextIcon />, description: "Documento em rascunho" },
  EM_REVISAO: { label: "Em revisão", variant: "warning", icon: <SearchIcon />, description: "Documento em revisão" },
  APROVADO: { label: "Aprovado", variant: "success", icon: <CheckCircleIcon />, description: "Documento aprovado" },
  REJEITADO: { label: "Rejeitado", variant: "destructive", icon: <XCircleIcon />, description: "Documento rejeitado" },
  PUBLICADO: { label: "Publicado", variant: "success", icon: <CheckCircleIcon />, description: "Documento publicado" },
  EXPIRADO: { label: "Expirado", variant: "destructive", icon: <AlertTriangleIcon />, description: "Documento expirado" },

  // Person statuses
  ATIVO: { label: "Ativo", variant: "success", icon: <UserCheckIcon />, description: "Pessoa ativa" },
  INATIVO: { label: "Inativo", variant: "secondary", icon: <UserXIcon />, description: "Pessoa inativa" },
  BLOQUEADO: { label: "Bloqueado", variant: "destructive", icon: <UserXIcon />, description: "Pessoa bloqueada" },
  SUSPENSO_PESSOA: { label: "Suspenso", variant: "destructive", icon: <PauseCircleIcon />, description: "Pessoa suspensa" },
  PENDENTE: { label: "Pendente", variant: "warning", icon: <HourglassIcon />, description: "Pessoa pendente de ativação" },

  // Generic statuses
  ABERTO: { label: "Aberto", variant: "info", icon: <AlertCircleIcon />, description: "Item aberto" },
  FECHADO: { label: "Fechado", variant: "success", icon: <CheckCircleIcon />, description: "Item fechado" },
  CANCELADO: { label: "Cancelado", variant: "destructive", icon: <XCircleIcon />, description: "Item cancelado" },
  EM_ANDAMENTO: { label: "Em andamento", variant: "default", icon: <ClockIcon />, description: "Item em andamento" },
  AGUARDANDO: { label: "Aguardando", variant: "warning", icon: <ClockIcon />, description: "Aguardando ação" },
};

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        destructive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.625rem] gap-1",
        default: "px-2.5 py-0.5 text-xs gap-1.5",
        lg: "px-3 py-1 text-sm gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  variant?: VariantProps<typeof statusBadgeVariants>["variant"];
  size?: VariantProps<typeof statusBadgeVariants>["size"];
  showIcon?: boolean;
  showLabel?: boolean;
  tooltip?: string;
  fallbackVariant?: VariantProps<typeof statusBadgeVariants>["variant"];
}

export function StatusBadge({
  status,
  variant,
  size = "default",
  showIcon = true,
  showLabel = true,
  tooltip,
  fallbackVariant = "default",
  className,
  ...props
}: StatusBadgeProps) {
  const config = SIP_STATUS_CONFIG[status];
  const resolvedVariant = variant ?? config?.variant ?? fallbackVariant;
  const resolvedLabel = config?.label ?? status;
  const resolvedIcon = config?.icon;
  const resolvedDescription = config?.description ?? tooltip;

  const badgeContent = (
    <>
      {showIcon && resolvedIcon && <span aria-hidden="true">{resolvedIcon}</span>}
      {showLabel && <span>{resolvedLabel}</span>}
    </>
  );

  return (
    <span
      className={cn(statusBadgeVariants({ variant: resolvedVariant, size }), className)}
      title={resolvedDescription}
      {...props}
    >
      {badgeContent}
    </span>
  );
}

// Icon components (inline to avoid extra imports)
function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 13v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1" />
      <path d="m3 10 9-9 9 9" />
      <rect x="3" y="10" width="18" height="8" rx="1" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 12h10" />
      <path d="M7 7h10" />
      <path d="M7 17h10" />
    </svg>
  );
}

function PauseCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="10" x2="14" y1="12" y2="12" />
    </svg>
  );
}

function RotateCcwIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function UserCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="17 11 19 13 22 10" />
    </svg>
  );
}

function UserXIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" x2="22" y1="11" y2="16" />
      <line x1="22" x2="17" y1="11" y2="16" />
    </svg>
  );
}

function HourglassIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 1 7 17.172V22" />
      <path d="M7 2v4.172a2 2 0 0 1-.586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.828V2" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L21.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("size-3.5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" x2="9" y1="9" y2="15" />
      <line x1="9" x2="15" y1="9" y2="15" />
    </svg>
  );
}