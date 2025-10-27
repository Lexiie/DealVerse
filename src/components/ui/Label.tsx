import { LabelHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label = ({ className, required, children, ...props }: LabelProps) => (
  <label
    className={cn('text-sm font-medium text-slate-300', className)}
    {...props}
  >
    {children}
    {required ? <span className="text-red-400"> *</span> : null}
  </label>
);
