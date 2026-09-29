import { cn } from "@/lib/utils";

type DotColor = "green" | "gray" | "blue" | "amber";

const COLOR_CLASSES: Record<DotColor, { wrapper: string; dot: string }> = {
  green: {
    wrapper: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  gray: {
    wrapper: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  blue: {
    wrapper: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  amber: {
    wrapper: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
};

function statusToColor(status: string): DotColor {
  if (!status) return "gray";
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "CURRENT":
      return "green";
    case "INACTIVE":
      return "gray";
    case "GRADUATED":
    case "COMPLETED":
      return "blue";
    case "UPCOMING":
      return "amber";
    default:
      return "gray";
  }
}

function formatLabel(status: string): string {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface StatusDotBadgeProps {
  status: string;
  /** Override the derived label (e.g. "Active" for a live indicator). */
  label?: string;
  className?: string;
}

export function StatusDotBadge({ status, label, className }: StatusDotBadgeProps) {
  const colors = COLOR_CLASSES[statusToColor(status)];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colors.wrapper,
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", colors.dot)} />
      {label ?? formatLabel(status)}
    </span>
  );
}
