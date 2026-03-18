'use client'

import { useState } from 'react'
import { type Document } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { formatFileSize } from '@/lib/utils'
import { FileText, Download, Eye, Trash2, CheckCircle2, Share2, Copy, Check, X } from 'lucide-react'

const DOC_CATEGORY_LABELS: Record<string, string> = {
  id: 'ID Document',
  cac: 'CAC',
  survey: 'Survey',
  agreement: 'Agreement',
  receipt: 'Receipt',
  checklist: 'Checklist',
  approval: 'Approval',
  other: 'Other',
}

interface DocumentCardProps {
  doc: Document
  onView?: () => void
  onDownload?: () => void
  onDelete?: () => void
  onMarkReviewed?: () => void
  isReviewing?: boolean
  isCreator?: boolean
}

export function DocumentCard({ doc, onView, onDownload, onDelete, onMarkReviewed, isReviewing, isCreator }: DocumentCardProps) {
  const canDownload = doc.permission === 'download'
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async (hours: number) => {
    setSharing(true)
    try {
      const res = await fetch(`/api/documents/${doc.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiry_hours: hours }),
      })
      const json = await res.json()
      if (json.data?.url) setShareUrl(json.data.url)
    } catch { /* ignore */ }
    finally { setSharing(false) }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral-50 text-coral-500">
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-warm-900 truncate">{doc.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {DOC_CATEGORY_LABELS[doc.category] ?? doc.category}
            </Badge>
            <Badge variant={doc.is_executed ? 'success' : 'secondary'} className="text-xs">
              {doc.is_executed ? 'Executed' : 'Draft'}
            </Badge>
            {doc.reviewed_by && (
              <Badge variant="outline" className="text-xs text-coral-600 border-coral-200 bg-coral-50">
                Reviewed by {doc.reviewed_by.full_name ?? 'Unknown'}
              </Badge>
            )}
            {doc.file_size != null && (
              <span className="text-xs text-warm-500">{formatFileSize(doc.file_size)}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          {onMarkReviewed && (
            <button
              type="button"
              onClick={onMarkReviewed}
              disabled={isReviewing}
              aria-label="Mark as Reviewed"
              className="rounded-lg p-2 text-coral-500 hover:bg-coral-50 hover:text-coral-600 transition-colors disabled:opacity-50"
              title="Mark as Reviewed"
            >
              <CheckCircle2 className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onView}
            aria-label="View"
            className="rounded-lg p-2 text-warm-400 hover:bg-warm-50 hover:text-warm-600 transition-colors"
          >
            <Eye className="size-4" />
          </button>
          {canDownload && (
            <button
              type="button"
              onClick={onDownload}
              aria-label="Download"
              className="rounded-lg p-2 text-warm-400 hover:bg-warm-50 hover:text-warm-600 transition-colors"
            >
              <Download className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => { setShowShareModal(true); setShareUrl(null); setCopied(false) }}
            aria-label="Share"
            className="rounded-lg p-2 text-warm-400 hover:bg-warm-50 hover:text-warm-600 transition-colors"
          >
            <Share2 className="size-4" />
          </button>
          {isCreator && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete"
              className="rounded-lg p-2 text-warm-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {showShareModal && (
        <div className="mt-3 rounded-xl border border-warm-200 bg-warm-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-warm-900">Share document</p>
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="rounded-lg p-1 text-warm-400 hover:bg-warm-100 hover:text-warm-600 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {!shareUrl ? (
            <div className="flex flex-wrap gap-2">
              <p className="w-full text-xs text-warm-500 mb-1">Generate a link that expires in:</p>
              {[
                { label: '1 hour', hours: 1 },
                { label: '24 hours', hours: 24 },
                { label: '7 days', hours: 168 },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => handleShare(opt.hours)}
                  disabled={sharing}
                  className="rounded-lg border border-warm-200 bg-white px-3 py-1.5 text-xs font-medium text-warm-700 hover:bg-coral-50 hover:text-coral-600 hover:border-coral-200 transition-colors disabled:opacity-50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-lg border border-warm-200 bg-white px-3 py-1.5 text-xs text-warm-700 truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-warm-200 bg-white px-3 py-1.5 text-xs font-medium text-warm-700 hover:bg-coral-50 hover:text-coral-600 hover:border-coral-200 transition-colors"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShareUrl(null)}
                className="text-xs text-warm-500 hover:text-warm-700 transition-colors"
              >
                Generate a different link
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
