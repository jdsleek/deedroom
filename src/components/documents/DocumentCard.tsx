'use client'

import { type Document } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { formatFileSize } from '@/lib/utils'
import { FileText, Download, Eye, Trash2 } from 'lucide-react'

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
  isCreator?: boolean
}

export function DocumentCard({ doc, onView, onDownload, onDelete, isCreator }: DocumentCardProps) {
  const canDownload = doc.permission === 'download'

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
            {doc.file_size != null && (
              <span className="text-xs text-warm-500">{formatFileSize(doc.file_size)}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
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
    </div>
  )
}
