import {
  ChevronLeft,
  LayoutDashboard,
  Settings,
  UsersRound,
  WalletCards,
  BookOpen,
  Bell,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SchoolLogo } from "@/components/shared/SchoolLogo";

const navigation = [
  { label: "Dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
  { label: "Children", href: "/parent/children", icon: UsersRound },
  { label: "Announcements", href: "/parent/announcements", icon: Bell },
  { label: "Fees", href: "/parent/fees", icon: WalletCards },
  { label: "Results", href: "/parent/results", icon: BookOpen },
  { label: "Settings", href: "/parent/settings", icon: Settings },
];

interface ParentSidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  onNavigate?: () => void;
}

export function ParentSidebar({ collapsed = false, onCollapse, onNavigate }: ParentSidebarProps) {
  return (
    <aside className="flex h-full flex-col bg-primary text-primary-foreground">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <SchoolLogo size="medium" variant={collapsed ? "icon" : "full"} showBackground backgroundClassName="bg-accent text-accent-foreground" forceWhiteBackground />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-wide">INPS Portal</p>
            <p className="truncate text-xs text-white/60">Parent Access</p>
          </div>
        )}
      </div>

      <nav aria-label="Parent navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navigation.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={label}
            to={href}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
              isActive && "bg-accent text-accent-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        {onCollapse && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCollapse}
            className={cn("w-full justify-start gap-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white", collapsed && "justify-center px-0")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("size-[18px] transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse menu</span>}
          </Button>
        )}
      </div>
    </aside>
  );
}