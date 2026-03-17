'use client';

import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-cream-300',
        className
      )}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gold-500 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
