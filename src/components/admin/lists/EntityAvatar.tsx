import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-red-500/15 text-red-700 dark:text-red-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-lime-500/15 text-lime-700 dark:text-lime-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface EntityAvatarProps {
  name: string;
  /** Square blocks work well for codes (e.g. subject codes); circles for people. */
  shape?: "circle" | "square";
  /** Override the derived initials (e.g. a short subject code). */
  initials?: string;
  className?: string;
}

export function EntityAvatar({ name, shape = "circle", initials, className }: EntityAvatarProps) {
  const color = PALETTE[hashString(name || "?") % PALETTE.length];
  return (
    <div
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 select-none items-center justify-center text-xs font-semibold uppercase tracking-wide",
        shape === "square" ? "rounded-lg" : "rounded-full",
        color,
        className,
      )}
    >
      {initials ?? getInitials(name || "?")}
    </div>
  );
}
