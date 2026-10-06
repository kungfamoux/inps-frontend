import {
  BookOpenCheck,
  CalendarDays,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  UserRoundCheck,
  GraduationCap,
  FileText,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SchoolLogo } from '@/components/shared/SchoolLogo';

const navigation = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'My Students', href: '/teacher/students', icon: GraduationCap },
  { label: 'Results', href: '/teacher/results', icon: FileText },
  { label: 'Attendance', href: '/teacher/attendance', icon: Users },
  { label: 'Schedule', href: '/teacher/schedule', icon: CalendarDays },
  { label: 'Settings', href: '/teacher/settings', icon: Settings },
];

interface TeacherSidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  onNavigate?: () => void;
}

export function TeacherSidebar({
  collapsed = false,
  onCollapse,
  onNavigate,
}: TeacherSidebarProps) {
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
              Teacher Portal
            </p>
          </div>
        )}
      </div>

      <nav
        aria-label="Teacher navigation"
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className={cn(
            'w-full justify-start text-white/70 hover:bg-white/10 hover:text-white',
            collapsed && 'justify-center px-0',
          )}
        >
          <ChevronLeft
            className={cn(
              'size-4 shrink-0 transition-transform',
              collapsed && 'rotate-180',
            )}
            aria-hidden="true"
          />
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
