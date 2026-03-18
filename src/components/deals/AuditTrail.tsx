'use client'

import { useState } from 'react'
import type { AuditLog } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const AUDIT_ACTION_LABELS: Record<string, string> = {
  deal_created: 'Deal created',
  deal_updated: 'Deal updated',
  deal_completed: 'Deal completed',
  deal_cancelled: 'Deal cancelled',
  party_invited: 'Party invited',
  party_viewed: 'Party viewed documents',
  party_signed: 'Party signed',
  party_declined: 'Party declined',
  document_uploaded: 'Document uploaded',
  document_viewed: 'Document viewed',
  document_downloaded: 'Document downloaded',
  document_deleted: 'Document deleted',
  otp_requested: 'OTP requested',
  otp_verified: 'OTP verified',
  otp_failed: 'OTP verification failed',
  signature_placed: 'Signature placed',
  signature_completed: 'Signature completed',
}

const AUDIT_ICONS: Record<string, string> = {
  deal_created: '📝',
  deal_updated: '✏️',
  deal_completed: '✅',
  deal_cancelled: '❌',
  party_invited: '📨',
  party_viewed: '👁️',
  party_signed: '✍️',
  party_declined: '🚫',
  document_uploaded: '📄',
  document_viewed: '👁️',
  document_downloaded: '⬇️',
  document_deleted: '🗑️',
  otp_requested: '📱',
  otp_verified: '✓',
  otp_failed: '⚠️',
  signature_placed: '✍️',
  signature_completed: '✅',
}

interface AuditTrailProps {
  dealId: string
  logs: AuditLog[]
  onExportEvidence?: () => void
  loading?: boolean
}

export function AuditTrail({ dealId, logs, onExportEvidence, loading }: AuditTrailProps) {
  const [filter, setFilter] = useState<string>('all')
  const uniqueActions = [...new Set(logs.map((l) => l.action))]

  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.action === filter)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          {uniqueActions.map((action) => (
            <Button
              key={action}
              variant={filter === action ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(action)}
            >
              {AUDIT_ACTION_LABELS[action] ?? action}
            </Button>
          ))}
        </div>
        {onExportEvidence && (
          <Button variant="outline" onClick={onExportEvidence}>
            Download Evidence Pack
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="py-12 text-center text-warm-500">No audit events yet</p>
        ) : (
          <div className="space-y-0">
            {filteredLogs.map((log, idx) => (
              <div
                key={log.id}
                className={cn(
                  'flex items-start gap-4 border-warm-100 py-4',
                  idx < filteredLogs.length - 1 ? 'border-b' : ''
                )}
              >
                <span className="text-2xl" role="img" aria-hidden>
                  {AUDIT_ICONS[log.action] ?? '•'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans font-medium text-warm-900">
                    {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                  </p>
                  <p className="mt-1 text-sm text-warm-600">
                    {log.actor_name ?? log.actor_phone ?? 'System'}
                    {log.ip_address && (
                      <span className="ml-2 text-warm-500">• {log.ip_address}</span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-warm-500">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
