'use client'

import { type Document } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn, formatFileSize } from '@/lib/utils'
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
    <Card className="p-4 hover:shadow-raised transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-navy-50 text-navy-600">
          <FileText className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-navy-800 truncate">{doc.name}</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="outline" className="text-xs">
              {DOC_CATEGORY_LABELS[doc.category] ?? doc.category}
            </Badge>
            <Badge variant="soft" className={doc.is_executed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
              {doc.is_executed ? 'Executed' : 'Draft'}
            </Badge>
            {doc.file_size != null && (
              <span className="text-xs text-navy-400">{formatFileSize(doc.file_size)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onView} aria-label="View">
            <Eye className="size-4" />
          </Button>
          {canDownload && (
            <Button variant="ghost" size="sm" onClick={onDownload} aria-label="Download">
              <Download className="size-4" />
            </Button>
          )}
          {isCreator && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:bg-red-50" aria-label="Delete">
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
