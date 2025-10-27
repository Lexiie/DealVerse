import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type CardProps = {
  className?: string;
  children: ReactNode;
};

type CardHeaderProps = {
  className?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

type CardContentProps = {
  className?: string;
  children: ReactNode;
};

export const Card = ({ className, children }: CardProps) => (
  <div className={cn('rounded-2xl border border-slate-800/70 bg-slate-900/75 p-6 shadow-lg backdrop-blur-lg', className)}>
    {children}
  </div>
);

export const CardHeader = ({ className, title, subtitle, children }: CardHeaderProps) => (
  <div className={cn('mb-4 flex flex-col gap-1', className)}>
    {title ? <h3 className="text-lg font-semibold text-foreground">{title}</h3> : null}
    {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
    {children}
  </div>
);

export const CardContent = ({ className, children }: CardContentProps) => (
  <div className={cn('space-y-4', className)}>{children}</div>
);
