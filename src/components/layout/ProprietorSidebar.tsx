import {
  LayoutDashboard,
  DollarSign,
  UsersRound,
  GraduationCap,
  TrendingUp,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SchoolLogo } from '@/components/shared/SchoolLogo';

const navigation = [
  { label: 'Dashboard', href: '/proprietor/dashboard', icon: LayoutDashboard },
  { label: 'Financial Analytics', href: '/proprietor/financial-analytics', icon: DollarSign },
  { label: 'Staff Overview', href: '/proprietor/staff', icon: UsersRound },
  { label: 'Staff Statistics', href: '/proprietor/staff/statistics', icon: UsersRound },
  { label: 'Students Overview', href: '/proprietor/students/enrollment', icon: GraduationCap },
  { label: 'Students List', href: '/proprietor/students/list', icon: GraduationCap },
  { label: 'Parents List', href: '/proprietor/parents/list', icon: UsersRound },
  { label: 'Academic Performance', href: '/proprietor/academic-performance', icon: TrendingUp },
  { label: 'Settings', href: '/proprietor/settings', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  onNavigate?: () => void;
}

export function ProprietorSidebar({
  collapsed = false,
  onCollapse,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="flex h-full flex-col bg-primary text-primary-foreground">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <SchoolLogo
          size="medium"
          variant={collapsed ? 'icon' : 'full'}
          showBackground
          backgroundClassName="bg-accent text-accent-foreground"
          forceWhiteBackground
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-wide">
              INPS Portal
            </p>
            <p className="truncate text-xs text-white/60">
              Proprietor
            </p>
          </div>
        )}
      </div>

      <nav
        aria-label="Proprietor navigation"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
      >
        {navigation.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={label}
            to={href}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white',
                isActive &&
                  'bg-accent text-accent-foreground shadow-sm hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-0',
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={onCollapse}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft
            className={cn(
              'size-4 transition-transform',
              collapsed && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </div>
    </aside>
  );
}
