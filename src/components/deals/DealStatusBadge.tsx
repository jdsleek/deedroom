'use client';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { DealStatus } from '@/types';
import { DEAL_STATUS_CONFIG } from '@/types';

export function DealStatusBadge({ status }: { status: DealStatus | string }) {
  const config = DEAL_STATUS_CONFIG[status as DealStatus] ?? { label: status, color: 'gray' };
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        status === 'draft' && 'bg-warm-100 text-warm-600',
        status === 'sent' && 'bg-blue-50 text-blue-600',
        status === 'viewing' && 'bg-purple-50 text-purple-600',
        status === 'signing' && 'bg-amber-50 text-amber-600',
        status === 'completed' && 'bg-teal-50 text-teal-700',
        status === 'cancelled' && 'bg-red-50 text-red-600'
      )}
    >
      {config.label}
    </Badge>
  );
}
