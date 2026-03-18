'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PARTY_ROLE_LABELS } from '@/types';
import type { DealParty } from '@/types';

interface PartyListProps {
  parties: DealParty[];
  onInvite?: () => void;
  canInvite?: boolean;
  currentUserId?: string;
}

const PARTY_STATUS_STYLES: Record<string, string> = {
  invited: 'bg-warm-100 text-warm-600',
  viewed: 'bg-blue-50 text-blue-600',
  signing: 'bg-amber-50 text-amber-600',
  signed: 'bg-teal-50 text-teal-700',
  declined: 'bg-red-50 text-red-600',
};

export function PartyList({
  parties,
  onInvite,
  canInvite = false,
  currentUserId,
}: PartyListProps) {
  const router = useRouter();
  const [decliningId, setDecliningId] = useState<string | null>(null);

  async function handleDecline(partyId: string) {
    if (!confirm('Are you sure you want to decline this invite?')) return;
    setDecliningId(partyId);
    try {
      const res = await fetch(`/api/parties/${partyId}/decline`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.error ?? 'Failed to decline');
        return;
      }
      router.refresh();
    } finally {
      setDecliningId(null);
    }
  }
  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-warm-800">Parties</h3>
        {canInvite && onInvite && (
          <Button size="sm" onClick={onInvite}>
            + Invite Party
          </Button>
        )}
      </div>

      {parties.length === 0 ? (
        <div className="text-center py-8 text-warm-600 text-sm border border-dashed border-warm-200 rounded-2xl bg-warm-50">
          No parties invited yet.
          {canInvite && (
            <Button variant="outline" size="sm" className="mt-2" onClick={onInvite}>
              Invite first party
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {parties.map((party) => (
            <li
              key={party.id}
              className="flex items-center justify-between p-3 bg-warm-50 rounded-2xl border border-warm-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-coral-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-warm-800 truncate">
                    {party.invite_name}
                  </p>
                  <p className="text-xs text-warm-600">
                    {PARTY_ROLE_LABELS[party.role]}
                  </p>
                  {(party.invite_phone || party.invite_email) && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-warm-500">
                      {party.invite_phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {party.invite_phone}
                        </span>
                      )}
                      {party.invite_email && (
                        <span className="inline-flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {party.invite_email}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <Badge
                  variant="outline"
                  className={PARTY_STATUS_STYLES[party.status] ?? 'bg-warm-100 text-warm-600'}
                >
                  {party.status}
                </Badge>
                {currentUserId &&
                  party.user_id === currentUserId &&
                  party.status !== 'signed' &&
                  party.status !== 'declined' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={decliningId === party.id}
                      onClick={() => handleDecline(party.id)}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      {decliningId === party.id ? 'Declining…' : 'Decline'}
                    </Button>
                  )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
