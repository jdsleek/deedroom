'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Upload, FileText } from 'lucide-react'
import type { DocCategory } from '@/types'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

const DOC_CATEGORIES: { value: DocCategory; label: string }[] = [
  { value: 'id', label: 'ID Document' },
  { value: 'cac', label: 'CAC' },
  { value: 'survey', label: 'Survey' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'approval', label: 'Approval' },
  { value: 'other', label: 'Other' },
]

export interface UploadConfig {
  category: DocCategory
  permission: 'view_only' | 'download'
  watermark: boolean
  expiresAt?: string
}

interface UploadDropzoneProps {
  onFileSelect: (file: File, config: UploadConfig) => void
  config: UploadConfig
  onConfigChange: (config: UploadConfig) => void
  disabled?: boolean
  className?: string
}

export function UploadDropzone({
  onFileSelect,
  config,
  onConfigChange,
  disabled,
  className,
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) onFileSelect(file, config)
    },
    [config, onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled,
  })

  const selectedFile = acceptedFiles[0]

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
          isDragActive ? 'border-coral-400 bg-coral-50' : 'border-warm-300 bg-warm-50 hover:border-warm-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto size-10 text-coral-500 mb-2" />
        <p className="font-medium text-warm-700">
          {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
        </p>
        <p className="mt-1 text-sm text-warm-500">
          PDF, DOCX, JPG, PNG, WEBP — max 20MB
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center gap-3 rounded-xl border border-warm-200 bg-warm-50 p-3">
          <FileText className="size-5 shrink-0 text-warm-600" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-warm-900 truncate">{selectedFile.name}</p>
            <p className="text-sm text-warm-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-700">Category</label>
          <select
            value={config.category}
            onChange={(e) => onConfigChange({ ...config, category: e.target.value as DocCategory })}
            className="w-full rounded-xl border border-warm-200 bg-white px-3 py-2.5 text-warm-800 transition-colors focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
          >
            {DOC_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-700">Permission</label>
          <select
            value={config.permission}
            onChange={(e) => onConfigChange({ ...config, permission: e.target.value as 'view_only' | 'download' })}
            className="w-full rounded-xl border border-warm-200 bg-white px-3 py-2.5 text-warm-800 transition-colors focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
          >
            <option value="view_only">View only</option>
            <option value="download">Download</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={config.watermark}
              onChange={(e) => onConfigChange({ ...config, watermark: e.target.checked })}
              className="rounded border-warm-300 text-coral-500 focus:ring-coral-500"
            />
            <span className="text-sm font-medium text-warm-700">Apply DRAFT watermark</span>
          </label>
        </div>
      </div>
    </div>
  )
}
