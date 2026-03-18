'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DealStatusBadge } from './DealStatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatNaira } from '@/types';
import type { Deal } from '@/types';

interface DealCardProps {
  deal: {
    id: string;
    deal_type: string;
    status: string;
    title: string;
    property_address: string;
    created_at: string;
    rent_amount?: number | null;
    sale_price?: number | null;
    rent_period?: string | null;
    party_count?: number;
    doc_count?: number;
    signed_count?: number;
    parties?: Array<{ id: string; status: string }>;
    documents?: Array<{ id: string }>;
  };
}

export function DealCard({ deal }: DealCardProps) {
  const partyCount = deal.party_count ?? deal.parties?.length ?? 0;
  const docCount = deal.doc_count ?? deal.documents?.length ?? 0;
  const signedCount = deal.signed_count ?? deal.parties?.filter((p) => p.status === 'signed').length ?? 0;
  const progress = partyCount > 0 ? (signedCount / partyCount) * 100 : 0;

  const amount =
    deal.deal_type === 'rent'
      ? deal.rent_amount ?? 0
      : deal.sale_price ?? 0;

  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="p-5 hover:shadow-raised transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-navy-600 text-lg truncate">
              {deal.title}
            </h3>
            <p className="text-sm text-navy-400 mt-0.5 truncate">
              {deal.property_address}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <DealStatusBadge status={deal.status} />
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-navy-100 text-navy-600">
                {deal.deal_type === 'rent' ? 'Rent' : 'Sale'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-navy-400">
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4" />
            {partyCount} {partyCount === 1 ? 'party' : 'parties'}
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {docCount} {docCount === 1 ? 'doc' : 'docs'}
          </span>
        </div>

        {amount > 0 && (
          <p className="text-sm font-medium text-navy-600 mt-2">
            {formatNaira(amount)}
            {deal.deal_type === 'rent' && deal.rent_period && `/${deal.rent_period}`}
          </p>
        )}

        {(deal.status === 'signing' || deal.status === 'viewing' || deal.status === 'sent') && (
          <div className="mt-3">
            <ProgressBar value={progress} className="h-1.5" />
            <p className="text-xs text-navy-400 mt-1">
              {signedCount} of {partyCount} signed
            </p>
          </div>
        )}

        <p className="text-xs text-navy-400 mt-3">
          Created {format(new Date(deal.created_at), 'MMM d, yyyy')}
        </p>
      </Card>
    </Link>
  );
}
