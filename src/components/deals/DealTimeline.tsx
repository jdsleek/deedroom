'use client';

import { cn } from '@/lib/utils';
import type { DealStatus } from '@/types';

const STEPS: { status: DealStatus | 'draft'; label: string }[] = [
  { status: 'draft', label: 'Draft' },
  { status: 'sent', label: 'Sent' },
  { status: 'viewing', label: 'Viewing' },
  { status: 'signing', label: 'Signing' },
  { status: 'completed', label: 'Completed' },
];

const STATUS_ORDER: DealStatus[] = ['draft', 'sent', 'viewing', 'signing', 'completed'];

export function DealTimeline({
  status,
  sentAt,
  completedAt,
}: {
  status: DealStatus;
  sentAt?: string | null;
  completedAt?: string | null;
}) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, index) => {
        const stepIndex = STATUS_ORDER.indexOf(step.status as DealStatus);
        const isActive = stepIndex <= currentIndex;
        const isCompleted = stepIndex < currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.status} className="flex flex-1 items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors',
                  isCompleted && 'bg-gold-500 border-gold-500 text-white',
                  isActive && !isCompleted && 'border-gold-500 text-gold-600 bg-gold-50',
                  !isActive && 'border-cream-300 bg-cream-100 text-navy-400'
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium',
                  isActive ? 'text-navy-600' : 'text-navy-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-0.5 -mx-1',
                  isCompleted ? 'bg-gold-500' : 'bg-cream-300'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
