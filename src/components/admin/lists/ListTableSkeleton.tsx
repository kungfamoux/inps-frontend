import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListTableSkeletonProps {
  rows?: number;
  className?: string;
}

export function ListTableSkeleton({ rows = 6, className }: ListTableSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border shadow-sm", className)}>
      <div className="flex items-center gap-4 border-b bg-muted/50 px-4 py-3">
        {[45, 25, 15].map((width, i) => (
          <Skeleton key={i} className="h-3.5" style={{ width: `${width}%` }} />
        ))}
        <Skeleton className="ml-auto h-3.5 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-4 px-4 py-3.5",
            i !== rows - 1 && "border-b",
            i % 2 === 1 && "bg-muted/30",
          )}
        >
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3 max-w-48" />
            <Skeleton className="h-3 w-1/4 max-w-32" />
          </div>
          <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
          <Skeleton className="size-8 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
