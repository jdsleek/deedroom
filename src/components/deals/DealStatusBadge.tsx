'use client';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { DealStatus } from '@/types';
import { DEAL_STATUS_CONFIG } from '@/types';

export function DealStatusBadge({ status }: { status: DealStatus }) {
  const config = DEAL_STATUS_CONFIG[status] ?? { label: status, color: 'gray' };
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        status === 'draft' && 'bg-slate-100 text-slate-600 border-slate-200',
        status === 'sent' && 'bg-blue-50 text-blue-600 border-blue-200',
        status === 'viewing' && 'bg-purple-50 text-purple-600 border-purple-200',
        status === 'signing' && 'bg-amber-50 text-amber-600 border-amber-200',
        status === 'completed' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
        status === 'cancelled' && 'bg-red-50 text-red-600 border-red-200'
      )}
    >
      {config.label}
    </Badge>
  );
}
