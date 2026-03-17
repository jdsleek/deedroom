'use client'

import { useState } from 'react'
import { DocumentCard } from './DocumentCard'
import { UploadDropzone, type UploadConfig } from './UploadDropzone'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Document as DocType, DocCategory } from '@/types'

const CATEGORIES: (DocCategory | 'all')[] = ['all', 'agreement', 'id', 'cac', 'survey', 'receipt', 'checklist', 'approval', 'other']
const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  agreement: 'Agreement',
  id: 'ID Document',
  cac: 'CAC',
  survey: 'Survey',
  receipt: 'Receipt',
  checklist: 'Checklist',
  approval: 'Approval',
  other: 'Other',
}

interface DocumentVaultProps {
  dealId: string
  documents: DocType[]
  canManage?: boolean
  onRefresh: () => void
}

export function DocumentVault({ dealId, documents, canManage = true, onRefresh }: DocumentVaultProps) {
  const [category, setCategory] = useState<DocCategory | 'all'>('all')
  const [uploadModal, setUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadConfig, setUploadConfig] = useState<UploadConfig>({
    category: 'other',
    permission: 'view_only',
    watermark: true,
  })

  const filtered = category === 'all'
    ? documents
    : documents.filter((d) => d.category === category)

  const handleUpload = async (file: File, config: UploadConfig) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('deal_id', dealId)
      formData.append('name', file.name)
      formData.append('category', config.category)
      formData.append('permission', config.permission)
      formData.append('watermark', String(config.watermark))
      if (config.expiresAt) formData.append('expires_at', config.expiresAt)
      formData.append('file', file)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      onRefresh()
      setUploadModal(false)
    } catch (e) {
      console.error(e)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleView = async (doc: DocType) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}`)
      const { data } = await res.json()
      if (data?.url) window.open(data.url, '_blank')
    } catch (e) {
      console.error(e)
    }
  }

  const handleDownload = async (doc: DocType) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}?action=download`)
      const { data } = await res.json()
      if (data?.url) window.open(data.url, '_blank')
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (doc: DocType) => {
    if (!confirm('Delete this document?')) return
    try {
      await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
      onRefresh()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex gap-6">
      <aside className="w-48 shrink-0">
        <p className="text-sm font-medium text-navy-700 mb-2">Categories</p>
        <nav className="space-y-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                category === c ? 'bg-gold-100 text-gold-800 font-medium' : 'text-navy-600 hover:bg-cream-200'
              }`}
            >
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-navy-600">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>
          {canManage && (
            <Button onClick={() => setUploadModal(true)}>
              Upload Document
            </Button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onView={() => handleView(doc)}
              onDownload={() => handleDownload(doc)}
              onDelete={() => handleDelete(doc)}
              isCreator={canManage}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-navy-400">
            {category === 'all' ? 'No documents yet' : `No ${CATEGORY_LABELS[category]} documents`}
          </div>
        )}
      </div>

      <Modal open={uploadModal} onClose={() => !uploading && setUploadModal(false)} title="Upload Document">
        {uploading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <UploadDropzone
            onFileSelect={handleUpload}
            config={uploadConfig}
            onConfigChange={setUploadConfig}
          />
        )}
      </Modal>
    </div>
  )
}
