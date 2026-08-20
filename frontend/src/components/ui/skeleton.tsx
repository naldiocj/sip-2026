import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-2xl bg-muted", className)}
      {...props}
    />
  )
}

/**
 * TableSkeleton - Simulates a table with header and rows
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, showHeader = true, className }: TableSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {showHeader && (
        <div className="flex gap-4 px-4 py-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full max-w-[150px]" />
          ))}
        </div>
      )}
      <div className="space-y-1">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 px-4 py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4 w-full"
                style={{ width: colIndex === 0 ? "150px" : colIndex === columns - 1 ? "100px" : "100%" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * FormSkeleton - Simulates a form with fields
 */
interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export function FormSkeleton({ fields = 6, className }: FormSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton className="h-4 w-1/4 max-w-[200px]" />
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * CardSkeleton - Simulates a card with header, content, and footer
 */
interface CardSkeletonProps {
  hasHeader?: boolean;
  hasFooter?: boolean;
  contentLines?: number;
  className?: string;
}

export function CardSkeleton({ hasHeader = true, hasFooter = false, contentLines = 3, className }: CardSkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 space-y-4", className)}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 ml-auto" />
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" style={{ width: i === contentLines - 1 ? "60%" : "100%" }} />
        ))}
      </div>
      {hasFooter && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      )}
    </div>
  );
}

/**
 * DashboardSkeleton - Simulates a dashboard with stats cards and charts
 */
interface DashboardSkeletonProps {
  statCards?: number;
  chartHeight?: number;
  className?: string;
}

export function DashboardSkeleton({ statCards = 4, chartHeight = 300, className }: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: statCards }).map((_, i) => (
          <CardSkeleton key={i} hasHeader={false} contentLines={2} className="h-24" />
        ))}
      </div>
      <CardSkeleton hasHeader contentLines={2} className="h-[calc(${chartHeight}px+80px)]" />
    </div>
  );
}

/**
 * DetailsSkeleton - Simulates a detail view with key-value pairs
 */
interface DetailsSkeletonProps {
  sections?: number;
  fieldsPerSection?: number;
  className?: string;
}

export function DetailsSkeleton({ sections = 3, fieldsPerSection = 4, className }: DetailsSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          <Skeleton className="h-5 w-1/3 max-w-[200px]" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: fieldsPerSection }).map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-1">
                <Skeleton className="h-3 w-1/2 max-w-[150px]" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * TimelineSkeleton - Simulates a timeline with events
 */
interface TimelineSkeletonProps {
  items?: number;
  className?: string;
}

export function TimelineSkeleton({ items = 5, className }: TimelineSkeletonProps) {
  return (
    <div className={cn("relative pl-4 border-l border-border space-y-6", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="relative flex gap-4">
          <div className="relative flex-shrink-0 w-6 h-6">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-muted" />
            {i < items - 1 && (
              <div className="absolute left-1/2 top-6 bottom-0 w-0.5 bg-border -translate-x-1/2" />
            )}
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-1/4 max-w-[200px]" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton }