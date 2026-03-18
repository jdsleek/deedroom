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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-warm-100 text-warm-600': variant === 'default',
          'bg-teal-50 text-teal-700': variant === 'success',
          'bg-amber-50 text-amber-700': variant === 'warning',
          'bg-red-50 text-red-600': variant === 'danger',
          'bg-blue-50 text-blue-600': variant === 'info',
          'bg-warm-100 text-warm-500': variant === 'secondary',
          'border border-warm-200 text-warm-600': variant === 'outline',
          'bg-warm-50 text-warm-600': variant === 'soft',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
