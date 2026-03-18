'use client'

import { useState } from 'react'
import { DocumentCard } from './DocumentCard'
import { UploadDropzone, type UploadConfig } from './UploadDropzone'
import { TemplateSelector } from './TemplateSelector'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Document as DocType, DocCategory, DealType } from '@/types'

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
  dealType?: DealType
  documents: DocType[]
  canManage?: boolean
  onRefresh: () => void
}

export function DocumentVault({ dealId, dealType = 'rent', documents, canManage = true, onRefresh }: DocumentVaultProps) {
  const [category, setCategory] = useState<DocCategory | 'all'>('all')
  const [uploadModal, setUploadModal] = useState(false)
  const [templateModal, setTemplateModal] = useState(false)
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
    <div className="space-y-6">
      {/* Category pills + count + upload */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === c
                  ? 'bg-coral-500 text-white'
                  : 'border border-warm-200 bg-white text-warm-600 hover:border-warm-300 hover:text-warm-800'
              }`}
            >
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-sm text-warm-600">
            {filtered.length} document{filtered.length !== 1 ? 's' : ''}
          </p>
          {canManage && (
            <>
              <Button variant="outline" onClick={() => setTemplateModal(true)}>
                Use Template
              </Button>
              <Button onClick={() => setUploadModal(true)}>
                Upload Document
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="rounded-2xl border-2 border-dashed border-warm-200 bg-warm-50 py-16 text-center text-warm-500">
          {category === 'all' ? 'No documents yet' : `No ${CATEGORY_LABELS[category]} documents`}
        </div>
      )}

      <Modal isOpen={uploadModal} onClose={() => !uploading && setUploadModal(false)} title="Upload Document">
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

      <Modal isOpen={templateModal} onClose={() => setTemplateModal(false)} title="Generate from Template" className="lg:max-w-2xl">
        <TemplateSelector
          dealId={dealId}
          dealType={dealType}
          onGenerated={() => {
            setTemplateModal(false)
            onRefresh()
          }}
          onClose={() => setTemplateModal(false)}
        />
      </Modal>
    </div>
  )
}
