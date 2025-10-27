import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export const Badge = ({ children, className }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200',
      className
    )}
  >
    {children}
  </span>
);
