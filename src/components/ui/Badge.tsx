'use client';

import { cn } from '@/lib/utils';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'soft';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-slate-100 text-slate-500': variant === 'default',
          'bg-emerald-50 text-emerald-700': variant === 'success',
          'bg-amber-50 text-amber-600': variant === 'warning',
          'bg-red-50 text-red-600': variant === 'danger',
          'bg-blue-50 text-blue-600': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
