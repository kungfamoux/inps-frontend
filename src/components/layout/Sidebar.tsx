import {
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  User,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SchoolLogo } from '@/components/shared/SchoolLogo';

const navigation = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: GraduationCap },
  { label: 'Staff', href: '/admin/staff', icon: UserRoundCheck },
  { label: 'Parents', href: '/admin/parents', icon: UsersRound },
  { label: 'Classes', href: '/admin/classes', icon: Building2 },
  { label: 'Subjects', href: '/admin/subjects', icon: BookOpenCheck },
  {
    label: 'Class Teachers',
    href: '/admin/assignments/class-teachers',
    icon: User,
  },
  {
    label: 'Subject Teachers',
    href: '/admin/assignments/subject-teachers',
    icon: Layers,
  },
  {
    label: 'Academic Years',
    href: '/admin/academic-years',
    icon: CalendarDays,
  },
  { label: 'Results', href: '/admin/results', icon: WalletCards },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({
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
              School Administration
            </p>
          </div>
        )}
      </div>

      <nav
        aria-label="Admin navigation"
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
        {onCollapse && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCollapse}
            className={cn(
              'w-full justify-start gap-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-0',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(
                'size-[18px] transition-transform',
                collapsed && 'rotate-180',
              )}
            />
            {!collapsed && <span>Collapse menu</span>}
          </Button>
        )}
      </div>
    </aside>
  );
}
