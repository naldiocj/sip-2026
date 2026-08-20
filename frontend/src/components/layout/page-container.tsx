import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutList, LayoutGrid, Settings, Filter, Search, ChevronDown } from "lucide-react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6", className)}>
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
      <div className="space-y-1">
        <h2 className="sip-section">{title}</h2>
        {description && <p className="sip-description">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({ children, className }: ContentSectionProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function ContentCard({ children, className, header, footer }: ContentCardProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-sm", className)}>
      {header && <div className="p-4 border-b border-border">{header}</div>}
      <div className="p-4">{children}</div>
      {footer && <div className="p-4 border-t border-border bg-muted/30">{footer}</div>}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  status?: { label: string; variant?: "default" | "success" | "warning" | "destructive" | "info" };
  actions?: React.ReactNode; // alias for primaryActions (backward compat)
  primaryActions?: React.ReactNode;
  moreActions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  status,
  actions,
  primaryActions,
  moreActions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  const effectivePrimaryActions = primaryActions ?? actions;
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {breadcrumb && <div className="w-full">{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="sip-page-title truncate">{title}</h1>
            {status && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                status.variant === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                status.variant === "warning" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                status.variant === "destructive" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                status.variant === "info" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                "bg-muted text-muted-foreground"
              }`}>
                {status.label}
              </span>
            )}
          </div>
          {description && <p className="sip-description truncate">{description}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {effectivePrimaryActions && <div className="flex items-center gap-2">{effectivePrimaryActions}</div>}
          {moreActions && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                {/* @ts-expect-error - base-ui render prop type mismatch */}
                {({ open }: { open: boolean }) => (
                  <Button variant="outline" size="sm" className="gap-1" aria-expanded={open}>
                    <Settings className="mr-1.5 size-4" />
                    <span className="hidden sm:inline">Mais ações</span>
                    <ChevronDown className="size-3.5 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {moreActions}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}

interface PageToolbarProps {
  filters?: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  showDensityToggle?: boolean;
  density?: "comfortable" | "compact" | "dense";
  onDensityChange?: (density: "comfortable" | "compact" | "dense") => void;
  showViewToggle?: boolean;
  viewMode?: "list" | "grid" | "table";
  onViewModeChange?: (mode: "list" | "grid" | "table") => void;
  className?: string;
}

export function PageToolbar({
  filters,
  searchPlaceholder = "Pesquisar...",
  onSearch,
  showDensityToggle = true,
  density = "comfortable",
  onDensityChange,
  showViewToggle = false,
  viewMode = "table",
  onViewModeChange,
  className,
}: PageToolbarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3 bg-muted/30 rounded-lg border border-border", className)}>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1">
        {filters && <div className="flex items-center gap-2">{filters}</div>}
        {onSearch && (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {showDensityToggle && onDensityChange && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              {/* @ts-expect-error - base-ui render prop type mismatch */}
              {({ open }: { open: boolean }) => (
                <Button variant="outline" size="sm" className="gap-1" aria-expanded={open}>
                  <Filter className="size-3.5" />
                  <span className="hidden sm:inline">Densidade</span>
                  <ChevronDown className="size-3.5 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDensityChange("comfortable")}
                className={density === "comfortable" ? "bg-primary text-primary-foreground" : ""}
              >
                Confortável
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDensityChange("compact")}
                className={density === "compact" ? "bg-primary text-primary-foreground" : ""}
              >
                Compacta
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDensityChange("dense")}
                className={density === "dense" ? "bg-primary text-primary-foreground" : ""}
              >
                Densa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {showViewToggle && onViewModeChange && (
          <div className="flex border border-border rounded-md">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("table")}
              aria-label="Visualização em tabela"
            >
              <LayoutList className="size-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("grid")}
              aria-label="Visualização em grelha"
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}