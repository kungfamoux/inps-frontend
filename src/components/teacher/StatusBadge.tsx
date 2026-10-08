import { AttendanceStatus } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

const statusConfig = {
  PRESENT: {
    label: 'Present',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    dotColor: 'bg-green-500',
  },
  ABSENT: {
    label: 'Absent',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-300',
    dotColor: 'bg-red-500',
  },
  LATE: {
    label: 'Late',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-800 dark:text-yellow-300',
    dotColor: 'bg-yellow-500',
  },
  EXCUSED: {
    label: 'Excused',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-800 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
}
